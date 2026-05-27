'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Lock, Mail, User, ShieldCheck, Eye, EyeOff, Globe, Code2, AlertCircle, Loader2, CheckCircle2, Phone } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { RegisterSchema } from '@/lib/schemas'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | undefined>('')
  const [isPending, setIsPending] = useState(false)

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'user',
      agreedToTerms: false,
    },
  })

  const password = form.watch('password')

  const passwordStrength = useMemo(() => {
    let strength = 0
    if (password.length > 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }, [password])

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200'
    if (passwordStrength === 1) return 'bg-red-500'
    if (passwordStrength === 2) return 'bg-brutalist-yellow'
    if (passwordStrength === 3) return 'bg-brutalist-cyan'
    return 'bg-brutalist-green'
  }

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setError('')
    setIsPending(true)

    const { email, password, name, role } = values

    await authClient.signUp.email({
      email,
      password,
      name,
      // @ts-ignore
      role,
      callbackURL: role === 'admin' ? '/admin/dashboard' : '/dashboard',
    }, {
      onRequest: () => {
        setIsPending(true)
      },
      onResponse: () => {
        setIsPending(false)
      },
      onError: (ctx) => {
        setError(ctx.error.message || "Something went wrong!")
        setIsPending(false)
      },
      onSuccess: () => {
        router.push(role === 'admin' ? '/admin/dashboard' : '/dashboard')
        router.refresh()
      }
    })
  }

  return (
    <main className="min-h-screen bg-brutalist-cyan flex items-center justify-center p-4">
      <Link 
        href="/" 
        className="absolute top-8 left-8 brutalist-button bg-white flex items-center gap-2 text-sm z-20"
      >
        <ArrowLeft size={16} /> BACK TO HOME
      </Link>

      <motion.div 
        initial={{ rotate: -2, scale: 0.9, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        className="w-full max-w-md my-12 relative"
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

          <div className="absolute -top-6 -right-6 bg-brutalist-yellow text-black border-[3px] border-black px-4 py-2 font-black uppercase -rotate-6 shadow-brutalist hidden sm:block">
            Join the Revolution
          </div>

          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-brutalist-magenta border-[3px] border-black shadow-brutalist flex items-center justify-center mb-6">
              <span className="text-white font-black text-3xl -rotate-12">CP</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-center">
              Create Your <br />
              <span className="text-brutalist-cyan stroke-black" style={{ WebkitTextStroke: '1px black' }}>Account</span>
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
              <label className="text-sm font-black uppercase block">Full Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                  <User size={18} />
                </div>
                <input
                  {...form.register('name')}
                  type="text"
                  disabled={isPending}
                  className={`brutalist-input w-full pl-12 bg-white disabled:opacity-50 ${form.formState.errors.name ? 'border-red-600' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-red-600 text-[10px] font-black uppercase">{form.formState.errors.name.message}</p>
              )}
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
              <label className="text-sm font-black uppercase block">Phone Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                  <Phone size={18} />
                </div>
                <input
                  {...form.register('phone')}
                  type="tel"
                  disabled={isPending}
                  className={`brutalist-input w-full pl-12 bg-white disabled:opacity-50 ${form.formState.errors.phone ? 'border-red-600' : ''}`}
                  placeholder="+977 9800000000"
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-red-600 text-[10px] font-black uppercase">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase block">Password</label>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-brutalist-cyan transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-600 text-[10px] font-black uppercase">{form.formState.errors.password.message}</p>
              )}
              
              <div className="pt-2">
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 border-r border-black last:border-0 transition-colors ${
                        passwordStrength >= step ? getStrengthColor() : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase mt-1 opacity-60">
                  Password Strength: {['Weak', 'Fair', 'Good', 'Strong', 'Epic'][passwordStrength]}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase block">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                  <Lock size={18} />
                </div>
                <input
                  {...form.register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  disabled={isPending}
                  className={`brutalist-input w-full pl-12 bg-white disabled:opacity-50 ${form.formState.errors.confirmPassword ? 'border-red-600' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-red-600 text-[10px] font-black uppercase">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start gap-3 group cursor-pointer" onClick={() => form.setValue('agreedToTerms', !form.getValues('agreedToTerms'), { shouldValidate: true })}>
              <button
                type="button"
                className={`w-6 h-6 border-[3px] border-black shrink-0 flex items-center justify-center transition-colors mt-0.5 ${form.watch('agreedToTerms') ? 'bg-brutalist-green' : 'bg-white'} ${form.formState.errors.agreedToTerms ? 'border-red-600' : ''}`}
              >
                {form.watch('agreedToTerms') && <div className="w-3 h-3 bg-black" />}
              </button>
              <div>
                <p className="text-[10px] font-bold uppercase leading-tight">
                  I agree to the <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>. 
                  Data encryption is active <ShieldCheck size={12} className="inline ml-1" />
                </p>
                {form.formState.errors.agreedToTerms && (
                  <p className="text-red-600 text-[10px] font-black uppercase mt-1">{form.formState.errors.agreedToTerms.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="brutalist-button w-full bg-black text-white text-lg flex items-center justify-center gap-2 mt-8 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" /> INITIALIZING...
                </>
              ) : (
                <>
                  START FREE TRIAL 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-[2px] bg-black flex-1" />
            <span className="text-[10px] font-black uppercase">Or sign up with</span>
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
              Already have an account?
            </p>
            <Link href="/login">
              <button className="brutalist-button bg-brutalist-magenta text-white w-full">
                SIGN IN INSTEAD
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-brutalist-green" />
            <span className="text-[10px] font-black uppercase">NO CREDIT CARD REQUIRED</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-brutalist-green" />
            <span className="text-[10px] font-black uppercase">14-DAY FREE TRIAL</span>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
