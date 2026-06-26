import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Key, ArrowLeft, CheckCircle2, Shield, Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-accent" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-sm text-text-secondary mt-1">Enter your email to receive a recovery link</p>
        </div>

        <div className="card-static p-8">
          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-semantic-success/10 border border-semantic-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-semantic-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Recovery Requested</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Reset hash requested. Please contact your SOC system administrator or inspect local database credentials logs to retrieve the recovery key.
                </p>
              </div>
              <Link 
                to="/login" 
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs text-text-secondary mb-2 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@aegis-soc.io"
                  className="input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg text-sm font-bold flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Recovery Link
              </button>

              <div className="text-center pt-2">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <span className="text-[10px] text-text-tertiary">Protected by Aegis SOC • End-to-end encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
