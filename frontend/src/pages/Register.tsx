import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Shield, Loader, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
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
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Register Operator</h1>
          <span className="text-[9px] text-text-tertiary tracking-widest font-mono-data uppercase mt-1">ENCRYPT OPERATOR CREDENTIALS</span>
        </div>

        {/* Status panels */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-semantic-critical/10 border border-semantic-critical/20 rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-semantic-critical shrink-0 mt-0.5" />
            <div className="text-xs text-semantic-critical font-mono-data leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 bg-semantic-success/10 border border-semantic-success/20 rounded-lg flex items-start gap-2.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-semantic-success shrink-0 mt-0.5" />
            <div className="text-xs text-semantic-success font-mono-data leading-relaxed">
              Operator created successfully. Routing to portal access decrypter...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left text-xs font-semibold">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block font-mono-data text-text-secondary uppercase tracking-wider text-[10px]">OPERATOR EMAIL</label>
            <input
              type="email"
              {...register('email')}
              placeholder="operator@aegis.local"
              disabled={success || loading}
              className={`
                input rounded-lg font-mono-data
                ${errors.email ? 'border-semantic-critical/50' : 'border-border-strong'}
              `}
            />
            {errors.email && (
              <span className="text-[10px] text-semantic-critical font-mono-data mt-1 block">{errors.email.message}</span>
            )}
          </div>

          {/* Passphrase */}
          <div className="space-y-1.5">
            <label className="block font-mono-data text-text-secondary uppercase tracking-wider text-[10px]">PASSPHRASE KEY</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                disabled={success || loading}
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

            {/* Strength meter */}
            {watchPassword.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[8px] text-text-tertiary font-bold font-mono-data">
                  <span>KEY STRENGTH:</span>
                  <span className={passStrength === 1 ? 'text-semantic-critical' : passStrength === 2 ? 'text-semantic-warning' : 'text-semantic-success'}>
                    {passStrength === 1 ? 'WEAK' : passStrength === 2 ? 'MODERATE' : 'STRONG'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 h-1 bg-surface-0 rounded-full overflow-hidden">
                  <div className={`h-full ${passStrength >= 1 ? 'bg-semantic-critical' : ''}`} />
                  <div className={`h-full ${passStrength >= 2 ? 'bg-semantic-warning' : ''}`} />
                  <div className={`h-full ${passStrength >= 3 ? 'bg-semantic-success' : ''}`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Passphrase */}
          <div className="space-y-1.5">
            <label className="block font-mono-data text-text-secondary uppercase tracking-wider text-[10px]">CONFIRM PASSPHRASE KEY</label>
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              disabled={success || loading}
              className={`
                input rounded-lg font-mono-data
                ${errors.confirmPassword ? 'border-semantic-critical/50' : 'border-border-strong'}
              `}
            />
            {errors.confirmPassword && (
              <span className="text-[10px] text-semantic-critical font-mono-data mt-1 block">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full btn btn-primary py-3 font-mono-data text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-3"
          >
            {loading ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" />
                Encrypting Node Operator...
              </>
            ) : (
              'Register Operator Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-text-secondary border-t border-border-default pt-6">
          <span>Already registered in this node?</span>{' '}
          <Link to="/login" className="text-accent font-bold hover:underline transition-all">
            Access Session
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
