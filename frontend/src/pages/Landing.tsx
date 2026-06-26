import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Brain, Activity, Terminal, BarChart3, HelpCircle, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-0 text-text-primary flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border-subtle bg-surface-1/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-accent" />
          </div>
          <div>
            <span className="font-bold text-[15px] tracking-tight">Aegis</span>
            <span className="text-[10px] text-text-tertiary block leading-none">Security Operations</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-accent hover:bg-accent-hover text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-sm shadow-accent/25"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 flex flex-col items-center text-center max-w-4xl mx-auto flex-1 justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent mb-6">
          <Brain className="w-3.5 h-3.5" /> Next-Generation AI Threat Detection
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary mb-6 leading-tight">
          AI-Powered Threat Detection for <span className="bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">Modern Security Teams</span>
        </h1>
        <p className="text-lg text-text-secondary mb-10 max-w-2xl">
          Aegis is an enterprise-grade Security Operations Center (SOC) platform leveraging advanced Machine Learning to detect, analyze, and mitigate cyber threats in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 font-medium bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg transition-all shadow-md shadow-accent/20 hover:shadow-accent/30 hover:translate-y-[-1px] active:translate-y-0"
          >
            Start Analyzing Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 font-medium bg-surface-1 border border-border-default hover:border-border-strong text-text-primary px-6 py-3 rounded-lg transition-all"
          >
            Access Security Portal
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-border-subtle bg-surface-1/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Enterprise-Grade Capabilities</h2>
            <p className="text-text-secondary mt-3 max-w-xl mx-auto">
              Equipped with state-of-the-art tools and machine learning models built for network security operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI Threat Detection',
                desc: 'Utilize custom scikit-learn models to detect complex anomalies and active intrusion attempts with high accuracy.',
              },
              {
                icon: Activity,
                title: 'Real-Time Monitoring',
                desc: 'Monitor network logs and live traffic events streaming through WebSocket tunnels directly in the dashboard.',
              },
              {
                icon: Terminal,
                title: 'Machine Learning Training',
                desc: 'Upload custom network dataset CSVs and train your own custom ML models directly from the UI pipeline.',
              },
              {
                icon: Shield,
                title: 'Threat Intelligence',
                desc: 'Map detected attacks to the industry-standard MITRE ATT&CK framework and access actionable advice.',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                desc: 'Visualize security metrics, threat distribution timelines, precision-recall graphs, and model parameters.',
              },
              {
                icon: HelpCircle,
                title: 'Interactive Onboarding',
                desc: 'Accelerate team onboarding with clear workspace tours and comprehensive guidance sections.',
              },
            ].map((f, i) => (
              <div key={i} className="card p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-base">{f.title}</h3>
                  <p className="text-text-secondary text-xs mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">The Data-to-Detection Pipeline</h2>
            <p className="text-text-secondary mt-3">Five simple steps to secure your enterprise network environment.</p>
          </div>

          <div className="relative border-l-2 border-border-subtle pl-6 ml-4 space-y-12">
            {[
              { step: '01', title: 'Upload Datasets', desc: 'Upload CSV network capture logs (CIC-IDS2017 or UNSW-NB15 format).' },
              { step: '02', title: 'Preprocess Data', desc: 'Apply missing value strategies, standard scaling, and label encoding.' },
              { step: '03', title: 'Train Custom Models', desc: 'Choose Decision Trees, Random Forests, or SVMs to compile custom weights.' },
              { step: '04', title: 'Deploy & Detect', desc: 'Activate your highest-performing model and stream real-time packet data.' },
              { step: '05', title: 'Respond & Resolve', desc: 'Review security alerts, consult MITRE context, and mark incidents resolved.' },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-11 top-0.5 w-6 h-6 rounded-full bg-surface-0 border-2 border-accent flex items-center justify-center text-[10px] font-bold text-accent">
                  {s.step}
                </div>
                <h3 className="font-semibold text-text-primary text-base">{s.title}</h3>
                <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-12 px-6 border-t border-border-subtle bg-surface-1/20 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block mb-6">
            Powered by modern open source technology
          </span>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-sm font-semibold text-text-secondary">
            <span>FastAPI (Python)</span>
            <span>React & Vite</span>
            <span>Tailwind CSS</span>
            <span>scikit-learn</span>
            <span>PostgreSQL</span>
            <span>WebSockets</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border-subtle bg-surface-1 text-center text-xs text-text-tertiary mt-auto">
        <p>© 2026 Aegis Security Inc. All rights reserved. For authorized operations only.</p>
      </footer>
    </div>
  );
}
