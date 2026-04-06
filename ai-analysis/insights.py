"""
HealthViz NL Insight Generator
Converts statistical analysis results into readable health summaries.
"""

import pandas as pd
import numpy as np


def generate_insights(df, alerts, trends):
    """
    Generate a natural-language summary and actionable recommendations.

    Returns:
        summary (str): A paragraph summarizing the user's health
        recommendations (list[str]): Actionable recommendations
    """
    parts = []
    recommendations = []

    n_days = len(df)
    if n_days == 0:
        return "No data available to analyze.", []

    # ── Overview sentence ─────────────────────────────────────
    parts.append(f"Analysis covers {n_days} days of your health data.")

    # ── Heart Rate ────────────────────────────────────────────
    if 'heart_rate_avg' in df.columns:
        hr = df['heart_rate_avg'].dropna()
        if len(hr) > 0:
            avg_hr = hr.mean()
            if avg_hr < 60:
                parts.append(f"Your average resting heart rate is {avg_hr:.0f} bpm — excellent cardiovascular fitness.")
            elif avg_hr <= 80:
                parts.append(f"Your average heart rate of {avg_hr:.0f} bpm is within a healthy range.")
            else:
                parts.append(f"Your average heart rate of {avg_hr:.0f} bpm is slightly elevated — consider cardiovascular exercise.")
                recommendations.append("Incorporate 30 minutes of moderate cardio (brisk walk, cycling) most days to lower resting heart rate.")

    # ── Sleep ─────────────────────────────────────────────────
    if 'sleep_hours' in df.columns:
        sleep = df['sleep_hours'].dropna()
        if len(sleep) > 0:
            avg_sleep = sleep.mean()
            poor_nights = (sleep < 6).sum()
            if avg_sleep >= 7:
                parts.append(f"Sleep looks healthy — averaging {avg_sleep:.1f} hours per night.")
            elif avg_sleep >= 6:
                parts.append(f"Sleep duration of {avg_sleep:.1f} hrs/night is slightly below the recommended 7–9 hrs.")
                recommendations.append("Aim for a consistent sleep schedule. Avoid screens 1 hour before bed.")
            else:
                parts.append(f"⚠️ Significant sleep deficiency detected — averaging only {avg_sleep:.1f} hrs/night, with {poor_nights} nights under 6 hours.")
                recommendations.append("Sleep deprivation is linked to heart disease, obesity, and impaired cognition. Prioritize 7–9 hours nightly.")

    # ── Steps ─────────────────────────────────────────────────
    if 'steps' in df.columns:
        steps = df['steps'].dropna()
        if len(steps) > 0:
            avg_steps = steps.mean()
            if avg_steps >= 10000:
                parts.append(f"Outstanding activity level — averaging {avg_steps:,.0f} steps/day.")
            elif avg_steps >= 7000:
                parts.append(f"Good activity level at {avg_steps:,.0f} steps/day. Push towards 10,000 for optimal benefits.")
            elif avg_steps >= 5000:
                parts.append(f"Moderate activity at {avg_steps:,.0f} steps/day. Increasing to 8,000+ will reduce cardiovascular risk.")
                recommendations.append("Take short 5-minute walks every hour. Use stairs instead of elevators.")
            else:
                parts.append(f"⚠️ Low physical activity — only {avg_steps:,.0f} steps/day on average.")
                recommendations.append("Low step count is a strong predictor of metabolic disease. Start with a 20-minute daily walk.")

    # ── Blood Pressure ────────────────────────────────────────
    if 'bp_systolic' in df.columns:
        bp = df['bp_systolic'].dropna()
        if len(bp) > 0:
            avg_sys = bp.mean()
            high_days = (bp > 130).sum()
            if avg_sys < 120:
                parts.append(f"Blood pressure is optimal ({avg_sys:.0f} mmHg systolic average).")
            elif avg_sys < 130:
                parts.append(f"Blood pressure is elevated ({avg_sys:.0f} mmHg systolic). Monitor closely.")
                recommendations.append("Reduce sodium intake and practice stress management techniques (meditation, deep breathing).")
            else:
                parts.append(f"⚠️ Blood pressure concerns: {avg_sys:.0f} mmHg average systolic, with {high_days} days above 130 mmHg.")
                recommendations.append("Consult a physician regarding blood pressure management. Consider DASH diet and reduce caffeine.")

    # ── Weight ────────────────────────────────────────────────
    if 'weight_kg' in df.columns:
        wt = df['weight_kg'].dropna()
        if len(wt) >= 7:
            trend_wt = np.polyfit(np.arange(len(wt)), wt.values, 1)[0]
            wt_change = trend_wt * len(wt)
            if abs(wt_change) < 1:
                parts.append(f"Weight has been stable over the period ({wt.iloc[-1]:.1f} kg).")
            elif wt_change < 0:
                parts.append(f"Weight trend is decreasing by ~{abs(wt_change):.1f} kg over the period — maintain healthy habits.")
            else:
                parts.append(f"Weight trend shows a {wt_change:.1f} kg increase over the period — review dietary habits.")
                recommendations.append("Track caloric intake with a food journal. Focus on protein-rich meals to support satiety.")

    # ── Critical alert summary ────────────────────────────────
    critical_alerts = [a for a in alerts if a.get('severity') == 'critical']
    if critical_alerts:
        parts.append(f"IMPORTANT: {len(critical_alerts)} critical health alert(s) detected — review the Alerts section immediately.")
        recommendations.append("Act on critical alerts promptly. Some flagged patterns may require medical attention.")

    # ── Positive summary ──────────────────────────────────────
    good_trends = [t for t in trends if t['direction'] == 'improving']
    if good_trends:
        good_labels = [t['metric'].replace('_', ' ') for t in good_trends[:2]]
        parts.append(f"Positive improvement observed in: {', '.join(good_labels)}. Keep it up!")

    # ── General wellness tips ─────────────────────────────────
    if 'water_litres' in df.columns:
        water = df['water_litres'].dropna()
        if len(water) > 0 and water.mean() < 2.0:
            recommendations.append("Hydration is below optimal. Aim for 2–2.5 litres of water daily.")

    if len(recommendations) == 0:
        recommendations.append("Overall health indicators look good. Maintain your current routine and log data consistently.")

    summary = " ".join(parts)
    return summary, recommendations
