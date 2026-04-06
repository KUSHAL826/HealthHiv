#!/usr/bin/env python3
"""
HealthViz AI Analysis Module
Reads JSON health entries from stdin, performs statistical analysis,
anomaly detection, and trend analysis. Outputs JSON to stdout.

Usage: python analyze.py < data.json
  OR   echo '[...]' | python analyze.py
"""

import sys
import json
import warnings
import pandas as pd
import numpy as np
from datetime import datetime
from insights import generate_insights

warnings.filterwarnings('ignore')

def parse_entries(raw_entries):
    """Parse MongoDB JSON entries into a flat DataFrame."""
    rows = []
    for e in raw_entries:
        row = {}
        row['date'] = pd.to_datetime(e.get('date', ''))

        # Heart rate
        hr = e.get('heartRate') or {}
        row['heart_rate_avg'] = hr.get('avg')
        row['heart_rate_min'] = hr.get('min')
        row['heart_rate_max'] = hr.get('max')

        # Blood pressure
        bp = e.get('bloodPressure') or {}
        row['bp_systolic'] = bp.get('systolic')
        row['bp_diastolic'] = bp.get('diastolic')

        # Activity
        row['steps'] = e.get('steps')
        row['active_minutes'] = e.get('activeMinutes')
        row['calories_burned'] = e.get('caloriesBurned')
        row['distance_km'] = e.get('distanceKm')

        # Sleep
        row['sleep_hours'] = e.get('sleepHours')
        row['sleep_quality'] = e.get('sleepQuality')

        # Body
        row['weight_kg'] = e.get('weightKg')
        row['body_fat_pct'] = e.get('bodyFatPct')
        row['bmi'] = e.get('bmi')

        # Nutrition
        row['calories_consumed'] = e.get('caloriesConsumed')
        row['water_litres'] = e.get('waterLitres')

        # Other vitals
        row['blood_glucose'] = e.get('bloodGlucose')
        row['oxygen_saturation'] = e.get('oxygenSaturation')

        rows.append(row)

    df = pd.DataFrame(rows)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)

    # Convert numeric columns
    numeric_cols = [c for c in df.columns if c != 'date' and c != 'sleep_quality']
    df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors='coerce')

    return df


def detect_anomalies(df):
    """Z-score based anomaly detection per metric."""
    alerts = []
    thresholds = {
        'heart_rate_avg': {'low': 40, 'high': 100, 'label': 'Heart Rate (avg)', 'unit': 'bpm'},
        'heart_rate_max': {'low': None, 'high': 150, 'label': 'Heart Rate (max)', 'unit': 'bpm'},
        'bp_systolic':    {'low': 90,  'high': 140, 'label': 'Systolic BP', 'unit': 'mmHg'},
        'bp_diastolic':   {'low': 60,  'high': 90,  'label': 'Diastolic BP', 'unit': 'mmHg'},
        'sleep_hours':    {'low': 6,   'high': None, 'label': 'Sleep', 'unit': 'hrs'},
        'blood_glucose':  {'low': 70,  'high': 140, 'label': 'Blood Glucose', 'unit': 'mg/dL'},
        'oxygen_saturation': {'low': 94, 'high': None, 'label': 'SpO2', 'unit': '%'},
    }

    for col, limits in thresholds.items():
        if col not in df.columns:
            continue
        series = df[col].dropna()
        if len(series) < 2:
            continue

        # Z-score anomalies
        mean = series.mean()
        std = series.std()
        if std > 0:
            z_scores = (series - mean) / std
            anomaly_idx = z_scores[abs(z_scores) > 2.5].index
            for idx in anomaly_idx:
                val = df.loc[idx, col]
                date = df.loc[idx, 'date']
                severity = 'critical' if abs(z_scores[idx]) > 3.5 else 'warning'
                alerts.append({
                    'severity': severity,
                    'metric': col,
                    'message': f"{limits['label']} anomaly: {val:.1f} {limits['unit']} (mean: {mean:.1f})",
                    'value': float(val),
                    'date': date.isoformat() if pd.notna(date) else None
                })

        # Threshold-based alerts
        latest = series.iloc[-3:].mean()  # rolling 3-day avg
        if limits['low'] is not None and latest < limits['low']:
            alerts.append({
                'severity': 'warning',
                'metric': col,
                'message': f"Low {limits['label']}: recent avg {latest:.1f} {limits['unit']} (normal ≥ {limits['low']})",
                'value': float(latest),
                'date': df['date'].iloc[-1].isoformat()
            })
        if limits['high'] is not None and latest > limits['high']:
            alerts.append({
                'severity': 'warning',
                'metric': col,
                'message': f"High {limits['label']}: recent avg {latest:.1f} {limits['unit']} (normal ≤ {limits['high']})",
                'value': float(latest),
                'date': df['date'].iloc[-1].isoformat()
            })

    # Sleep deficiency streak
    if 'sleep_hours' in df.columns:
        sleep = df['sleep_hours'].dropna()
        if len(sleep) >= 7:
            recent_sleep = sleep.iloc[-7:].mean()
            if recent_sleep < 6.5:
                alerts.append({
                    'severity': 'critical',
                    'metric': 'sleep_hours',
                    'message': f"Chronic sleep deficiency: avg {recent_sleep:.1f} hrs over last 7 days (recommended: 7–9 hrs)",
                    'value': float(recent_sleep),
                    'date': df['date'].iloc[-1].isoformat()
                })

    # Low activity
    if 'steps' in df.columns:
        recent_steps = df['steps'].iloc[-7:].mean()
        if pd.notna(recent_steps) and recent_steps < 5000:
            alerts.append({
                'severity': 'warning',
                'metric': 'steps',
                'message': f"Low physical activity: avg {recent_steps:.0f} steps/day over last 7 days (recommended: 8,000+)",
                'value': float(recent_steps),
                'date': df['date'].iloc[-1].isoformat()
            })

    # Weight fluctuation
    if 'weight_kg' in df.columns:
        w = df['weight_kg'].dropna()
        if len(w) >= 14:
            range_14d = w.iloc[-14:].max() - w.iloc[-14:].min()
            if range_14d > 3.0:
                alerts.append({
                    'severity': 'warning',
                    'metric': 'weight_kg',
                    'message': f"Significant weight fluctuation: {range_14d:.1f} kg variation over 14 days",
                    'value': float(range_14d),
                    'date': df['date'].iloc[-1].isoformat()
                })

    # Deduplicate
    seen = set()
    unique_alerts = []
    for a in alerts:
        key = (a['metric'], a['message'][:40])
        if key not in seen:
            seen.add(key)
            unique_alerts.append(a)

    return unique_alerts


def compute_trends(df):
    """Linear regression trend per metric over available data."""
    trends = []
    metrics = {
        'heart_rate_avg': 'Heart Rate',
        'steps': 'Daily Steps',
        'sleep_hours': 'Sleep Duration',
        'calories_burned': 'Calories Burned',
        'weight_kg': 'Weight',
        'bp_systolic': 'Systolic BP',
    }

    for col, label in metrics.items():
        if col not in df.columns:
            continue
        series = df[col].dropna()
        if len(series) < 5:
            continue

        x = np.arange(len(series))
        y = series.values
        slope, intercept = np.polyfit(x, y, 1)

        # Calculate percent change over period
        predicted_start = intercept
        predicted_end = slope * (len(series) - 1) + intercept
        if predicted_start != 0:
            pct_change = ((predicted_end - predicted_start) / abs(predicted_start)) * 100
        else:
            pct_change = 0

        # Classify direction (only flag meaningful changes)
        if abs(pct_change) < 2:
            direction = 'stable'
        elif slope > 0:
            direction = 'improving' if col in ['steps', 'sleep_hours', 'calories_burned'] else 'declining'
        else:
            direction = 'declining' if col in ['steps', 'sleep_hours', 'calories_burned'] else 'improving'

        # For weight and BP, decreasing may be improving
        if col in ['weight_kg', 'bp_systolic', 'bp_diastolic']:
            direction = 'improving' if slope < 0 else ('declining' if abs(pct_change) > 2 else 'stable')

        trend_messages = {
            'improving': f"{label} shows a positive trend (+{abs(pct_change):.1f}% over the period)",
            'declining': f"{label} shows a declining trend ({pct_change:.1f}% over the period)",
            'stable': f"{label} is stable (±{abs(pct_change):.1f}% variation)"
        }

        trends.append({
            'metric': col,
            'direction': direction,
            'changePercent': round(pct_change, 1),
            'message': trend_messages[direction]
        })

    return trends


def compute_stats(df):
    """Return basic stats for each numeric metric."""
    stats = {}
    numeric_cols = [c for c in df.columns if c not in ('date', 'sleep_quality')]
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) == 0:
            continue
        stats[col] = {
            'mean': round(series.mean(), 1),
            'min': round(series.min(), 1),
            'max': round(series.max(), 1),
            'std': round(series.std(), 1),
            'count': int(len(series))
        }
    return stats


def main():
    raw_input = sys.stdin.read().strip()
    if not raw_input:
        print(json.dumps({'error': 'No input data'}))
        sys.exit(1)

    try:
        entries = json.loads(raw_input)
    except json.JSONDecodeError as e:
        print(json.dumps({'error': f'Invalid JSON: {str(e)}'}))
        sys.exit(1)

    df = parse_entries(entries)
    alerts = detect_anomalies(df)
    trends = compute_trends(df)
    stats = compute_stats(df)
    summary, recommendations = generate_insights(df, alerts, trends)

    output = {
        'generatedAt': datetime.utcnow().isoformat(),
        'dataPoints': len(df),
        'period': {
            'from': df['date'].min().isoformat() if len(df) > 0 else None,
            'to': df['date'].max().isoformat() if len(df) > 0 else None
        },
        'summary': summary,
        'alerts': alerts,
        'trends': trends,
        'recommendations': recommendations,
        'stats': stats
    }

    print(json.dumps(output))


if __name__ == '__main__':
    main()
