import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Brain, 
  Activity, 
  Terminal, 
  BarChart3, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Upload, 
  Cpu, 
  Zap, 
  Play, 
  ChevronDown, 
  Lock,
  Server,
  Code,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'threats' | 'datasets'>('dashboard');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "How does Aegis capture network packet flows?",
      a: "Aegis runs a localized network flow analyzer. Under live adapter mode, it sniffs network packet headers (TCP/UDP/ICMP), aggregates them into bidirectional network flows, extracts statistical features, and sends them to the ML pipeline. In replay mode, it parses raw PCAP files using a flow compiler."
    },
    {
      q: "Which machine learning algorithms are supported?",
      a: "Aegis supports Random Forest, Decision Tree, Support Vector Machine (SVM), and Isolation Forest (for unsupervised anomaly scoring). Models are compiled on training datasets, registered in the model registry, and can be dynamically hot-swapped for live streaming classification."
    },
    {
      q: "Is any user data or network content leaked to the cloud?",
      a: "No. Aegis runs locally or in your private virtual private cloud (VPC). The network packets are parsed on-the-fly and only statistical metadata (source/destination IP, port, packet rates) is evaluated. Payload content is never inspected or stored, adhering to strict data sovereignty rules."
    },
    {
      q: "What network dataset does Aegis train on?",
      a: "You can upload any labeled CSV dataset (e.g. CIC-IDS2017, UNSW-NB15, or NSL-KDD formats). Aegis features a Dataset Profile Analyzer to check missing fields, label encode categorical strings, scale data using Standard/MinMax scalers, and generate custom training splits."
    }
  ];

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary flex flex-col font-sans selection:bg-accent/30 selection:text-white scroll-smooth relative overflow-x-hidden cyber-grid">
      {/* Glow backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-r from-accent/10 via-semantic-ai/5 to-semantic-info/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[800px] -right-1/4 w-[500px] h-[500px] bg-semantic-ai/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-border-default bg-surface-0/80 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shadow-lg relative group">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-widest text-white">AEGIS SOC</span>
              <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider leading-none mt-0.5">AI Operations</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-text-secondary">
            <a href="#about" className="hover:text-white transition-colors py-1">Overview</a>
            <a href="#features" className="hover:text-white transition-colors py-1">Capabilities</a>
            <a href="#pipeline" className="hover:text-white transition-colors py-1">ML Pipeline</a>
            <a href="#preview" className="hover:text-white transition-colors py-1">SOC Preview</a>
            <a href="#faq" className="hover:text-white transition-colors py-1">FAQ</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-white transition-colors">
            Operator Sign In
          </Link>
          <Link
            to="/register"
            className="btn btn-primary btn-sm rounded-lg"
          >
            Access Platform Free
          </Link>
        </div>
      </header>

      {/* Hero Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 px-6 md:px-12 border-b border-border-default">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent-border/30 text-[10px] font-bold text-accent uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-accent animate-pulse" /> 
              Autonomous Threat Classification SOC
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              AI-Driven Intrusion <br />
              <span className="bg-gradient-to-r from-accent via-semantic-info to-semantic-ai bg-clip-text text-transparent">
                Detection & Mitigation
              </span>
            </h1>
            
            <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-lg">
              Aggregate volumetric flow packet streams, preprocess datasets with integrated standardizers, train machine learning model classifiers, and investigate malicious anomalies inside one unified SaaS workspace.
            </p>
            
            <div className="flex flex-wrap gap-4 w-full pt-2">
              <Link
                to="/register"
                className="flex items-center gap-2 font-bold bg-accent hover:bg-accent-hover text-[#02040a] text-xs px-5 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:translate-y-[1px]"
              >
                Register Operator Access <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 font-bold bg-surface-1 border border-border-strong text-white text-xs px-5 py-3 rounded-lg transition-all hover:bg-surface-2"
              >
                Launch Live Demo
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-8 border-t border-border-default w-full">
              <div>
                <span className="text-2xl font-black text-white block font-mono-data">99.4%</span>
                <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">Classification Accuracy</span>
              </div>
              <div className="w-[1px] h-8 bg-border-default" />
              <div>
                <span className="text-2xl font-black text-white block font-mono-data">&lt; 2.5ms</span>
                <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">Inference Step latency</span>
              </div>
              <div className="w-[1px] h-8 bg-border-default" />
              <div>
                <span className="text-2xl font-black text-semantic-success block font-mono-data">Real-Time</span>
                <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">Telemetry Stream</span>
              </div>
            </div>
          </div>

          {/* Right Hero Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-semantic-ai rounded-2xl blur opacity-15 pointer-events-none" />
            <div className="border border-border-strong rounded-2xl bg-surface-1 p-5 shadow-2xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              
              <div className="flex items-center justify-between border-b border-border-default pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-semantic-critical animate-ping" />
                  <span className="text-[9px] font-bold tracking-wider text-text-secondary uppercase">Ingress Telemetry Stream</span>
                </div>
                <div className="flex items-center gap-1 bg-semantic-success/10 border border-semantic-success/20 px-2 py-0.5 rounded text-[9px] font-bold text-semantic-success">
                  <Activity className="w-3 h-3 text-semantic-success" /> Capture active
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-0 border border-border-default p-3 rounded-lg text-left">
                  <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-widest">Risk Factor</span>
                  <span className="text-lg font-black text-semantic-critical mt-1 block font-mono-data">9.4</span>
                </div>
                <div className="bg-surface-0 border border-border-default p-3 rounded-lg text-left">
                  <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-widest">Alert Count</span>
                  <span className="text-lg font-black text-semantic-warning mt-1 block font-mono-data">14</span>
                </div>
                <div className="bg-surface-0 border border-border-default p-3 rounded-lg text-left">
                  <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-widest">Inference engine</span>
                  <span className="text-[10px] font-bold text-accent mt-2 block truncate font-mono-data">RFC_Active_v1</span>
                </div>
              </div>

              <div className="bg-surface-0 border border-border-default rounded-xl p-3 space-y-2">
                <span className="text-[9px] font-extrabold text-text-secondary uppercase tracking-widest block text-left">Threat Classification Feed</span>
                {[
                  { name: 'DDoS Volumetric Spike', dst: '192.168.10.45', sev: 'Critical', style: 'text-semantic-critical bg-semantic-critical/10 border-semantic-critical/20' },
                  { name: 'SSH Port Scan Sweep', dst: '10.0.1.201', sev: 'High', style: 'text-semantic-investigate bg-semantic-investigate/10 border-semantic-investigate/20' },
                  { name: 'Anomaly Payload Flag', dst: '172.16.8.9', sev: 'Medium', style: 'text-semantic-warning bg-semantic-warning/10 border-semantic-warning/20' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs border-b border-border-default pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-3.5 h-3.5 ${i === 0 ? 'text-semantic-critical' : i === 1 ? 'text-semantic-investigate' : 'text-semantic-warning'}`} />
                      <span className="font-semibold text-white">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-[9px] text-text-tertiary">{item.dst}</span>
                      <span className={`px-1.5 py-0.5 border rounded text-[8px] font-extrabold uppercase ${item.style}`}>
                        {item.sev}
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
      <section id="about" className="py-20 px-6 md:px-12 border-b border-border-default bg-surface-1/10">
        <div className="max-w-6xl mx-auto text-left">
          <div className="mb-14 space-y-2">
            <span className="text-[10px] font-extrabold text-accent uppercase tracking-widest block">AI Threat Diagnostics</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">What is Intelligent Threat Detection?</h2>
            <p className="text-text-secondary text-sm max-w-xl leading-relaxed">
              Static firewall rules and signature blocks are no longer sufficient. Aegis models network volumetric signatures as feature nodes, deploying machine learning algorithms to isolate attacks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-semantic-critical/10 border border-semantic-critical/20 flex items-center justify-center text-semantic-critical">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">The Perimeter Challenge</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Zero-day exploitation, stealth scanning, and distributed volume packet flooding bypass traditional block rules. Inspecting millions of log strings manually is mathematically impossible.
              </p>
            </div>

            <div className="card p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-semantic-ai/10 border border-semantic-ai/20 flex items-center justify-center text-semantic-ai">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Continuous ML Learning</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Aegis models packet variables: flow duration, packet bytes, flag ratios, and latency. The engine trains classifications (Random Forests, Trees, SVMs) to build predictive anomalies bounds.
              </p>
            </div>

            <div className="card p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-semantic-success/10 border border-semantic-success/20 flex items-center justify-center text-semantic-success">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Mitigation Workflows</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Anomaly flows are logged and mapped to MITRE ATT&CK vectors (T1043). Security analysts get recommendations, AbuseIPDB reputation scores, and status routing for mitigating risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Matrix */}
      <section id="features" className="py-20 px-6 md:px-12 border-b border-border-default">
        <div className="max-w-6xl mx-auto text-left">
          <div className="mb-14 space-y-2">
            <span className="text-[10px] font-extrabold text-accent uppercase tracking-widest block">Capabilities</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">SOC Platform Matrix</h2>
            <p className="text-text-secondary text-sm max-w-xl leading-relaxed">
              Enterprise security features engineered for data analysts, network engineers, and security compliance operators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Database,
                title: 'Data Ingestion & Splits',
                desc: 'Ingest security logs and network flow CSV files. Perform label encoding, remove null values, scale metrics, and compile training splits.',
              },
              {
                icon: Brain,
                title: 'Training Console',
                desc: 'Select preprocessing pipeline configurations. Adjust classifiers (Decision Trees, Random Forests, SVMs) and monitor live metrics.',
              },
              {
                icon: Cpu,
                title: 'Model Hot-Swaps',
                desc: 'Evaluate versioned models, review accuracy levels, inspect individual decision weights, and activate optimal classifiers.',
              },
              {
                icon: Activity,
                title: 'Telemetry Sniffers',
                desc: 'Simulate capture sweeps. Read network adapters or replay PCAP dump flows, evaluating stream telemetry with low latencies.',
              },
              {
                icon: Shield,
                title: 'MITRE Incident Mapping',
                desc: 'Group detections into incident registries mapped to standard techniques. Investigate origin vector structures and VT hits.',
              },
              {
                icon: BarChart3,
                title: 'Intel Analytics',
                desc: 'Generate incident growth charts, vector severity donuts, classification precision radars, and latency stability lines.',
              },
            ].map((cap, i) => (
              <div key={i} className="card p-6 space-y-3">
                <div className="w-9 h-9 rounded bg-surface-2 border border-border-default flex items-center justify-center text-accent">
                  <cap.icon className="w-5.5 h-5.5" />
                </div>
                <h4 className="font-bold text-white text-sm">{cap.title}</h4>
                <p className="text-text-secondary text-xs leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Mockup Previews */}
      <section id="preview" className="py-20 px-6 md:px-12 border-b border-border-default bg-surface-1/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="text-[10px] font-extrabold text-[#a855f7] uppercase tracking-widest block">Operational Console</span>
            <h2 className="text-3xl font-extrabold text-white">Interactive Console Previews</h2>
            <p className="text-text-secondary text-xs max-w-md mx-auto leading-relaxed">
              Explore how Aegis parses dataset flows, compiles models, and aggregates incident timelines.
            </p>
          </div>

          {/* Selector Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8 bg-surface-1 border border-border-default p-1 rounded-xl max-w-md mx-auto">
            {(['dashboard', 'threats', 'datasets'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 text-center py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer
                  ${activeTab === tab ? 'bg-accent/10 border border-accent/20 text-accent' : 'text-text-secondary hover:text-white'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Previews Container */}
          <div className="border border-border-strong rounded-2xl bg-surface-1 p-6 max-w-4xl mx-auto shadow-2xl relative">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center justify-between border-b border-border-default pb-3">
                    <span className="text-xs font-bold text-white uppercase font-mono-data">Dashboard Real-Time Monitoring</span>
                    <span className="text-[9px] font-bold text-semantic-success uppercase bg-semantic-success/10 border border-semantic-success/20 px-2 py-0.5 rounded">CONNECTED</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-surface-0 border border-border-default p-4 rounded-xl text-left">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">Active Adapter</span>
                      <span className="text-sm font-bold text-white block mt-1 font-mono-data">Wi-Fi (Live)</span>
                    </div>
                    <div className="bg-surface-0 border border-border-default p-4 rounded-xl text-left">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">Telemetry Latency</span>
                      <span className="text-sm font-bold text-white block mt-1 font-mono-data">0.08 ms</span>
                    </div>
                    <div className="bg-surface-0 border border-border-default p-4 rounded-xl text-left">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">Average accuracy</span>
                      <span className="text-sm font-bold text-white block mt-1 font-mono-data">99.4%</span>
                    </div>
                    <div className="bg-surface-0 border border-border-default p-4 rounded-xl text-left">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">Model Status</span>
                      <span className="text-sm font-bold text-semantic-success block mt-1 font-mono-data">ACTIVE</span>
                    </div>
                  </div>
                  <div className="bg-surface-0 border border-border-default p-4 rounded-xl h-36 flex items-center justify-center">
                    <div className="text-center space-y-1">
                      <Activity className="w-6 h-6 text-accent animate-pulse mx-auto" />
                      <span className="text-[10px] text-text-secondary block font-mono-data">Rendering Ingress Telemetry Chart Rates...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'threats' && (
                <motion.div
                  key="threats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center justify-between border-b border-border-default pb-3">
                    <span className="text-xs font-bold text-white uppercase font-mono-data">Threat Registry Database Logs</span>
                    <span className="text-[9px] font-bold text-semantic-critical uppercase bg-semantic-critical/10 border border-semantic-critical/20 px-2 py-0.5 rounded">ATTACK ACTIVE</span>
                  </div>
                  <div className="overflow-x-auto text-[11px] font-mono-data">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border-default text-text-tertiary font-bold">
                          <th className="pb-2">SEVERITY</th>
                          <th className="pb-2">CLASSIFICATION</th>
                          <th className="pb-2">SOURCE VECTOR</th>
                          <th className="pb-2">MITRE ATT&CK</th>
                          <th className="pb-2">VT HIT</th>
                        </tr>
                      </thead>
                      <tbody className="text-text-secondary divide-y divide-border-default">
                        <tr>
                          <td className="py-2 text-semantic-critical font-bold">CRITICAL</td>
                          <td className="py-2 text-white font-bold">DDoS Volumetric Flow</td>
                          <td className="py-2">192.168.1.112 → 10.0.0.8</td>
                          <td className="py-2 text-accent">T1498 (Flooding)</td>
                          <td className="py-2 font-bold text-semantic-critical">9/10</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-semantic-investigate font-bold">HIGH</td>
                          <td className="py-2 text-white font-bold">SSH Login Brute Force</td>
                          <td className="py-2">10.0.4.15 → 10.0.0.22</td>
                          <td className="py-2 text-accent">T1110 (Brute Force)</td>
                          <td className="py-2 font-bold text-semantic-warning font-mono-data">3/10</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'datasets' && (
                <motion.div
                  key="datasets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center justify-between border-b border-border-default pb-3">
                    <span className="text-xs font-bold text-white uppercase font-mono-data">Dataset Ingestion & Splits</span>
                    <span className="text-[9px] font-bold text-semantic-info uppercase bg-semantic-info/10 border border-semantic-info/20 px-2 py-0.5 rounded font-mono-data">VITE COMPILER</span>
                  </div>
                  <div className="border border-dashed border-border-strong bg-surface-0 rounded-xl p-6 text-center">
                    <Upload className="w-6 h-6 text-text-tertiary mx-auto mb-2" />
                    <span className="text-[11px] text-text-secondary font-bold block">Drag & drop your network flow CSV file here</span>
                    <span className="text-[9px] text-text-tertiary mt-1 block">Maximum size limit 5MB (Ingestion parser resolves row scaling)</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Technology Stack / Deployment section */}
      <section id="pipeline" className="py-20 px-6 md:px-12 border-b border-border-default">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">Deploy Architecture</span>
            <h2 className="text-3xl font-extrabold text-white">Platform Stack & Pipeline</h2>
            <p className="text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
              Built on containerized FastAPI backends, Alembic database logs, and React query hooks.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-2">
              <Server className="w-6 h-6 text-[#38bdf8] mx-auto" />
              <h5 className="font-bold text-white text-xs">FastAPI Service</h5>
              <span className="text-[10px] text-text-tertiary block font-mono-data">Python API Router</span>
            </div>
            <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-2">
              <Brain className="w-6 h-6 text-semantic-ai mx-auto" />
              <h5 className="font-bold text-white text-xs">Scikit-Learn ML</h5>
              <span className="text-[10px] text-text-tertiary block font-mono-data">Classifier Pipeline</span>
            </div>
            <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-2">
              <Code className="w-6 h-6 text-[#818cf8] mx-auto" />
              <h5 className="font-bold text-white text-xs">Vite / React 19</h5>
              <span className="text-[10px] text-text-tertiary block font-mono-data">Client Application</span>
            </div>
            <div className="bg-surface-1 border border-border-default rounded-xl p-5 space-y-2">
              <Database className="w-6 h-6 text-semantic-success mx-auto" />
              <h5 className="font-bold text-white text-xs">PostgreSQL logs</h5>
              <span className="text-[10px] text-text-tertiary block font-mono-data">Alembic DB migrations</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 md:px-12 border-b border-border-default bg-surface-1/10">
        <div className="max-w-4xl mx-auto text-left">
          <div className="text-center mb-14 space-y-2">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">Operator Help</span>
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
              Got questions about datasets, live sniffer captures, or model weights? Check answers below.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, i) => (
              <div key={i} className="bg-surface-1 border border-border-default rounded-xl overflow-hidden transition-all duration-200">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-bold text-white text-xs md:text-sm">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform duration-200 shrink-0 ${openFaq === i ? 'rotate-180 text-white' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-xs text-text-secondary leading-relaxed border-t border-border-subtle pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 px-6 md:px-12 text-center bg-gradient-to-b from-surface-0 to-surface-1">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Ready to Secure Your Ingress Nodes?</h2>
          <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
            Upload CSV packet flows, compile custom Random Forest classifiers, and monitor threat incidents in real time today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="btn btn-primary"
            >
              Launch Aegis Console
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              View Github Repository
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-border-default bg-surface-0 text-text-tertiary text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-accent" />
            <span className="font-extrabold text-[11px] text-white tracking-widest">AEGIS SECURITY SYSTEMS</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Aegis SOC. Licensed under enterprise compliance protocols.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
