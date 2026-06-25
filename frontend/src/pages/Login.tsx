import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/api';
import { Shield, Loader, AlertTriangle } from 'lucide-react';

const loginSchema = zod.object({
  email: zod.string().email({ message: 'Enter a valid security email address' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFields = zod.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] flex items-center justify-center p-4 cyber-grid">
      <div className="w-full max-w-md bg-[#0a0f1d] border border-white/5 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Neon accent scans */}
        <div className="scanline" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/25 rounded-lg mb-3">
            <Shield className="w-8 h-8 text-[#06b6d4]" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white m-0">SOC TERMINAL</h1>
          <span className="text-[10px] text-white/40 tracking-widest font-mono uppercase mt-1">SECURE PORTAL ACCESS</span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/35 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-300 font-mono">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wider">SECURE EMAIL</label>
            <input
              type="email"
              {...register('email')}
              placeholder="operator@aegis.local"
              className={`
                w-full bg-[#070b13] border px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4] font-mono transition-colors
                ${errors.email ? 'border-red-500/50' : 'border-white/10'}
              `}
            />
            {errors.email && (
              <span className="text-[10px] text-red-400 font-mono mt-1 block">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wider">SECRET PASSPHRASE</label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className={`
                w-full bg-[#070b13] border px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4] font-mono transition-colors
                ${errors.password ? 'border-red-500/50' : 'border-white/10'}
              `}
            />
            {errors.password && (
              <span className="text-[10px] text-red-400 font-mono mt-1 block">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-500/60 text-[#06b6d4] font-mono font-medium py-3 px-4 rounded-lg text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>DECRYPTING SESSION...</span>
              </>
            ) : (
              <span>INITIALIZE PORTAL</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-white/30 space-y-2">
          <div>
            <span>New Operator? </span>
            <Link to="/register" className="text-[#06b6d4] hover:underline font-mono">
              Register Credentials
            </Link>
          </div>
          <div>
            <Link to="/forgot-password" className="text-white/40 hover:underline">
              Recover access key?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
