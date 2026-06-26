import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Brain, 
  Activity, 
  Terminal, 
  BarChart3, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Upload, 
  Cpu, 
  Users, 
  Layers, 
  Zap, 
  Play, 
  ChevronDown, 
  FileText, 
  Lock,
  MessageSquare
} from 'lucide-react';

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'threats' | 'datasets'>('dashboard');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary flex flex-col font-sans selection:bg-accent/30 selection:text-white">
      {/* Sticky Navigation Bar */}
      <header className="h-16 border-b border-border-subtle bg-surface-1/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <span className="font-bold text-[15px] tracking-tight">Aegis</span>
              <span className="text-[10px] text-text-tertiary block leading-none">Security Operations</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-text-secondary">
            <a href="#about" className="hover:text-text-primary transition-colors">Product</a>
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#pipeline" className="hover:text-text-primary transition-colors">How It Works</a>
            <a href="#audiences" className="hover:text-text-primary transition-colors">Audiences</a>
            <a href="#preview" className="hover:text-text-primary transition-colors">Interactive Preview</a>
            <a href="#faq" className="hover:text-text-primary transition-colors">FAQ</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs font-semibold bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-all shadow-sm shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Premium Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-8 border-b border-border-subtle bg-gradient-to-b from-surface-0 to-surface-1/40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-[11px] font-bold text-accent mb-6 animate-pulse">
              <Brain className="w-3.5 h-3.5" /> Next-Generation AI Threat Detection
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1] mb-6">
              AI-Powered Threat Detection <br />
              <span className="bg-gradient-to-r from-accent via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Made Simple for Everyone
              </span>
            </h1>
            
            <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-8 max-w-lg">
              Detect complex cyber threats, preprocess network logs, and train custom machine learning models through a clean, intuitive Security Operations Center interface. Designed for students, researchers, and professional teams alike.
            </p>
            
            <div className="flex flex-wrap gap-4 w-full">
              <Link
                to="/register"
                className="flex items-center gap-2 font-semibold bg-accent hover:bg-accent-hover text-white text-xs px-5 py-3 rounded-lg transition-all shadow-md shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/datasets"
                className="flex items-center gap-2 font-semibold bg-surface-2 border border-border-default hover:border-border-strong text-text-primary text-xs px-5 py-3 rounded-lg transition-all"
              >
                <Upload className="w-4 h-4 text-accent" /> Upload Dataset
              </Link>
            </div>
          </div>

          {/* Right Hero Column (Interactive Mock Dashboard Preview) */}
          <div className="lg:col-span-6">
            <div className="border border-border-strong rounded-xl bg-surface-1 p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              
              {/* Header inside mock */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 animate-ping" />
                  <span className="text-[11px] font-bold tracking-wider text-text-secondary uppercase">AEGIS DETECTION ACTIVE</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400">
                  <Zap className="w-3 h-3" /> Live
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-surface-2 border border-border-subtle p-3 rounded-lg">
                  <span className="text-[10px] text-text-tertiary block">RISK INDEX</span>
                  <span className="text-xl font-bold text-red-400 mt-1 block">8.4 / 10</span>
                </div>
                <div className="bg-surface-2 border border-border-subtle p-3 rounded-lg">
                  <span className="text-[10px] text-text-tertiary block">ACTIVE ALERTS</span>
                  <span className="text-xl font-bold text-orange-400 mt-1 block">14</span>
                </div>
                <div className="bg-surface-2 border border-border-subtle p-3 rounded-lg">
                  <span className="text-[10px] text-text-tertiary block">THREAT MODEL</span>
                  <span className="text-xs font-semibold text-accent mt-1 block truncate">RandomForest_v2</span>
                </div>
              </div>

              {/* Feed simulation */}
              <div className="bg-surface-2 border border-border-subtle rounded-lg p-3 space-y-2">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Recent Incidents Feed</span>
                {[
                  { type: 'DDoS Attack', target: '192.168.1.105', severity: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10' },
                  { type: 'Port Scan', target: '10.0.0.42', severity: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10' },
                  { type: 'Brute Force', target: '172.16.2.14', severity: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-border-subtle/50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="font-semibold text-text-primary">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-text-tertiary">{item.target}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${item.color} ${item.bg}`}>
                        {item.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is AI Threat Detection Educational Section */}
      <section id="about" className="py-20 px-4 md:px-8 border-b border-border-subtle bg-surface-1/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-3">Education</span>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">What is AI Threat Detection?</h2>
            <p className="text-text-secondary text-sm mt-3 max-w-xl mx-auto">
              Understanding modern cybersecurity issues shouldn't require a Ph.D. Here's a brief primer on how AI changes the defense paradigm.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-text-primary text-base">The Cyber Threat Problem</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Hackers, viruses, and malware constant scan modern networks looking for weak links. Traditional firewalls require manual configuration and rule updates, which misses zero-day exploits.
              </p>
            </div>

            <div className="card p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-text-primary text-base">How AI Assists Defense</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Machine Learning models analyze millions of packet streams to detect patterns. Instead of hardcoded rules, AI learns what is "normal" and highlights anomalous intrusions autonomously.
              </p>
            </div>

            <div className="card p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-text-primary text-base">Why Use Aegis Platform</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Aegis bridges the gap. It takes complex raw data logs, handles standard scaling, trains classification models, and provides interactive timelines with zero code setup required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-20 px-4 md:px-8 border-b border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-3">Capabilities</span>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">Platform Core Showcase</h2>
            <p className="text-text-secondary text-sm mt-3 max-w-xl mx-auto">
              Everything you need to upload data, compile models, and response to security incidents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI Classifier Engines',
                desc: 'Supports Decision Trees, Random Forests, and SVMs. Provides standard accuracy, precision, and recall statistics.',
                benefit: 'Select the optimal algorithm for your traffic format.'
              },
              {
                icon: Upload,
                title: 'CSV Pipeline Processing',
                desc: 'Upload network logs, configure missing value filling, scaling, and test splits with visual guidelines.',
                benefit: 'No data science code or pandas knowledge required.'
              },
              {
                icon: Activity,
                title: 'Live WebSocket Stream',
                desc: 'Hook up to our backend simulator. Network status updates dynamically as anomalies trigger warning indicators.',
                benefit: 'Validate threat responses in real-time.'
              },
              {
                icon: Shield,
                title: 'MITRE ATT&CK Mapping',
                desc: 'Correlate alerts to standardized frameworks. Learn about techniques like exfiltration and lateral movement.',
                benefit: 'Understand threat actor motives instantly.'
              },
              {
                icon: BarChart3,
                title: 'In-Depth Analytics',
                desc: 'Drill down into telemetry graphs, feature importance bars, and latency tracking metrics.',
                benefit: 'Audit model efficiency prior to production deployment.'
              },
              {
                icon: Lock,
                title: 'Security Headers & Limiting',
                desc: 'Enterprise security integrations including global rate limiters, security headers, and size limits.',
                benefit: 'Ensure API defense from exploit attempts.'
              }
            ].map((f, i) => (
              <div key={i} className="card p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-base">{f.title}</h3>
                  <p className="text-text-secondary text-xs mt-2 leading-relaxed">{f.desc}</p>
                  <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-medium text-emerald-400">{f.benefit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Timeline */}
      <section id="pipeline" className="py-20 px-4 md:px-8 border-b border-border-subtle bg-surface-1/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-3">Workflow</span>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">How Aegis Works</h2>
            <p className="text-text-secondary text-sm mt-3">From raw network logs to active protection in six simple steps.</p>
          </div>

          <div className="relative border-l border-border-strong pl-6 ml-4 space-y-12">
            {[
              { icon: Upload, title: '1. Ingest Security Data', desc: 'Drag and drop standard network traffic capture logs (CSVs) up to 5MB in size.' },
              { icon: Layers, title: '2. Preprocess Data', desc: 'Select feature scaling (StandardScaler) and missing value imputation strategies.' },
              { icon: Cpu, title: '3. Train Classifiers', desc: 'Initiate training. Track performance milestones (Accuracy, F1 scores) in real-time.' },
              { icon: Play, title: '4. Deploy & Stream', desc: 'Activate the best-performing model with a single click and launch the detection engine.' },
              { icon: AlertTriangle, title: '5. Dynamic Risk Scoring', desc: 'Aegis calculates real-time threat severity and risk indexes for all stream parameters.' },
              { icon: FileText, title: '6. Review Recommendations', desc: 'Drill into incident reports to find origin IPs and read actionable mitigation workflows.' }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-10 top-0.5 w-8 h-8 rounded-full bg-surface-1 border border-border-strong flex items-center justify-center text-accent">
                  <step.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-text-primary text-sm">{step.title}</h3>
                <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences Section */}
      <section id="audiences" className="py-20 px-4 md:px-8 border-b border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-3">Target Users</span>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">Who is Aegis For?</h2>
            <p className="text-text-secondary text-sm mt-3 max-w-xl mx-auto">
              Tailored workspaces and toolsets designed to support various security learning and professional workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: 'Students', desc: 'Learn security terminology, explore algorithms, and view real-world packet classification impacts.', value: 'Hands-on learning with zero CLI configuration.' },
              { type: 'Researchers', desc: 'Evaluate different preprocess parameters, train classifiers, and export model performance profiles.', value: 'Exportable precision-recall metrics.' },
              { type: 'Security Analysts', desc: 'Ingest traffic events, study source-destination addresses, and map anomalies to MITRE ATT&CK codes.', value: 'Actionable response instructions.' },
              { type: 'SOC Teams', desc: 'Stream capture sessions, monitor WebSocket alert queues, and collaborate on resolving active threat states.', value: 'Live alert timeline and logs.' },
            ].map((aud, i) => (
              <div key={i} className="card p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Aegis for</span>
                  <h3 className="font-bold text-text-primary text-base mt-1 mb-3">{aud.type}</h3>
                  <p className="text-text-secondary text-xs leading-relaxed">{aud.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-border-subtle/50 text-[10px] text-text-tertiary">
                  <span className="font-semibold text-text-secondary">Key value:</span> {aud.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Aegis Comparison */}
      <section className="py-20 px-4 md:px-8 border-b border-border-subtle bg-surface-1/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-3">Comparison</span>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">Traditional vs. AI-Powered SOC</h2>
            <p className="text-text-secondary text-sm mt-3">See how Aegis simplifies enterprise network security operations.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional */}
            <div className="bg-surface-2 border border-border-subtle rounded-xl p-6">
              <h3 className="font-bold text-text-secondary text-base mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Traditional Security Workflows
              </h3>
              <ul className="space-y-3.5 text-xs text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">✕</span>
                  <span>Manual inspection of raw network packet logs (thousands of rows)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">✕</span>
                  <span>Requires writing custom Python parsing/scikit-learn scripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">✕</span>
                  <span>Complex configuration of CLI detectors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">✕</span>
                  <span>Misses novel threat patterns without custom rule definitions</span>
                </li>
              </ul>
            </div>

            {/* Aegis AI */}
            <div className="bg-surface-2 border border-accent/20 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-[9px] font-bold uppercase tracking-wider text-white px-3 py-1 rounded-bl-lg">
                Recommended
              </div>
              <h3 className="font-bold text-text-primary text-base mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Aegis Threat Portal
              </h3>
              <ul className="space-y-3.5 text-xs text-text-primary">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>Automated ingestion and preprocessing pipeline UI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>One-click model training and instant performance evaluation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>Live visual graphs, threat queues, and simple dashboard widgets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>Actionable, plain-English mitigation manuals</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Product Preview Section */}
      <section id="preview" className="py-20 px-4 md:px-8 border-b border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-3">Product Tour</span>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">Interactive Workspace Preview</h2>
            <p className="text-text-secondary text-sm mt-3 max-w-xl mx-auto">
              Click through the tabs below to explore high-fidelity mock interfaces of the Aegis SOC dashboard.
            </p>
          </div>

          {/* Selector Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: 'dashboard', label: 'Security Dashboard' },
              { id: 'threats', label: 'Threat Feed' },
              { id: 'datasets', label: 'Dataset Ingestion' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-surface-1 border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Screen Container */}
          <div className="border border-border-default bg-surface-1 rounded-xl p-6 shadow-2xl min-h-[300px]">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">Workspace Overview</h4>
                    <span className="text-[10px] text-text-tertiary">Real-time performance metrics and pipeline state</span>
                  </div>
                  <span className="text-xs font-semibold text-accent font-mono">192.168.1.100 (Host Active)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Model', value: 'DecisionTree_v1' },
                    { label: 'Ingested Logs', value: '184,204 rows' },
                    { label: 'Detection Rate', value: '99.4%' },
                    { label: 'Alert Resolution', value: '88%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-surface-2 border border-border-subtle p-4 rounded-lg">
                      <span className="text-[10px] text-text-tertiary block">{stat.label}</span>
                      <span className="text-lg font-bold text-text-primary mt-1 block">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'threats' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">Threat Investigation Center</h4>
                    <span className="text-[10px] text-text-tertiary">Audit and resolve active network anomaly incidents</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { id: 'T-1002', name: 'FTP Brute Force', ip: '10.0.0.12', time: '2 mins ago', severity: 'High', color: 'text-orange-400' },
                    { id: 'T-1003', name: 'SQL Injection Attempt', ip: '172.24.11.90', time: '14 mins ago', severity: 'Critical', color: 'text-red-400' },
                    { id: 'T-1004', name: 'Suspicious Beaconing', ip: '192.168.1.4', time: '1 hr ago', severity: 'Low', color: 'text-green-400' }
                  ].map((threat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface-2 border border-border-subtle rounded-lg text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-text-tertiary">{threat.id}</span>
                        <span className="font-semibold text-text-primary">{threat.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-text-secondary">{threat.ip}</span>
                        <span className="text-text-tertiary">{threat.time}</span>
                        <span className={`font-bold ${threat.color}`}>{threat.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'datasets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">Dataset Upload Manager</h4>
                    <span className="text-[10px] text-text-tertiary">Select custom CSV data and compile features</span>
                  </div>
                </div>
                <div className="border border-dashed border-border-strong rounded-xl p-8 text-center flex flex-col items-center justify-center bg-surface-2/50">
                  <Upload className="w-8 h-8 text-text-tertiary mb-3" />
                  <span className="text-xs font-semibold text-text-primary">Drag & drop your network capture log here</span>
                  <span className="text-[10px] text-text-tertiary mt-1 block">Supports CSV formats (max 5MB)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Practical Use Cases / Scenarios */}
      <section className="py-20 px-4 md:px-8 border-b border-border-subtle bg-surface-1/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-3">Scenarios</span>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">Practical Real-World Use Cases</h2>
            <p className="text-text-secondary text-sm mt-3 max-w-xl mx-auto">
              See exactly how the platform aids in diagnosing and teaching defense against malicious actions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Detecting DDoS Attacks',
                problem: 'Sudden spike in incoming traffic flows overwhelms services.',
                solution: 'The Random Forest model flags volumetric flow anomalies and alerts operators to restrict malicious IPs.',
              },
              {
                title: 'Academic Cybersecurity Projects',
                problem: 'Students need hands-on machine learning threat modeling tools without complex Python environments.',
                solution: 'Instructors utilize Aegis UI to visually demonstrate standard scaling, scaling effects, and F1 outcomes.',
              },
              {
                title: 'Suspicious Activity Monitoring',
                problem: 'Internal assets starting network scans (port scans) indicate potential compromise.',
                solution: 'WebSocket alerts trigger instantly on the dashboard feed, detailing MITRE target nodes.',
              }
            ].map((uc, i) => (
              <div key={i} className="card p-6 flex flex-col gap-4">
                <h3 className="font-bold text-text-primary text-base">{uc.title}</h3>
                <div>
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">The Challenge</span>
                  <p className="text-text-secondary text-xs mt-1 leading-relaxed">{uc.problem}</p>
                </div>
                <div className="pt-3 border-t border-border-subtle/50">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">The Aegis Solution</span>
                  <p className="text-text-secondary text-xs mt-1 leading-relaxed">{uc.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section id="faq" className="py-20 px-4 md:px-8 border-b border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-3">FAQ</span>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">Frequently Asked Questions</h2>
            <p className="text-text-secondary text-sm mt-3">Common answers to setup, file formats, and AI modeling questions.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What datasets can I upload?',
                a: 'Aegis supports standard network traffic capture logs formatted as CSVs, such as the CIC-IDS2017 dataset or UNSW-NB15 layouts, containing features like flow duration, packet lengths, and flags.'
              },
              {
                q: 'Do I need cybersecurity experience?',
                a: 'No! Aegis is built with comprehensive guidelines, helper cards, and tooltips at every stage so that users of any skill level can successfully preprocess data, train models, and interpret threat feeds.'
              },
              {
                q: 'How does the AI detect threats?',
                a: 'Once you train a classifier (Decision Tree, Random Forest, or SVM), it analyzes the mathematical features of network flows to classify them as either benign or a specific type of attack.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. All uploads are processed inside our secure container environment. Rate limiting and request size policies prevent excessive exposure or exploitation of the API.'
              },
              {
                q: 'Which file formats are supported?',
                a: 'Currently, the dataset page processes `.csv` captures. Full packet capture (`.pcap`) ingestion and preprocessing support is coming soon.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-surface-1 border border-border-subtle rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-text-primary hover:bg-surface-2 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-text-secondary leading-relaxed border-t border-border-subtle/50 bg-surface-2/35">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-t from-surface-1 to-surface-0 border-b border-border-subtle text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
            Start Detecting Cyber Threats with AI
          </h2>
          <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
            Upload your first dataset, configure scaling preprocessing options, and receive intelligent, actionable security insights in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link
              to="/register"
              className="flex items-center gap-2 font-semibold bg-accent hover:bg-accent-hover text-white text-xs px-6 py-3 rounded-lg transition-all shadow-md shadow-accent/20"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/datasets"
              className="flex items-center gap-2 font-semibold bg-surface-1 border border-border-default hover:border-border-strong text-text-primary text-xs px-6 py-3 rounded-lg transition-all"
            >
              <Upload className="w-4 h-4 text-accent" /> Upload Dataset
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 bg-surface-1 text-center border-t border-border-subtle flex flex-col items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-accent" />
          </div>
          <span className="font-bold text-[14px] tracking-tight">Aegis SOC</span>
        </div>
        <p className="text-[11px] text-text-tertiary">
          © 2026 Aegis Security Inc. All rights reserved. Authorized security operations and educational demonstration portal.
        </p>
      </footer>
    </div>
  );
}
