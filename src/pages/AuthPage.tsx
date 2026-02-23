import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
export function AuthPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const login = useChatStore((s) => s.login);
  const isLoading = useChatStore((s) => s.isLoading);
  const navigate = useNavigate();
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep('otp');
    toast.success('Simulation Code Sent', {
      description: 'Enter any 6-digit code to proceed with the demo.'
    });
  };
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    try {
      await login(email);
      navigate('/chat');
      toast.success('Authenticated', { description: 'Connected to the edge network.' });
    } catch (err) {
      toast.error('Authentication Failed', { description: (err as Error).message });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent)]" />
      {isLoading && (
        <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 text-blue-400"
          >
            <Loader2 className="w-12 h-12 animate-spin" />
            <span className="font-bold tracking-widest uppercase text-xs">Synchronizing...</span>
          </motion.div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-blue-600/20">
            <motion.div
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              initial={{ width: '0%' }}
              animate={{ width: step === 'email' ? '50%' : '100%' }}
            />
          </div>
          <CardHeader className="space-y-1 text-center pt-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white font-display">
              {step === 'email' ? 'Identity' : 'Verify'}
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              {step === 'email'
                ? 'Join Velocity with sub-millisecond entry'
                : `Security code sent to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleEmailSubmit}
                  className="space-y-4"
                >
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-slate-800 border-white/10 text-white h-12 rounded-xl focus:ring-blue-500/50"
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all group rounded-xl shadow-lg shadow-blue-900/20"
                    disabled={isLoading}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleOtpSubmit}
                  className="space-y-4"
                >
                  <Input
                    type="text"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-slate-800 border-white/10 text-white h-12 text-center tracking-[0.5em] text-xl rounded-xl"
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all rounded-xl shadow-lg shadow-blue-900/20"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Authorize Connection"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-slate-500 hover:text-white"
                    onClick={() => setStep('email')}
                    disabled={isLoading}
                  >
                    Back to Email
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          Durable Object Session Management
        </p>
      </motion.div>
    </div>
  );
}