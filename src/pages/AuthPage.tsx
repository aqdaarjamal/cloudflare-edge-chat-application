import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
export function AuthPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useChatStore((s) => s.login);
  const navigate = useNavigate();
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setStep('otp');
      setIsLoading(false);
      toast.success('Magic code sent!', { description: 'Check your inbox for a simulation code.' });
    }, 800);
  };
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    setTimeout(() => {
      login(email);
      setIsLoading(false);
      navigate('/chat');
      toast.success('Identity verified', { description: 'Welcome to Velocity.' });
    }, 800);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600/10 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              {step === 'email' ? 'Enter App' : 'Verification'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {step === 'email' 
                ? 'Sign in instantly with your email address' 
                : `We sent a code to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-800 border-white/10 text-white h-12"
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all group"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Continue"}
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
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="bg-slate-800 border-white/10 text-white h-12 text-center tracking-widest text-xl"
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Enter Workspace"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-slate-500"
                    onClick={() => setStep('email')}
                  >
                    Change Email
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-slate-500 text-xs uppercase tracking-widest">
          Secure passwordless authentication
        </p>
      </motion.div>
    </div>
  );
}