import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Shield, Loader, AlertTriangle, CheckCircle2, Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = zod.object({
  email: zod.string().email({ message: 'Enter a valid security email address' }),
  password: zod.string().min(6, { message: 'Passphrase key must be at least 6 characters' }),
  confirmPassword: zod.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Secret keys do not match',
  path: ['confirmPassword']
});

type RegisterFields = zod.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema)
  });

  const watchPassword = watch('password', '');
  const passStrength = watchPassword.length === 0 ? 0 : watchPassword.length < 6 ? 1 : watchPassword.length < 10 ? 2 : 3;

  const onSubmit = async (data: RegisterFields) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.register(data.email, data.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Registration failed. Operator email might be already registered.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-semantic-success/10 border border-semantic-success/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-semantic-success" />
          </div>
          <h2 className="text-xl font-bold text-white">Account Created</h2>
          <p className="text-sm text-text-secondary mt-2">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-semantic-ai/3 rounded-full blur-[100px]" />
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
          <h1 className="text-3xl text-white heading-display tracking-wider">Create Account</h1>
          <p className="text-sm text-text-secondary mt-1">Register for the security operations platform</p>
        </div>

        {/* Form Card */}
        <div className="card-static p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-semantic-critical/8 border border-semantic-critical/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-semantic-critical shrink-0 mt-0.5" />
                <span className="text-xs text-semantic-critical">{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs text-text-secondary mb-2 font-medium">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="analyst@aegis-soc.io"
                className="input"
                autoComplete="email"
              />
              {errors.email && <span className="text-[11px] text-semantic-critical mt-1 block">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-2 font-medium">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="new-password"
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
              
              {/* Password strength */}
              {watchPassword.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3].map(level => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passStrength >= level
                          ? level === 1 ? 'bg-semantic-critical' : level === 2 ? 'bg-semantic-warning' : 'bg-semantic-success'
                          : 'bg-surface-3'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-2 font-medium">Confirm Password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="input"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="text-[11px] text-semantic-critical mt-1 block">{errors.confirmPassword.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg text-sm font-bold"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-border-default">
            <span className="text-xs text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:text-accent-hover font-bold transition-colors">
                Sign In
              </Link>
            </span>
          </div>
        </div>

        <div className="text-center mt-6">
          <span className="text-[10px] text-text-tertiary">Protected by Aegis SOC • End-to-end encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
