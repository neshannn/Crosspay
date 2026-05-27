'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Lock, Mail, Eye, EyeOff, Globe, Code2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { LoginSchema } from '@/lib/schemas'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | undefined>('')
  const [isPending, setIsPending] = useState(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'user',
      rememberMe: false,
    },
  })

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError('')
    setIsPending(true)

    const { email, password, role } = values

    await authClient.signIn.email({
      email,
      password,
      callbackURL: role === 'admin' ? '/admin/dashboard' : '/dashboard',
    }, {
      onRequest: () => {
        setIsPending(true)
      },
      onResponse: () => {
        setIsPending(false)
      },
      onError: (ctx) => {
        setError(ctx.error.message || "Invalid credentials!")
        setIsPending(false)
      },
      onSuccess: () => {
        router.push(role === 'admin' ? '/admin/dashboard' : '/dashboard')
        router.refresh()
      }
    })
  }

  return (
    <main className="min-h-screen bg-brutalist-yellow flex items-center justify-center p-4">
      <Link 
        href="/" 
        className="absolute top-8 left-8 brutalist-button bg-white flex items-center gap-2 text-sm z-20"
      >
        <ArrowLeft size={16} /> BACK TO HOME
      </Link>

      <motion.div 
        initial={{ rotate: 2, scale: 0.9, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 -z-10" />
        
        <div className="brutalist-card bg-white p-8 lg:p-12 relative overflow-hidden">
          <AnimatePresence>
            {isPending && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-0 h-2 bg-brutalist-magenta z-30"
              />
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-black border-[3px] border-black shadow-brutalist flex items-center justify-center mb-6">
              <span className="text-white font-black text-3xl rotate-12">CP</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-center">
              Welcome Back <br />
              <span className="text-brutalist-magenta">CrossPay</span>
            </h1>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-100 border-[3px] border-red-600 p-4 flex items-center gap-3 text-red-600 font-bold uppercase text-xs">
                  <AlertCircle size={20} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() => form.setValue('role', 'user')}
                className={`p-2 font-black uppercase text-xs border-[3px] border-black transition-all ${form.watch('role') === 'user' ? 'bg-brutalist-cyan shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
              >
                Regular User
              </button>
              <button
                type="button"
                onClick={() => form.setValue('role', 'admin')}
                className={`p-2 font-black uppercase text-xs border-[3px] border-black transition-all ${form.watch('role') === 'admin' ? 'bg-brutalist-magenta text-white shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
              >
                Administrator
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase block">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                  <Mail size={18} />
                </div>
                <input
                  {...form.register('email')}
                  type="email"
                  disabled={isPending}
                  className={`brutalist-input w-full pl-12 bg-white disabled:opacity-50 ${form.formState.errors.email ? 'border-red-600' : ''}`}
                  placeholder="name@example.com"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-red-600 text-[10px] font-black uppercase">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black uppercase block">Password</label>
                <Link href="#" className="text-xs font-bold uppercase hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                  <Lock size={18} />
                </div>
                <input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  disabled={isPending}
                  className={`brutalist-input w-full pl-12 pr-12 bg-white disabled:opacity-50 ${form.formState.errors.password ? 'border-red-600' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-brutalist-magenta transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-600 text-[10px] font-black uppercase">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => form.setValue('rememberMe', !form.getValues('rememberMe'))}
                className={`w-6 h-6 border-[3px] border-black flex items-center justify-center transition-colors ${form.watch('rememberMe') ? 'bg-brutalist-green' : 'bg-white'}`}
              >
                {form.watch('rememberMe') && <div className="w-3 h-3 bg-black" />}
              </button>
              <span className="text-xs font-black uppercase">Remember this device</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="brutalist-button w-full bg-black text-white text-lg flex items-center justify-center gap-2 mt-8 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" /> PROCESSING...
                </>
              ) : (
                <>
                  SIGN IN NOW 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-[2px] bg-black flex-1" />
            <span className="text-[10px] font-black uppercase">Or continue with</span>
            <div className="h-[2px] bg-black flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="brutalist-button bg-white flex items-center justify-center gap-2 text-sm py-3 px-4">
              <Globe size={18} /> GOOGLE
            </button>
            <button className="brutalist-button bg-white flex items-center justify-center gap-2 text-sm py-3 px-4">
              <Code2 size={18} /> GITHUB
            </button>
          </div>

          <div className="mt-10 pt-8 border-t-[3px] border-black text-center">
            <p className="font-bold uppercase text-sm mb-4">
              Don&apos;t have an account?
            </p>
            <Link href="/signup">
              <button className="brutalist-button bg-brutalist-cyan w-full">
                CREATE FREE ACCOUNT
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brutalist-green rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase">SECURE SESSION ENCRYPTED</span>
          </div>
          <div className="text-[10px] font-black uppercase opacity-60">
            SLA: 99.9% UPTIME
          </div>
        </div>
      </motion.div>
    </main>
  )
}
