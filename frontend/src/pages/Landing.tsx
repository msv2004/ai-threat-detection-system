import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Brain, 
  Activity, 
  ArrowRight, 
  ArrowUpRight,
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  ChevronDown, 
  Lock,
  Server,
  Database,
  Eye,
  Radar,
  Star,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

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

  const services = [
    {
      icon: Shield,
      title: "THREAT MONITORING",
      description: "Continuous AI-powered analysis of network flows, packet headers, and endpoint telemetry to detect intrusion patterns, anomalous behavior, and zero-day attack vectors in real time.",
      tags: ["Real-Time Alerting", "Threat Analysis", "Security Monitoring"]
    },
    {
      icon: Eye,
      title: "VULNERABILITY ASSESSMENT",
      description: "Deep inspection of network topology, protocol weaknesses, and configuration drift to identify exploitable vulnerabilities before adversaries discover them.",
      tags: ["Risk Identification", "Security Analysis", "Remediation Recommend"]
    },
    {
      icon: Brain,
      title: "AI MODEL TRAINING",
      description: "Train, evaluate, and deploy machine learning classifiers on custom network datasets. Supports Random Forest, Decision Tree, Logistic Regression, and Isolation Forest algorithms.",
      tags: ["Model Registry", "Hyperparameter Tuning", "Feature Importance"]
    },
    {
      icon: Database,
      title: "DATASET INTELLIGENCE",
      description: "Upload, preprocess, and profile network capture datasets. Automated feature engineering, missing value imputation, scaling, encoding, and train/test splitting.",
      tags: ["Data Profiling", "Feature Engineering", "Split Management"]
    }
  ];

  const stats = [
    { value: "99.7%", label: "Detection Accuracy" },
    { value: "<4ms", label: "Response Latency" },
    { value: "24/7", label: "Autonomous Monitoring" },
    { value: "50K+", label: "Threats Classified" }
  ];

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary flex flex-col selection:bg-accent/30 selection:text-white overflow-x-hidden">
      
      {/* ── Navigation ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-wider text-accent">{'{ AEGIS }'}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {['Platform', 'Features', 'Solutions', 'Documentation'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary hover:text-white transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="btn btn-gold btn-sm text-xs"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-2 text-text-secondary">
            {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-black/95 border-t border-white/5 overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                {['Platform', 'Features', 'Solutions', 'Documentation'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="block text-sm font-semibold text-text-secondary hover:text-accent transition-colors">
                    {item}
                  </a>
                ))}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  <Link to="/login" className="text-sm font-semibold text-text-secondary">Sign In</Link>
                  <Link to="/register" className="btn btn-gold text-sm w-full">Get Started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero Section ── */}
      <section className="landing-hero-bg relative min-h-screen flex flex-col justify-center items-center pt-44 pb-24 md:pt-52 md:pb-28 overflow-hidden">
        {/* Pulsing golden ambient glow behind the text */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Background cyber imagery overlay */}
        <div className="absolute inset-0 opacity-[0.06] z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        {/* Floating code fragments */}
        <div className="absolute top-[22%] left-[4%] text-[10px] font-mono-data text-white/[0.03] leading-relaxed hidden xl:block pointer-events-none select-none z-0">
          {'if (packet.flags & SYN) {\n  analyze(flow);\n  classify(model);\n}'
            .split('\n').map((line, i) => <div key={i}>{line}</div>)}
        </div>
        <div className="absolute top-[32%] right-[4%] text-[10px] font-mono-data text-white/[0.03] leading-relaxed hidden xl:block pointer-events-none select-none z-0">
          {'0x4500 0x0034 0x1c46\n0x4000 0x4006 0xb1e6\nac10 0a01 ac10 0a02'
            .split('\n').map((line, i) => <div key={i}>{line}</div>)}
        </div>
        
        <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 grid grid-cols-12 relative z-10">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex flex-col items-center justify-center text-center">
            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 0.95, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(3.5rem,8vw,7.5rem)] leading-[1.1] text-white tracking-wide text-center uppercase bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent"
            >
              ADVANCED<br />
              CYBER SECURITY
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto mt-10 leading-relaxed text-center"
            >
              Protect critical systems, sensitive data, and digital operations with proactive 
              AI-powered cybersecurity solutions tailored for evolving network threats.
            </motion.p>

            {/* Redesigned CTA Buttons - with increased vertical/horizontal padding and gap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 mt-12 w-full"
            >
              <Link 
                to="/register" 
                className="btn btn-gold-filled text-sm w-60 h-14 font-display text-base tracking-widest flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
              >
                Get Protected
              </Link>
              <Link 
                to="/login" 
                className="btn btn-gold text-sm w-60 h-14 font-display text-base tracking-widest flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
              >
                Free Assessment
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-accent/30" />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#0a0a0a] border-y border-white/5 py-16">
        <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 grid grid-cols-12">
          <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center flex flex-col items-center justify-center">
                <div className="font-display text-4xl md:text-5xl text-accent tracking-wider font-bold bg-gradient-to-r from-accent via-accent-hover to-accent-secondary bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-xs text-text-tertiary uppercase tracking-[0.15em] mt-2 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section id="features" className="bg-black py-24 md:py-28">
        <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 grid grid-cols-12 gap-y-12">
          {/* Section Header */}
          <div className="col-span-12 text-center flex flex-col items-center">
            <span className="section-badge text-text-tertiary">{'{ OUR CAPABILITIES }'}</span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] text-white mt-6 tracking-wider leading-[1.1] text-center uppercase">
              AI-POWERED SECURITY<br />SOLUTIONS AVAILABLE
            </h2>
          </div>

          {/* Service Cards - Centered 2-column Grid */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="landing-card group p-8 md:p-10 flex flex-col justify-between gap-6 hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex flex-col gap-6">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    {/* Content */}
                    <div>
                      <h3 className="font-display text-2xl text-white tracking-wider mb-3 uppercase">{service.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed mb-4">{service.description}</p>
                      <div className="flex flex-wrap gap-2.5">
                        {service.tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1.5 text-xs text-text-secondary bg-white/[0.02] border border-white/[0.05] px-2.5 py-1 rounded">
                            <span className="w-1 h-1 bg-accent rounded-full" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Arrow link in card footer */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                    <span className="text-[10px] text-text-tertiary tracking-widest uppercase font-mono-data font-bold">Details</span>
                    <div className="w-10 h-10 rounded-full border border-accent/20 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/50 transition-all shrink-0">
                      <ArrowUpRight className="w-4.5 h-4.5 text-accent" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="solutions" className="bg-[#050505] py-24 md:py-28 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 grid grid-cols-12 gap-y-12 relative z-10">
          <div className="col-span-12 text-center flex flex-col items-center">
            <span className="section-badge text-text-tertiary">{'{ HOW IT WORKS }'}</span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white mt-6 tracking-wider leading-[1.1] text-center uppercase">
              END-TO-END AI PIPELINE
            </h2>
          </div>

          <div className="col-span-12 relative">
            {/* Connecting line for desktop layout */}
            <div className="absolute top-[40px] left-[12.5%] right-[12.5%] h-px border-t border-dashed border-accent/20 hidden lg:block z-0" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                { step: '01', title: 'INGEST', desc: 'Upload network capture CSV datasets or connect live packet sniffing adapters.', icon: Database },
                { step: '02', title: 'PREPROCESS', desc: 'Clean, encode, scale, and split data with automated feature engineering.', icon: Cpu },
                { step: '03', title: 'TRAIN', desc: 'Select classifiers, tune hyperparameters, and compile ML models on your data.', icon: Brain },
                { step: '04', title: 'DETECT', desc: 'Deploy models for real-time traffic classification and threat alerting.', icon: Radar },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="landing-card p-8 text-center group flex flex-col justify-between items-center min-h-[260px] border border-white/5 hover:border-accent/20 bg-black/50 backdrop-blur-md relative"
                  >
                    {/* Glowing point behind step number */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-accent/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="font-display text-5xl bg-gradient-to-r from-accent/20 to-accent/30 group-hover:from-accent group-hover:to-accent-hover bg-clip-text text-transparent transition-colors font-bold duration-300">{item.step}</div>
                    <div className="w-12 h-12 mx-auto mt-4 rounded-xl bg-accent/5 border border-accent/15 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-display text-xl text-white tracking-wider mt-4 uppercase">{item.title}</h3>
                    <p className="text-xs text-text-tertiary mt-3 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="documentation" className="bg-black py-24 md:py-28 border-t border-white/5">
        <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 grid grid-cols-12 gap-y-12">
          <div className="col-span-12 text-center flex flex-col items-center">
            <span className="section-badge text-text-tertiary">{'{ FAQ }'}</span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,3.5rem)] text-white mt-6 tracking-wider leading-[1.1] text-center uppercase">
              COMMON QUESTIONS
            </h2>
          </div>

          <div className="col-span-12 lg:col-start-3 lg:col-span-8 space-y-4 w-full text-left">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="landing-card"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:text-accent transition-colors duration-200"
                >
                  <span className="text-sm font-semibold text-white group-hover:text-accent pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4.5 h-4.5 text-accent shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-accent' : 'text-accent/60'}`} />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-sm text-text-secondary leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-[#050505] py-24 md:py-28 border-t border-white/5 relative overflow-hidden">
        {/* Background glow orb */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 grid grid-cols-12 relative z-10">
          <div className="col-span-12 lg:col-start-3 lg:col-span-8 flex flex-col items-center justify-center text-center w-full">
            <span className="section-badge text-text-tertiary">{'{ GET STARTED }'}</span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white mt-6 tracking-wider leading-[1.1] text-center uppercase">
              SECURE YOUR NETWORK TODAY
            </h2>
            <p className="text-text-secondary mt-6 max-w-xl mx-auto text-center leading-relaxed">
              Deploy Aegis AI SOC in minutes. Upload your first dataset, train a classifier, and start detecting threats autonomously.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 mt-12 w-full">
              <Link 
                to="/register" 
                className="btn btn-gold-filled text-sm w-60 h-14 font-display text-base tracking-widest flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
              >
                Start Free
              </Link>
              <Link 
                to="/login" 
                className="btn btn-gold text-sm w-60 h-14 font-display text-base tracking-widest flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black border-t border-white/5 py-12">
        <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 grid grid-cols-12 gap-y-6 items-center">
          <div className="col-span-12 md:col-span-4 flex items-center justify-center md:justify-start gap-2">
            <span className="font-display text-xl text-accent tracking-wider">{'{ AEGIS }'}</span>
            <span className="text-xs text-text-tertiary">AI Threat Detection Platform</span>
          </div>
          <div className="col-span-12 md:col-span-4 flex items-center justify-center gap-8">
            {['Privacy', 'Terms', 'Security', 'Status'].map(link => (
              <a key={link} href="#" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors uppercase tracking-wider font-medium">
                {link}
              </a>
            ))}
          </div>
          <div className="col-span-12 md:col-span-4 text-center md:text-right text-xs text-text-tertiary">
            © 2026 Aegis SOC-MSV. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
