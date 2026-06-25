import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#080b11] flex items-center justify-center p-4 cyber-grid">
      <div className="w-full max-w-md bg-[#0a0f1d] border border-white/5 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="scanline" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/25 rounded-lg mb-3">
            <Key className="w-8 h-8 text-[#06b6d4]" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white m-0">KEY RECOVERY</h1>
          <span className="text-[10px] text-white/40 tracking-widest font-mono uppercase mt-1">REQUEST CREDENTIAL RESET</span>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-950/35 border border-emerald-500/30 rounded-lg flex flex-col items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div className="text-xs text-emerald-300 font-mono text-center">
                Reset code generated. Please contact your SOC system administrator or check local system logs to retrieve the recovery hash.
              </div>
            </div>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-xs font-mono text-[#06b6d4] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wider">OPERATOR EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@aegis.local"
                className="w-full bg-[#070b13] border border-white/10 px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4] font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-500/60 text-[#06b6d4] font-mono font-medium py-3 px-4 rounded-lg text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              GENERATE RECOVERY KEY
            </button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
