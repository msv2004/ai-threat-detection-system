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
  MessageSquare,
  Globe,
  Database,
  RefreshCw,
  Search,
  Eye,
  Server,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'threats' | 'datasets'>('dashboard');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#04060a] text-[#f8fafc] flex flex-col font-sans selection:bg-[#0ea5e9]/30 selection:text-white scroll-smooth relative overflow-x-hidden">
      {/* Premium Tech Grid & Glow Backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] -right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-border-default bg-[#04060a]/80 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#2563eb]/20 border border-[#0ea5e9]/30 flex items-center justify-center shadow-lg shadow-blue-500/5 relative group">
              <div className="absolute inset-0 rounded-xl bg-[#0ea5e9]/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <div>
              <span className="font-extrabold text-[15px] tracking-tight text-white block">AEGIS</span>
              <span className="text-[9px] text-[#64748b] block leading-none font-semibold uppercase tracking-wider">SOC Operations</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-text-secondary">
            <a href="#about" className="hover:text-white transition-colors relative py-1 group">
              Product
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
            </a>
            <a href="#features" className="hover:text-white transition-colors relative py-1 group">
              Capabilities
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
            </a>
            <a href="#pipeline" className="hover:text-white transition-colors relative py-1 group">
              How It Works
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
            </a>
            <a href="#preview" className="hover:text-white transition-colors relative py-1 group">
              Interactive Preview
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
            </a>
            <a href="#faq" className="hover:text-white transition-colors relative py-1 group">
              FAQ
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/login" className="text-[13px] font-semibold text-text-secondary hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-[12px] font-bold bg-[#0ea5e9] hover:bg-[#38bdf8] text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 px-6 md:px-12 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-[#0ea5e9] animate-pulse" /> 
              Autonomous Data Security & SOC Analytics
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.1]">
              AI-Powered Threat Detection <br />
              <span className="bg-gradient-to-r from-[#0ea5e9] via-indigo-400 to-[#14b8a6] bg-clip-text text-transparent">
                Made Intuitive & Actionable
              </span>
            </h1>
            
            <p className="text-sm md:text-[15px] text-text-secondary leading-relaxed max-w-lg">
              Detect volumetric anomalies, isolate threat vectors, and construct machine learning classification pipelines in one visual dashboard. No complex data science coding or CLI scripting required.
            </p>
            
            <div className="flex flex-wrap gap-4 w-full pt-2">
              <Link
                to="/register"
                className="flex items-center gap-2 font-bold bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-[13px] px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 font-bold bg-[#0f172a] border border-[#334155]/60 hover:border-accent text-white text-[13px] px-6 py-3.5 rounded-xl transition-all hover:bg-slate-800"
              >
                Access Platform Demo
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-border-subtle w-full">
              <div>
                <span className="text-2xl font-black text-white block font-mono">99.4%</span>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Model Accuracy</span>
              </div>
              <div className="w-[1px] h-8 bg-border-default" />
              <div>
                <span className="text-2xl font-black text-white block font-mono">&lt; 2.5ms</span>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Inference Speed</span>
              </div>
              <div className="w-[1px] h-8 bg-border-default" />
              <div>
                <span className="text-2xl font-black text-[#10b981] block font-mono">Real-Time</span>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Intrusion Stream</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] rounded-2xl blur opacity-20 pointer-events-none" />
            <div className="border border-border-strong rounded-2xl bg-[#090e18]/90 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden space-y-5">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0ea5e9]/40 to-transparent" />
              
              {/* Header inside mock */}
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase">Aegis Stream Active</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-0.5 rounded text-[9px] font-semibold text-[#10b981]">
                  <Zap className="w-3 h-3 text-[#10b981]" /> Sniffing Live
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#04060a] border border-border-default p-3.5 rounded-xl">
                  <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Risk Index</span>
                  <span className="text-xl font-black text-red-500 mt-1 block font-mono">8.7</span>
                </div>
                <div className="bg-[#04060a] border border-border-default p-3.5 rounded-xl">
                  <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Alerts Today</span>
                  <span className="text-xl font-black text-orange-400 mt-1 block font-mono">42</span>
                </div>
                <div className="bg-[#04060a] border border-border-default p-3.5 rounded-xl">
                  <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Active Model</span>
                  <span className="text-[11px] font-bold text-[#0ea5e9] mt-2 block truncate">RandomForest_v2</span>
                </div>
              </div>

              {/* Feed simulation */}
              <div className="bg-[#04060a] border border-border-default rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider block">Security Incidents Feed</span>
                {[
                  { type: 'DDoS Volumetric Flow', target: '192.168.1.104', severity: 'Critical', color: 'text-red-400 bg-red-400/10 border-red-400/25' },
                  { type: 'SSH Brute Force Attempt', target: '10.0.4.12', severity: 'High', color: 'text-orange-400 bg-orange-400/10 border-orange-400/25' },
                  { type: 'TCP SYN Port Scan', target: '172.16.89.2', severity: 'Medium', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-border-default pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${idx === 0 ? 'text-red-400' : idx === 1 ? 'text-orange-400' : 'text-yellow-400'}`} />
                      <span className="font-semibold text-white">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-text-tertiary">{item.target}</span>
                      <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold ${item.color}`}>
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

      {/* Educational Section */}
      <section id="about" className="py-24 px-6 md:px-12 border-b border-border-subtle bg-[#090e18]/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest block">Security Literacy</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">What is AI-Driven Threat Detection?</h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto leading-relaxed">
              Traditional rule-based systems are bypassable and complex. Aegis uses intelligent machine learning models to detect unknown anomalous behaviors autonomously.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-border-default rounded-2xl bg-[#090e18] p-6.5 flex flex-col gap-4 relative group hover:border-[#ef4444]/35 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-white text-base">The Perimeter Challenge</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Hackers utilize zero-day exploits, port scanning, and volumetric attacks to bypass rules. Checking thousands of network events manually is impossible for security teams.
              </p>
            </div>

            <div className="border border-border-default rounded-2xl bg-[#090e18] p-6.5 flex flex-col gap-4 relative group hover:border-accent transition-colors">
              <div className="w-11 h-11 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9]">
                <Brain className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-white text-base">Intelligent Pattern Analysis</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Machine learning models analyze features like packet ratios, duration, and flag counts. The AI learns normal thresholds and flags anomalous spikes or malicious behavior.
              </p>
            </div>

            <div className="border border-border-default rounded-2xl bg-[#090e18] p-6.5 flex flex-col gap-4 relative group hover:border-[#10b981]/35 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <Zap className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-white text-base">Actionable Intelligence</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Aegis classifies threat payloads and maps them to standard frameworks. Analysts receive clear explanations, AbuseIPDB metrics, and firewall mitigation recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Matrix / Capabilities */}
      <section id="features" className="py-24 px-6 md:px-12 border-b border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest block">Capabilities</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Platform Features Matrix</h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto leading-relaxed">
              Enterprise-grade tools to preprocess datasets, train classifiers, and monitor incident pipelines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Multi-Algorithm Classifiers',
                desc: 'Train Decision Trees, Random Forests, or SVMs. Toggle configurations, set parameters, and compare accuracies dynamically.',
                benefit: 'Compare models visually inside the registry.'
              },
              {
                icon: Upload,
                title: 'Data Ingestion & Scaling',
                desc: 'Upload network logs, configure missing value filling, scaling, and test splits with visual guidelines.',
                benefit: 'No pandas knowledge or custom python scripts required.'
              },
              {
                icon: Activity,
                title: 'Live WebSocket Alert Stream',
                desc: 'Simulate capture streams. Telemetry charts, packet counters, and threat events update in real time.',
                benefit: 'Interact and resolve threat alerts dynamically.'
              },
              {
                icon: Shield,
                title: 'MITRE ATT&CK Mapping',
                desc: 'Correlate alerts to standardized frameworks. Learn about techniques like exfiltration and lateral movement.',
                benefit: 'Understand threat actor motives instantly.'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics Telemetry',
                desc: 'Analyze performance curves, latency histograms, and features contribution ratios.',
                benefit: 'Track inference speed (ms) and metrics.'
              },
              {
                icon: Lock,
                title: 'API Rate Limiting & Safety',
                desc: 'Integrated system safeguards including global rate limiters, secure headers, and size limits to prevent exploitation.',
                benefit: 'Ensure API defense from exploit attempts.'
              }
            ].map((f, i) => (
              <div key={i} className="border border-border-default rounded-2xl bg-[#090e18] p-7 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-colors">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9]">
                    <f.icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-bold text-white text-[17px]">{f.title}</h3>
                  <p className="text-text-secondary text-xs leading-relaxed">{f.desc}</p>
                </div>
                <div className="pt-4 border-t border-border-default flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span className="text-[11px] font-semibold text-[#10b981]">{f.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Timeline */}
      <section id="pipeline" className="py-24 px-6 md:px-12 border-b border-border-subtle bg-[#090e18]/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest block">Workflow</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">How Aegis Operations Work</h2>
            <p className="text-text-secondary text-sm">From raw network logs to active security monitoring in 6 steps.</p>
          </div>

          <div className="relative border-l border-border-strong pl-8 ml-4 space-y-12">
            {[
              { icon: Upload, title: '1. Ingest Security Data', desc: 'Drag and drop standard network traffic capture logs (CSVs) up to 5MB in size.' },
              { icon: Layers, title: '2. Preprocess & Scale', desc: 'Select feature scaling (StandardScaler) and missing value imputation strategies.' },
              { icon: Cpu, title: '3. Train Classifiers', desc: 'Initiate training. Track performance milestones (Accuracy, F1 scores) in real-time.' },
              { icon: Play, title: '4. Deploy & Activate Model', desc: 'Deploy the best model to the active registry with a single click to enable prediction routing.' },
              { icon: AlertTriangle, title: '5. Analyze Traffic Stream', desc: 'Start the detection engine. Traffic streams map live indicators of compromise and compute risk indexes.' },
              { icon: FileText, title: '6. Review Recommendations', desc: 'Open incidents feed to review target addresses, AbuseIPDB metrics, and firewall blocks.' }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[48px] top-0 w-9 h-9 rounded-full bg-[#04060a] border border-border-strong flex items-center justify-center text-[#0ea5e9] shadow-md">
                  <step.icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-white text-[15px]">{step.title}</h3>
                <p className="text-text-secondary text-xs mt-2 leading-relaxed max-w-2xl">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Product Preview Section */}
      <section id="preview" className="py-24 px-6 md:px-12 border-b border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest block">Product Preview</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Interactive Workspace Preview</h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto leading-relaxed">
              Explore custom mock interfaces of the Aegis SOC dashboard. Select tabs to preview platform features.
            </p>
          </div>

          {/* Selector Tabs */}
          <div className="flex justify-center gap-3 mb-8">
            {[
              { id: 'dashboard', label: 'Security Dashboard' },
              { id: 'threats', label: 'Threat Investigation' },
              { id: 'datasets', label: 'Dataset Ingestion' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/30 text-[#0ea5e9] shadow-lg shadow-sky-500/5'
                    : 'bg-[#090e18] border-border-default text-text-secondary hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Screen Container */}
          <div className="border border-border-strong bg-[#090e18] rounded-2xl p-6 md:p-8 shadow-2xl min-h-[360px] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#0ea5e9]/30 to-transparent" />
            
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border-default pb-4">
                  <div>
                    <h4 className="font-extrabold text-white text-[15px]">Security Posture Overview</h4>
                    <span className="text-[10px] text-text-tertiary block mt-0.5">Real-time performance metrics and pipeline state</span>
                  </div>
                  <span className="text-xs font-bold text-[#0ea5e9] font-mono bg-[#0ea5e9]/5 border border-[#0ea5e9]/15 px-2.5 py-1 rounded-lg">
                    10.0.0.1 (Active Host)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Deployed Model', value: 'RandomForest_v2' },
                    { label: 'Ingested Flows', value: '412,900 flows' },
                    { label: 'Average Detection Rate', value: '99.42%' },
                    { label: 'Alerts Resolution Time', value: '54 seconds' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#04060a] border border-border-default p-4 rounded-xl">
                      <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">{stat.label}</span>
                      <span className="text-lg font-black text-white mt-1.5 block font-mono">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'threats' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border-default pb-4">
                  <div>
                    <h4 className="font-extrabold text-white text-[15px]">Incident Response Center</h4>
                    <span className="text-[10px] text-text-tertiary block mt-0.5">Audit and resolve active network anomaly incidents</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { id: 'T-108', name: 'SQL Injection payload', ip: '172.16.4.5', time: '1 min ago', severity: 'Critical', color: 'text-red-400 bg-red-400/10 border-red-400/25' },
                    { id: 'T-109', name: 'FTP Brute Force request', ip: '192.168.1.189', time: '8 mins ago', severity: 'High', color: 'text-orange-400 bg-orange-400/10 border-orange-400/25' },
                    { id: 'T-110', name: 'Volumetric Syn Flood', ip: '10.0.0.14', time: '1 hour ago', severity: 'High', color: 'text-orange-400 bg-orange-400/10 border-orange-400/25' }
                  ].map((threat, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-[#04060a] border border-border-default rounded-xl text-xs">
                      <div className="flex items-center gap-3.5">
                        <span className="font-mono text-[10px] text-text-tertiary font-bold">{threat.id}</span>
                        <span className="font-semibold text-white">{threat.name}</span>
                      </div>
                      <div className="flex items-center gap-4.5">
                        <span className="font-mono text-text-secondary">{threat.ip}</span>
                        <span className="text-text-tertiary hidden md:block">{threat.time}</span>
                        <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold ${threat.color}`}>{threat.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'datasets' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border-default pb-4">
                  <div>
                    <h4 className="font-extrabold text-white text-[15px]">Dataset Upload Manager</h4>
                    <span className="text-[10px] text-text-tertiary block mt-0.5">Select custom CSV data and compile features</span>
                  </div>
                </div>
                <div className="border border-dashed border-border-strong rounded-2xl p-10 text-center flex flex-col items-center justify-center bg-[#04060a]/50">
                  <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] mb-4">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-white">Drag & drop your network capture log here</span>
                  <span className="text-[10px] text-text-tertiary mt-1.5 block">Supports CSV formats (max 5MB)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scenarios / Use Cases */}
      <section className="py-24 px-6 md:px-12 border-b border-border-subtle bg-[#090e18]/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest block">Use Cases</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Real-World SOC Scenarios</h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto leading-relaxed">
              How various user archetypes use the platform to learn and execute threat modeling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Detecting DDoS Attacks',
                problem: 'Sudden spike in traffic flows overwhelms corporate servers.',
                solution: 'The Random Forest model flags volumetric flow anomalies and alerts operators to restrict malicious IPs.',
              },
              {
                title: 'Academic Projects & Learning',
                problem: 'Students need hands-on machine learning threat modeling tools without complex Python environments.',
                solution: 'Instructors utilize Aegis UI to visually demonstrate standard scaling, scaling effects, and F1 outcomes.',
              },
              {
                title: 'Suspicious Reconnaissance',
                problem: 'Internal assets starting network scans (port scans) indicate potential compromise.',
                solution: 'WebSocket alerts trigger instantly on the dashboard feed, detailing MITRE target nodes.',
              }
            ].map((uc, i) => (
              <div key={i} className="border border-border-default rounded-2xl bg-[#090e18] p-7 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-colors">
                <h3 className="font-extrabold text-white text-[16px]">{uc.title}</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block">The Challenge</span>
                    <p className="text-text-secondary text-xs mt-1 leading-relaxed">{uc.problem}</p>
                  </div>
                  <div className="pt-4 border-t border-border-default">
                    <span className="text-[10px] font-extrabold text-[#10b981] uppercase tracking-wider block">The Solution</span>
                    <p className="text-text-secondary text-xs mt-1 leading-relaxed">{uc.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-24 px-6 md:px-12 border-b border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest block">Support FAQ</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Frequently Asked Questions</h2>
            <p className="text-text-secondary text-sm">Common answers to file formats, machine learning setups, and API capabilities.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What datasets can I upload?',
                a: 'Aegis supports network traffic capture logs formatted as CSVs, such as the CIC-IDS2017 dataset or UNSW-NB15 layouts, containing features like flow duration, packet lengths, and flags.'
              },
              {
                q: 'Do I need cybersecurity experience?',
                a: 'No! Aegis is built with helper cards, tooltips, and explanations at every stage so that users of any skill level can successfully preprocess data, train models, and interpret threat feeds.'
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
              <div key={idx} className="bg-[#090e18] border border-border-default rounded-2xl overflow-hidden transition-all duration-200">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:bg-slate-800/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-text-secondary leading-relaxed border-t border-border-default bg-[#04060a]/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#090e18] to-[#04060a] border-b border-border-subtle text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-[38px] font-black tracking-tight text-white leading-tight">
            Deploy Autonomous AI Intrusion Detection
          </h2>
          <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
            Upload your first dataset, configure scaling preprocessing options, and receive intelligent, actionable security insights in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4.5 mt-4">
            <Link
              to="/register"
              className="flex items-center gap-2 font-bold bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-[13px] px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 font-bold bg-[#0f172a] border border-[#334155]/60 hover:border-accent text-white text-[13px] px-6 py-3.5 rounded-xl transition-all hover:bg-slate-800"
            >
              Access Platform Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 bg-[#090e18] text-center border-t border-border-default flex flex-col items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/25 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-[#0ea5e9]" />
          </div>
          <span className="font-black text-[15px] tracking-tight text-white">Aegis SOC</span>
        </div>
        <p className="text-[11px] text-text-tertiary">
          © 2026 Aegis Security Inc. All rights reserved. Authorized security operations and educational demonstration portal.
        </p>
      </footer>
    </div>
  );
}
