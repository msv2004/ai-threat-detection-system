import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 cyber-grid relative overflow-hidden">
      <div className="scanline" />
      <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-semantic-ai/5 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-surface-1 border border-border-strong rounded-2xl p-8 shadow-2xl relative z-10"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle border border-accent-border/30 flex items-center justify-center mb-3">
            <Key className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Key Recovery</h1>
          <span className="text-[9px] text-text-tertiary tracking-widest font-mono-data uppercase mt-1">REQUEST CREDENTIAL RESET</span>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center text-xs">
            <div className="p-4 bg-semantic-success/10 border border-semantic-success/20 rounded-lg flex flex-col items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-semantic-success" />
              <div className="text-text-secondary leading-relaxed font-mono-data text-center">
                Reset hash requested. Please contact your SOC system administrator or inspect local database credentials logs to retrieve the recovery key.
              </div>
            </div>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-xs font-mono-data text-accent hover:underline font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-left text-xs font-semibold">
            <div className="space-y-1.5">
              <label className="block font-mono-data text-text-secondary uppercase tracking-wider text-[10px]">OPERATOR EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@aegis.local"
                className="input rounded-lg font-mono-data"
              />
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-3 font-mono-data text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
            >
              Generate Recovery Hash
            </button>

            <div className="text-center pt-2">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-xs font-mono-data text-text-tertiary hover:text-text-secondary"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
