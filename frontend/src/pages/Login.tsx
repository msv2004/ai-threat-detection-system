import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/api';
import { Shield, Loader, AlertTriangle, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 cyber-grid relative overflow-hidden">
      {/* Decorative cyber grid scanline */}
      <div className="scanline" />
      <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-semantic-ai/5 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-surface-1 border border-border-strong rounded-2xl p-8 shadow-2xl relative z-10"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle border border-accent-border/30 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Aegis SOC Portal</h1>
          <span className="text-[9px] text-text-tertiary tracking-widest font-mono-data uppercase mt-1">SECURE PORTAL ACCESS</span>
        </div>

        {/* Error messaging */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-semantic-critical/10 border border-semantic-critical/20 rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-semantic-critical shrink-0 mt-0.5" />
            <div className="text-xs text-semantic-critical font-mono-data leading-relaxed">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left text-xs font-semibold">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block font-mono-data text-text-secondary uppercase tracking-wider text-[10px]">SECURE EMAIL ADDRESS</label>
            <input
              type="email"
              {...register('email')}
              placeholder="operator@aegis.local"
              defaultValue={localStorage.getItem('aegis_remembered_email') || ''}
              className={`
                input rounded-lg font-mono-data
                ${errors.email ? 'border-semantic-critical/50' : 'border-border-strong'}
              `}
            />
            {errors.email && (
              <span className="text-[10px] text-semantic-critical font-mono-data mt-1 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block font-mono-data text-text-secondary uppercase tracking-wider text-[10px]">OPERATOR PASSPHRASE</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={`
                  input rounded-lg font-mono-data pr-10
                  ${errors.password ? 'border-semantic-critical/50' : 'border-border-strong'}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-semantic-critical font-mono-data mt-1 block">{errors.password.message}</span>
            )}
          </div>

          {/* Remember me & forgot password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-surface-0 border border-border-strong text-accent accent-accent"
              />
              <span>Remember Email</span>
            </label>
            <Link to="/forgot-password" className="text-accent hover:underline font-bold transition-all">
              Forgot Secret?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 font-mono-data text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" />
                Validating Security Hash...
              </>
            ) : (
              'Authenticate Operator'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-text-secondary border-t border-border-default pt-6">
          <span>Need new operator credentials?</span>{' '}
          <Link to="/register" className="text-accent font-bold hover:underline transition-all">
            Register Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
