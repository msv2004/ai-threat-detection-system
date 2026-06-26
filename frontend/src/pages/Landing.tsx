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
  Server
} from 'lucide-react';

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'threats' | 'datasets'>('dashboard');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f0f2f5] flex flex-col font-sans selection:bg-blue-500/30 selection:text-white scroll-smooth relative bg-pattern">
      {/* Background radial gradients for high-end cyber aesthetics */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Sticky Premium Navigation Bar */}
      <header className="h-16 border-b border-white/5 bg-[#090c12]/85 backdrop-blur-lg sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shadow-lg shadow-blue-500/5">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-extrabold text-[16px] tracking-tight text-white block">Aegis</span>
              <span className="text-[10px] text-text-secondary block leading-none font-medium uppercase tracking-wider">SOC Operations</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-text-secondary">
            <a href="#about" className="hover:text-white transition-colors relative py-1 group">
              Product
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-250" />
            </a>
            <a href="#features" className="hover:text-white transition-colors relative py-1 group">
              Capabilities
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-250" />
            </a>
            <a href="#pipeline" className="hover:text-white transition-colors relative py-1 group">
              How It Works
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-250" />
            </a>
            <a href="#preview" className="hover:text-white transition-colors relative py-1 group">
              Interactive Preview
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-250" />
            </a>
            <a href="#faq" className="hover:text-white transition-colors relative py-1 group">
              FAQ
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-250" />
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/login" className="text-[13px] font-semibold text-text-secondary hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-[12px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-4.5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Varonis-Grade Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> 
              Autonomous Data Security & SOC Analytics
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.1]">
              AI-Powered Threat Detection <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Made Intuitive & Actionable
              </span>
            </h1>
            
            <p className="text-sm md:text-[15px] text-text-secondary leading-relaxed max-w-lg">
              Detect volumetric anomalies, isolate threat vectors, and construct machine learning classification pipelines in one visual dashboard. No complex data science coding or CLI scripting required.
            </p>
            
            <div className="flex flex-wrap gap-4 w-full pt-2">
              <Link
                to="/register"
                className="flex items-center gap-2 font-bold bg-blue-600 hover:bg-blue-500 text-white text-[13px] px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 hover:translate-y-[-1px] active:translate-y-0"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 font-bold bg-white/5 border border-white/10 hover:border-white/20 text-white text-[13px] px-6 py-3.5 rounded-xl transition-all hover:bg-white/10"
              >
                Access Platform Demo
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-white/5 w-full">
              <div>
                <span className="text-2xl font-extrabold text-white block">99.4%</span>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Model Accuracy</span>
              </div>
              <div className="w-[1px] h-8 bg-white/5" />
              <div>
                <span className="text-2xl font-extrabold text-white block">&lt; 2.5ms</span>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Inference Speed</span>
              </div>
              <div className="w-[1px] h-8 bg-white/5" />
              <div>
                <span className="text-2xl font-extrabold text-white block">Real-Time</span>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Packet Sniffing</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column (Interactive Mock Dashboard Preview) */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-15 pointer-events-none" />
            <div className="border border-white/10 rounded-2xl bg-[#090c12] p-6 shadow-2xl relative overflow-hidden space-y-5">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              
              {/* Header inside mock */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase">Aegis Stream Active</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-semibold text-emerald-400">
                  <Zap className="w-3 h-3 text-emerald-400" /> Sniffing Live
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0f131c] border border-white/5 p-3.5 rounded-xl">
                  <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Risk Index</span>
                  <span className="text-xl font-black text-red-500 mt-1 block">8.7</span>
                </div>
                <div className="bg-[#0f131c] border border-white/5 p-3.5 rounded-xl">
                  <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Alerts Today</span>
                  <span className="text-xl font-black text-orange-400 mt-1 block">42</span>
                </div>
                <div className="bg-[#0f131c] border border-white/5 p-3.5 rounded-xl">
                  <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Active Model</span>
                  <span className="text-[11px] font-bold text-blue-400 mt-2 block truncate">RandomForest_v2</span>
                </div>
              </div>

              {/* Feed simulation */}
              <div className="bg-[#0f131c] border border-white/5 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider block">Security Incidents Feed</span>
                {[
                  { type: 'DDoS Volumetric Flow', target: '192.168.1.104', severity: 'Critical', color: 'text-red-400 bg-red-400/10 border-red-400/25' },
                  { type: 'SSH Brute Force Attempt', target: '10.0.4.12', severity: 'High', color: 'text-orange-400 bg-orange-400/10 border-orange-400/25' },
                  { type: 'TCP SYN Port Scan', target: '172.16.89.2', severity: 'Medium', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
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
      <section id="about" className="py-24 px-6 md:px-12 border-b border-white/5 bg-[#090c12]/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Security Literacy</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">What is AI-Driven Threat Detection?</h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto">
              Traditional rule-based systems are bypassable and complex. Aegis uses intelligent machine learning models to detect unknown anomalous behaviors autonomously.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-white/5 rounded-2xl bg-[#090c12] p-6.5 flex flex-col gap-4 relative">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-white text-base">The Perimeter Challenge</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Hackers utilize zero-day exploits, port scanning, and volumetric attacks to bypass rules. Checking thousands of network events manually is impossible for security teams.
              </p>
            </div>

            <div className="border border-white/5 rounded-2xl bg-[#090c12] p-6.5 flex flex-col gap-4 relative">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Brain className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-white text-base">Intelligent Pattern Analysis</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Machine learning models analyze features like packet ratios, duration, and flag counts. The AI learns normal thresholds and flags anomalous spikes or malicious behavior.
              </p>
            </div>

            <div className="border border-white/5 rounded-2xl bg-[#090c12] p-6.5 flex flex-col gap-4 relative">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
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
      <section id="features" className="py-24 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Capabilities</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Platform Features Matrix</h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto">
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
              <div key={i} className="border border-white/5 rounded-2xl bg-[#090c12] p-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <f.icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-bold text-white text-[17px]">{f.title}</h3>
                  <p className="text-text-secondary text-xs leading-relaxed">{f.desc}</p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-emerald-400">{f.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Timeline */}
      <section id="pipeline" className="py-24 px-6 md:px-12 border-b border-white/5 bg-[#090c12]/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Workflow</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">How Aegis Operations Work</h2>
            <p className="text-text-secondary text-sm">From raw network logs to active security monitoring in 6 steps.</p>
          </div>

          <div className="relative border-l border-white/10 pl-8 ml-4 space-y-12">
            {[
              { icon: Upload, title: '1. Ingest Security Data', desc: 'Drag and drop standard network traffic capture logs (CSVs) up to 5MB in size.' },
              { icon: Layers, title: '2. Preprocess & Scale', desc: 'Select feature scaling (StandardScaler) and missing value imputation strategies.' },
              { icon: Cpu, title: '3. Train Classifiers', desc: 'Initiate training. Track performance milestones (Accuracy, F1 scores) in real-time.' },
              { icon: Play, title: '4. Deploy & Activate Model', desc: 'Deploy the best model to the active registry with a single click to enable prediction routing.' },
              { icon: AlertTriangle, title: '5. Analyze Traffic Stream', desc: 'Start the detection engine. Traffic streams map live indicators of compromise and compute risk indexes.' },
              { icon: FileText, title: '6. Review Recommendations', desc: 'Open incidents feed to review target addresses, AbuseIPDB metrics, and firewall blocks.' }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[46px] top-0 w-9 h-9 rounded-full bg-[#090c12] border border-white/10 flex items-center justify-center text-blue-400 shadow-md">
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
      <section id="preview" className="py-24 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Product Preview</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Interactive Workspace Preview</h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto">
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
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/5'
                    : 'bg-[#090c12] border-white/5 text-text-secondary hover:text-white hover:border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Screen Container */}
          <div className="border border-white/10 bg-[#090c12] rounded-2xl p-6 md:p-8 shadow-2xl min-h-[360px] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h4 className="font-extrabold text-white text-[15px]">Security Posture Overview</h4>
                    <span className="text-[10px] text-text-tertiary block mt-0.5">Real-time performance metrics and pipeline state</span>
                  </div>
                  <span className="text-xs font-bold text-blue-400 font-mono bg-blue-500/5 border border-blue-500/15 px-2.5 py-1 rounded-lg">
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
                    <div key={i} className="bg-[#0f131c] border border-white/5 p-4 rounded-xl">
                      <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">{stat.label}</span>
                      <span className="text-lg font-black text-white mt-1.5 block">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'threats' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
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
                    <div key={i} className="flex items-center justify-between p-3.5 bg-[#0f131c] border border-white/5 rounded-xl text-xs">
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
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h4 className="font-extrabold text-white text-[15px]">Dataset Upload Manager</h4>
                    <span className="text-[10px] text-text-tertiary block mt-0.5">Select custom CSV data and compile features</span>
                  </div>
                </div>
                <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center bg-[#0f131c]/50">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
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
      <section className="py-24 px-6 md:px-12 border-b border-white/5 bg-[#090c12]/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Use Cases</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Real-World SOC Scenarios</h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto">
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
              <div key={i} className="border border-white/5 rounded-2xl bg-[#090c12] p-7 flex flex-col justify-between space-y-6">
                <h3 className="font-extrabold text-white text-[16px]">{uc.title}</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block">The Challenge</span>
                    <p className="text-text-secondary text-xs mt-1 leading-relaxed">{uc.problem}</p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">The Solution</span>
                    <p className="text-text-secondary text-xs mt-1 leading-relaxed">{uc.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-24 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Support FAQ</span>
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
              <div key={idx} className="bg-[#090c12] border border-white/5 rounded-2xl overflow-hidden transition-all duration-200">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-text-secondary leading-relaxed border-t border-white/5 bg-[#0f131c]/25">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#090c12] to-[#07090e] border-b border-white/5 text-center">
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
              className="flex items-center gap-2 font-bold bg-blue-600 hover:bg-blue-500 text-white text-[13px] px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/15"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 font-bold bg-white/5 border border-white/10 hover:border-white/20 text-white text-[13px] px-6 py-3.5 rounded-xl transition-all"
            >
              Access Platform Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 bg-[#090c12] text-center border-t border-white/5 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-blue-400" />
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
