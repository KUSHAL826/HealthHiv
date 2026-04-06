import { Link } from 'react-router-dom'
import { Heart, BarChart2, Sparkles, Shield, ArrowRight, Activity, Moon, Footprints } from 'lucide-react'

const features = [
  { icon: BarChart2, title: 'Beautiful Dashboards', desc: 'Interactive charts for heart rate, steps, sleep, BP, calories, weight and more.' },
  { icon: Sparkles,  title: 'AI-Powered Insights', desc: 'Python ML detects anomalies, trends, and generates personalized health summaries.' },
  { icon: Shield,    title: 'Private & Secure', desc: 'Your data stays yours — JWT auth, encrypted storage, no third-party sharing.' },
]

const metrics = [
  { icon: Activity, label: 'Heart Rate', value: '68 bpm', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Footprints, label: 'Steps Today', value: '9,456', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Moon, label: 'Sleep', value: '7.5 hrs', color: 'text-violet-400', bg: 'bg-violet-500/10' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Heart size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl">Visionary Minds</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-6">
          <Sparkles size={14} className="text-brand-400" />
          <span className="text-brand-400 text-sm font-medium">AI-powered health analytics</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
          Know Your Body.<br />
          <span className="text-brand-400">Visualize Your Health.</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Transform raw health data — heart rate, sleep, steps, blood pressure — into beautiful dashboards and AI-generated insights that help you live better.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary flex items-center gap-2 text-base py-3 px-7">
            Start for Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base py-3 px-7">
            Demo Login
          </Link>
        </div>
      </section>

      {/* Metrics preview cards */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card-hover flex items-center gap-4">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800">
        <h2 className="font-display text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card text-center">
              <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-brand-400" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Ready to understand your health?</h2>
        <p className="text-slate-400 mb-8">Sign up free. No credit card required.</p>
        <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base py-3 px-8">
          Create Account <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="text-center py-6 border-t border-slate-800 text-slate-500 text-sm">
        © 2026 Visionary Minds — Built for hackathon 🏆
      </footer>
    </div>
  )
}
