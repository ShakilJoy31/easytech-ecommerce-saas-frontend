'use client';

import { useState, useEffect } from 'react';
import {
    motion,
    AnimatePresence,
    animate,
    useMotionValue,
    useTransform,
    useReducedMotion,
} from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Eye, EyeOff, Lock, X, Loader2, AlertCircle, ArrowRight,
    Mail, ShoppingBag, Package, Truck, CreditCard, TrendingUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEnterpriseLoginMutation } from '@/redux/api/authentication/authApi';
import { useLoginStoreOwnerMutation } from '@/redux/api/saas/storeOwnerApi';
import { shareWithCookies } from '@/utils/helper/shareWithCookies';
import { appConfiguration } from '@/utils/constant/appConfiguration';
import ForgotPasswordModal from './ForgotPasswordModal';

// ============ SCHEMA ============
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{11,14}$/;

const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, 'Email or phone is required')
        .refine((v) => emailRegex.test(v) || phoneRegex.test(v), {
            message: 'Enter a valid email address or phone number',
        }),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface PendingAccountInfo {
    id: number;
    companyName: string;
    phoneNo: string;
    email: string;
    status: string;
    role: string;
}

// ============ SHOWCASE DATA ============
const LIVE_ORDERS = [
    { id: '#10482', item: 'Wireless Earbuds Pro', amount: '৳4,250', icon: ShoppingBag },
    { id: '#10483', item: 'Cotton Panjabi Set', amount: '৳2,890', icon: Package },
    { id: '#10484', item: 'Smart Fitness Band', amount: '৳3,490', icon: Truck },
    { id: '#10485', item: 'Kitchen Blender 1.5L', amount: '৳5,120', icon: CreditCard },
];

const SPARK_PATH =
    'M0 62 C 20 58, 30 40, 52 44 S 90 56, 112 34 S 150 18, 172 24 S 208 8, 232 6';

// ============ SMALL HELPERS ============
function CountUp({ to, prefix = '', duration = 1.8 }: { to: number; prefix?: string; duration?: number }) {
    const value = useMotionValue(0);
    const text = useTransform(value, (v) => `${prefix}${Math.round(v).toLocaleString('en-US')}`);

    useEffect(() => {
        const controls = animate(value, to, { duration, ease: 'easeOut', delay: 0.5 });
        return () => controls.stop();
    }, [to, duration, value]);

    return <motion.span>{text}</motion.span>;
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-semibold text-gray-900 truncate ml-4">{value}</span>
        </div>
    );
}

function LiveOrderTicker({ reduceMotion }: { reduceMotion: boolean }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (reduceMotion) return;
        const t = setInterval(() => setIndex((i) => (i + 1) % LIVE_ORDERS.length), 3200);
        return () => clearInterval(t);
    }, [reduceMotion]);

    const order = LIVE_ORDERS[index];
    const Icon = order.icon;

    return (
        <div className="relative h-[64px] sm:h-[68px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -18, scale: 0.97 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center gap-3 rounded-2xl bg-white/95 px-4 shadow-xl shadow-black/20"
                >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">New order {order.id}</p>
                        <p className="truncate text-xs text-gray-500">{order.item}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">{order.amount}</span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ============ MAIN COMPONENT ============
export default function EnterpriseLoginForm() {
    const router = useRouter();
    const reduceMotion = !!useReducedMotion();
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingAccountInfo, setPendingAccountInfo] = useState<PendingAccountInfo | null>(null);

    const [enterpriseLogin, { isLoading: isEnterpriseLoading }] = useEnterpriseLoginMutation();
    const [storeOwnerLogin, { isLoading: isStoreOwnerLoading }] = useLoginStoreOwnerMutation();

    const isLoading = isEnterpriseLoading || isStoreOwnerLoading;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { identifier: '', password: '' },
        mode: 'onChange',
    });

    useEffect(() => setMounted(true), []);

    /* ------------------------------------------------------------------
       Try enterprise (super admin) login first.
       If it fails with auth error (401/404), fall back to store owner login.
    ------------------------------------------------------------------ */
    const onSubmit = async (data: LoginFormData) => {
        setErrorMessage(null);

        /* ---------- 1. Try Enterprise Login ---------- */
        try {
            const isEmail = emailRegex.test(data.identifier);
            const enterprisePayload = isEmail
                ? { email: data.identifier, password: data.password }
                : { phoneNo: data.identifier, password: data.password };

            const response = await enterpriseLogin(enterprisePayload as any).unwrap();

            if (response.success && response.data?.tokens?.accessToken) {
                const { accessToken, refreshToken } = response.data.tokens;
                const tokenName = `${appConfiguration.appCode}token`;
                const refreshTokenName = `${appConfiguration.appCode}refreshToken`;

                shareWithCookies('set', tokenName, 1440, accessToken);
                shareWithCookies('set', refreshTokenName, 10080, refreshToken);

                toast.success('Welcome back');
                router.push('/redirect?to=/admin/dashboard');
                return;
            }
        } catch (enterpriseError: any) {
            /* If the enterprise API says the account is pending (403), show the modal */
            if (enterpriseError?.status === 403 && enterpriseError?.data?.accountInfo) {
                setPendingAccountInfo(enterpriseError.data.accountInfo);
                setShowPendingModal(true);
                toast.error(enterpriseError.data.message || 'Your account is pending approval.');
                return;
            }

            /* Otherwise, fall through to store owner login below.
               (401 invalid credentials, 404 not found, etc.) */
        }

        /* ---------- 2. Fallback: Store Owner Login ---------- */
        try {
            const response = await storeOwnerLogin({
                identifier: data.identifier,
                password: data.password,
            }).unwrap();

            if (response.success && response.data?.tokens?.accessToken) {
                const { accessToken, refreshToken } = response.data.tokens;
                const tokenName = `${appConfiguration.appCode}token`;
                const refreshTokenName = `${appConfiguration.appCode}refreshToken`;

                shareWithCookies('set', tokenName, 1440, accessToken);
                shareWithCookies('set', refreshTokenName, 10080, refreshToken);

                toast.success('Welcome back');
                router.push('/redirect?to=/admin/dashboard');
                return;
            }
        } catch (storeError: any) {
            /* ---------- Handle store-owner specific errors ---------- */
            if (storeError?.status === 403 && storeError?.data?.accountInfo) {
                /* Store is inactive / suspended / expired / awaiting payment */
                setPendingAccountInfo({
                    id: storeError.data.accountInfo.id,
                    companyName: storeError.data.accountInfo.storeName || storeError.data.accountInfo.name,
                    phoneNo: storeError.data.accountInfo.phone,
                    email: storeError.data.accountInfo.email,
                    status: storeError.data.accountInfo.status,
                    role: storeError.data.accountInfo.role || 'STORE_OWNER',
                });
                setShowPendingModal(true);
                toast.error(storeError.data.message || 'Your store is not active yet.');
                return;
            }

            /* Generic failure */
            const msg =
                storeError?.data?.message ||
                storeError?.message ||
                'Incorrect email, phone or password';
            setErrorMessage(msg);
            toast.error(msg);
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-2xl" />
                    <div className="h-4 w-40 bg-gray-100 rounded" />
                </div>
            </div>
        );
    }

    const inputBase =
        'w-full pl-11 py-3.5 rounded-xl border bg-white text-[15px] font-medium text-gray-900 placeholder-gray-400 ' +
        'focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 ' +
        'disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <>
            <div className="min-h-screen bg-gray-50 grid lg:grid-cols-[1.05fr_1fr]">
                {/* ========= LEFT: STOREFRONT SHOWCASE ========= */}
                <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[#0b2b26] px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-16 xl:px-16 text-white">
                    {/* Animated glow blobs */}
                    <motion.div
                        aria-hidden
                        className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-500/25 blur-3xl"
                        animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
                        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        aria-hidden
                        className="absolute -bottom-40 -right-24 h-[460px] w-[460px] rounded-full bg-amber-400/20 blur-3xl"
                        animate={reduceMotion ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
                        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '28px 28px',
                        }}
                    />

                    <div className="relative w-full max-w-lg">
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-3xl sm:text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-center lg:text-left"
                        >
                            Every store, order and payout in one place.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-4 sm:mt-5 text-sm sm:text-base leading-relaxed text-emerald-50/70 text-center lg:text-left"
                        >
                            Track sales as they happen, manage vendors and products, and keep
                            fulfilment moving from checkout to doorstep.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.35 }}
                            className="mt-8 sm:mt-10 space-y-4"
                        >
                            <div className="rounded-2xl bg-white/[0.07] p-4 sm:p-5 ring-1 ring-white/15 backdrop-blur">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-emerald-100/70">Today&apos;s sales</p>
                                        <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums">
                                            <CountUp to={284650} prefix="৳" />
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        +18.4%
                                    </span>
                                </div>
                                <svg viewBox="0 0 232 70" className="mt-4 h-14 sm:h-16 w-full" fill="none" aria-hidden>
                                    <defs>
                                        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <motion.path
                                        d={`${SPARK_PATH} L 232 70 L 0 70 Z`}
                                        fill="url(#sparkFill)"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.2, duration: 0.8 }}
                                    />
                                    <motion.path
                                        d={SPARK_PATH}
                                        stroke="#6ee7b7"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ delay: 0.5, duration: 1.6, ease: 'easeInOut' }}
                                    />
                                </svg>
                            </div>

                            <LiveOrderTicker reduceMotion={reduceMotion} />
                        </motion.div>
                    </div>
                </div>

                {/* ========= RIGHT: LOGIN FORM ========= */}
                <div className="flex items-center justify-center bg-white p-6 sm:p-12">
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="w-full max-w-md"
                    >
                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                                Sign in to your dashboard
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Use your admin or store owner email/phone to manage orders, products and vendors.
                            </p>
                        </div>

                        {/* Error banner */}
                        <AnimatePresence>
                            {errorMessage && (
                                <motion.div
                                    role="alert"
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="overflow-hidden"
                                >
                                    <motion.div
                                        animate={reduceMotion ? undefined : { x: [0, -6, 6, -4, 4, 0] }}
                                        transition={{ duration: 0.4 }}
                                        className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5"
                                    >
                                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                                        <span className="text-sm font-medium text-red-700">{errorMessage}</span>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                            {/* Email or Phone */}
                            <div>
                                <label htmlFor="identifier" className="mb-2 block text-sm font-semibold text-gray-800">
                                    Email or Phone
                                </label>
                                <div className="group relative">
                                    <Mail className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-emerald-700" />
                                    <input
                                        id="identifier"
                                        {...register('identifier')}
                                        type="text"
                                        inputMode="email"
                                        disabled={isLoading}
                                        autoComplete="username"
                                        placeholder="admin@store.com or 01712345678"
                                        className={cn(
                                            inputBase,
                                            'pr-4',
                                            errors.identifier
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                                : 'border-gray-200 hover:border-gray-300'
                                        )}
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.identifier && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"
                                        >
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.identifier.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPasswordModal(true)}
                                        className="text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800 focus:outline-none focus-visible:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="group relative">
                                    <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-emerald-700" />
                                    <input
                                        id="password"
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        disabled={isLoading}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className={cn(
                                            inputBase,
                                            'pr-12',
                                            errors.password
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                                : 'border-gray-200 hover:border-gray-300'
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        <AnimatePresence mode="wait" initial={false}>
                                            <motion.span
                                                key={showPassword ? 'off' : 'on'}
                                                initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
                                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                                exit={{ opacity: 0, rotate: 20, scale: 0.8 }}
                                                transition={{ duration: 0.15 }}
                                                className="block"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-[18px] w-[18px]" />
                                                ) : (
                                                    <Eye className="h-[18px] w-[18px]" />
                                                )}
                                            </motion.span>
                                        </AnimatePresence>
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {errors.password && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"
                                        >
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.password.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                className={cn(
                                    'group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-[15px] font-semibold text-white',
                                    'bg-[#0b2b26] hover:bg-[#0f3a33] shadow-lg shadow-emerald-900/20',
                                    'transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60',
                                    'focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30'
                                )}
                            >
                                <motion.span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                                />
                                {isLoading ? (
                                    <>
                                        <Loader2 className="relative z-10 h-[18px] w-[18px] animate-spin" />
                                        <span className="relative z-10">Signing in…</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="relative z-10">Sign in</span>
                                        <ArrowRight className="relative z-10 h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* === Pending Account Modal === */}
            <AnimatePresence>
                {showPendingModal && pendingAccountInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                        >
                            <div className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white p-6">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-amber-100 p-3 ring-2 ring-amber-200">
                                        <AlertCircle className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {pendingAccountInfo.status === 'INACTIVE'
                                                ? 'Store awaiting activation'
                                                : pendingAccountInfo.status === 'EXPIRED'
                                                ? 'Subscription expired'
                                                : pendingAccountInfo.status === 'SUSPENDED'
                                                ? 'Account suspended'
                                                : 'Account pending approval'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {pendingAccountInfo.status === 'INACTIVE'
                                                ? 'Complete your payment to activate your store.'
                                                : pendingAccountInfo.status === 'EXPIRED'
                                                ? 'Renew your package to continue.'
                                                : pendingAccountInfo.status === 'SUSPENDED'
                                                ? 'Please contact support for assistance.'
                                                : 'An administrator needs to approve your account.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowPendingModal(false);
                                            setPendingAccountInfo(null);
                                        }}
                                        aria-label="Close"
                                        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-5 p-6">
                                <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold text-amber-700">
                                            {pendingAccountInfo.companyName}
                                        </span>
                                        , your account is currently in{' '}
                                        <span className="font-semibold">{pendingAccountInfo.status}</span> state.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                                        <span className="h-4 w-1 rounded-full bg-amber-500" />
                                        Account information
                                    </h4>
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <div className="divide-y divide-gray-100">
                                            <Row label="Company" value={pendingAccountInfo.companyName} />
                                            <Row label="Phone" value={pendingAccountInfo.phoneNo} />
                                            <Row label="Email" value={pendingAccountInfo.email} />
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-sm text-gray-500">Status</span>
                                                <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                    {pendingAccountInfo.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <p className="mb-2 text-xs font-semibold text-gray-700">What happens next?</p>
                                    <ul className="space-y-1.5 text-xs text-gray-600">
                                        <li>• An administrator will review your account</li>
                                        <li>• You&apos;ll receive an email once approved</li>
                                        <li>• After approval, you can sign in normally</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 bg-gray-50 p-6">
                                <button
                                    onClick={() => {
                                        setShowPendingModal(false);
                                        setPendingAccountInfo(null);
                                    }}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-[0.99]"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={showForgotPasswordModal}
                onClose={() => setShowForgotPasswordModal(false)}
            />
        </>
    );
}