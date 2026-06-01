'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { clientAuth } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email:    z.string().min(1).email(),
  password: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5', className)} viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [pending,  startTx]     = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const finish = async (user: User) => {
    const idToken = await user.getIdToken();
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      await firebaseSignOut(clientAuth);
      setError(res.status === 403 ? 'Access denied.' : 'Sign-in failed. Try again.');
      return;
    }
    router.push('/admin/smp');
  };

  const onEmail = (d: FormValues) => {
    setError(null);
    startTx(async () => {
      try {
        const { user } = await signInWithEmailAndPassword(clientAuth, d.email, d.password);
        await finish(user);
      } catch (e: unknown) {
        const code = (e as { code?: string }).code ?? '';
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
          setError('Incorrect email or password.');
        } else if (code === 'auth/too-many-requests') {
          setError('Too many attempts. Please wait.');
        } else {
          setError('Sign-in failed. Try again.');
        }
      }
    });
  };

  const onGoogle = () => {
    setError(null);
    startTx(async () => {
      try {
        const { user } = await signInWithPopup(clientAuth, new GoogleAuthProvider());
        await finish(user);
      } catch (e: unknown) {
        const code = (e as { code?: string }).code ?? '';
        if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
          setError('Google sign-in failed. Try again.');
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/60 via-background to-secondary/30 px-4">
      <div className="w-full max-w-[380px]">

        {/* Logo + title */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/images/concern-logo.jpg"
            alt="CONCERN"
            width={180} height={46}
            className="w-44 object-contain drop-shadow-sm"
            style={{ height: 'auto' }}
            priority
          />
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">Social Media Portal</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Sign in to continue</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-lg shadow-black/5 overflow-hidden">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 bg-destructive/8 border-b border-destructive/15 px-5 py-3">
              <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={onGoogle}
              disabled={pending}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-background hover:bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground transition-all duration-150 hover:border-primary/30 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <GoogleIcon />}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit(onEmail)} noValidate className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={pending}
                  {...register('email')}
                  className={cn(
                    'w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none',
                    'placeholder:text-muted-foreground/50 transition-all duration-150',
                    'focus:border-primary focus:ring-2 focus:ring-primary/20',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    errors.email ? 'border-destructive focus:ring-destructive/20' : 'border-input',
                  )}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={pending}
                    {...register('password')}
                    className={cn(
                      'w-full rounded-xl border bg-background px-3.5 py-2.5 pr-10 text-sm text-foreground outline-none',
                      'placeholder:text-muted-foreground/50 transition-all duration-150',
                      'focus:border-primary focus:ring-2 focus:ring-primary/20',
                      'disabled:opacity-60 disabled:cursor-not-allowed',
                      errors.password ? 'border-destructive focus:ring-destructive/20' : 'border-input',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-1"
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Authorised access only
        </p>
      </div>
    </div>
  );
}
