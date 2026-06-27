import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/api';
import { Shield, Loader, AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = zod.object({
  email: zod.string().email({ message: 'Enter a valid security email address' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFields = zod.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.login(data.email, data.password);
      if (rememberMe) {
        localStorage.setItem('aegis_remembered_email', data.email);
      } else {
        localStorage.removeItem('aegis_remembered_email');
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-semantic-ai/3 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(99, 102, 241, 0.05)"/>
                <path d="M12 11V7" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="15" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-base tracking-widest text-white uppercase leading-none font-display">AEGIS</span>
              <span className="text-[9px] text-accent font-mono-data tracking-wider uppercase leading-none mt-1">SOC-MSV</span>
            </div>
          </Link>
          <h1 className="text-3xl text-white heading-display tracking-wider">Welcome Back</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to your security operations console</p>
        </div>

        {/* Form Card */}
        <div className="card-static p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-semantic-critical/8 border border-semantic-critical/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-semantic-critical shrink-0 mt-0.5" />
                <span className="text-xs text-semantic-critical">{errorMsg}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs text-text-secondary mb-2 font-medium">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="operator@aegis-soc.io"
                className="input"
                autoComplete="email"
                defaultValue={localStorage.getItem('aegis_remembered_email') || ''}
              />
              {errors.email && <span className="text-[11px] text-semantic-critical mt-1 block">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-text-secondary font-medium">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-accent hover:text-accent-hover transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[11px] text-semantic-critical mt-1 block">{errors.password.message}</span>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border-strong bg-surface-0 text-accent accent-accent"
              />
              <label htmlFor="remember" className="text-xs text-text-secondary cursor-pointer">Remember this device</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg text-sm font-bold"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="text-center mt-6 pt-5 border-t border-border-default">
            <span className="text-xs text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent hover:text-accent-hover font-bold transition-colors">
                Create Account
              </Link>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <span className="text-[10px] text-text-tertiary">Protected by Aegis SOC • End-to-end encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
