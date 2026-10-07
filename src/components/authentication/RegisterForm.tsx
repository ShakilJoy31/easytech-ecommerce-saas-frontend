// app/register/page.tsx
'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent, ClipboardEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Mail, Lock, Eye, EyeOff, User, AtSign, Camera, Upload, Trash2,
    ArrowRight, ArrowLeft, CheckCircle2, Loader2, AlertCircle,
    RefreshCw, ShieldCheck, GraduationCap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegisterStudentMutation } from '@/redux/api/authentication/studentRegistrationApi';
import { useAddThumbnailMutation } from '@/redux/features/file/fileApi';
import { shareWithCookies } from '@/utils/helper/shareWithCookies';
import { appConfiguration } from '@/utils/constant/appConfiguration';
import { useSendRegistrationOtpMutation, useVerifyRegistrationOtpMutation } from '@/redux/api/settings/otpApi';

/* ------------------------------------------------------------------ */
/*  Constants & schemas                                               */
/* ------------------------------------------------------------------ */

const OTP_LENGTH = 5;
const RESEND_SECONDS = 300; // Changed from 90 to 300 seconds (5 minutes)

type Step = 'email' | 'otp' | 'profile' | 'photo' | 'success';

const STEP_ORDER: Step[] = ['email', 'otp', 'profile', 'photo'];

const STEP_META: Record<Step, { label: string; icon: typeof Mail }> = {
    email: { label: 'Email', icon: Mail },
    otp: { label: 'Verify', icon: ShieldCheck },
    profile: { label: 'Profile', icon: User },
    photo: { label: 'Photo', icon: Camera },
    success: { label: 'Done', icon: CheckCircle2 },
};

const emailSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});
type EmailFormData = z.infer<typeof emailSchema>;

const profileSchema = z
    .object({
        fullName: z
            .string()
            .min(2, 'Full name must be at least 2 characters')
            .max(100, 'Full name must not exceed 100 characters')
            .regex(/^[a-zA-Z\s.]+$/, 'Use letters and spaces only'),
        nickName: z
            .string()
            .max(50, 'Nickname must not exceed 50 characters')
            .optional()
            .or(z.literal('')),
        password: z
            .string()
            .min(6, 'At least 6 characters')
            .max(20, 'No more than 20 characters')
            .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Mix in at least one letter and one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });
type ProfileFormData = z.infer<typeof profileSchema>;

/* ------------------------------------------------------------------ */
/*  Motion variants                                                   */
/* ------------------------------------------------------------------ */

const stepVariants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentRegisterPage() {
    const router = useRouter();
    const prefersReducedMotion = useReducedMotion();

    const [step, setStep] = useState<Step>('email');
    const [direction, setDirection] = useState(1);

    // accumulated registration data across steps
    const [email, setEmail] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [profile, setProfile] = useState<{ fullName: string; nickName?: string; password: string } | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string>('');

    const [sendOtp, { isLoading: sendingOtp }] = useSendRegistrationOtpMutation();
    const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyRegistrationOtpMutation();
    const [registerStudent, { isLoading: registering }] = useRegisterStudentMutation();

    const goTo = (next: Step, dir: 1 | -1 = 1) => {
        setDirection(dir);
        setStep(next);
    };

    /* ---------------------------- Step 1: email ---------------------------- */
    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
        mode: 'onChange',
    });

    const onSubmitEmail = async (data: EmailFormData) => {
        try {
            const res = await sendOtp({ email: data.email }).unwrap();
            if (res?.success !== false) {
                setEmail(data.email);
                toast.success(`Code sent to ${data.email}`);
                goTo('otp');
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Could not send the code. Try again.');
        }
    };

    /* ----------------------------- Step 2: otp ------------------------------ */
    const onVerifyOtp = async (code: string) => {
        try {
            const res = await verifyOtp({ email, otp: code }).unwrap();
            if (res?.success !== false) {
                toast.success('Email verified');
                goTo('profile');
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'That code is incorrect or expired.');
            throw error;
        }
    };

    const onResendOtp = async () => {
        try {
            await sendOtp({ email }).unwrap();
            toast.success('A new code is on its way');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Could not resend the code.');
        }
    };

    /* --------------------------- Step 3: profile ---------------------------- */
    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { fullName: '', nickName: '', password: '', confirmPassword: '' },
        mode: 'onChange',
    });

    const onSubmitProfile = (data: ProfileFormData) => {
        setProfile({ fullName: data.fullName, nickName: data.nickName, password: data.password });
        goTo('photo');
    };

    /* ----------------------- Step 4: photo + final submit -------------------- */
    const finalizeRegistration = async (finalPhotoUrl: string) => {
        if (!profile) return;
        try {
            const payload = {
                fullName: profile.fullName,
                nickName: profile.nickName || undefined,
                email,
                password: profile.password,
                photo: finalPhotoUrl || undefined,
                metadata: {
                    registrationSource: 'web_application',
                    deviceType: typeof window !== 'undefined' ? (window.innerWidth < 768 ? 'mobile' : 'desktop') : 'unknown',
                    browserInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                    registeredAt: new Date().toISOString(),
                },
            };

            const response = await registerStudent(payload).unwrap();

            if (response?.success) {
                if (response.data?.tokens?.accessToken) {
                    const { accessToken, refreshToken } = response.data.tokens;
                    const tokenName = `${appConfiguration.appCode}token`;
                    const refreshTokenName = `${appConfiguration.appCode}refreshToken`;
                    shareWithCookies('set', tokenName, 1440, accessToken);
                    shareWithCookies('set', refreshTokenName, 10080, refreshToken);

                }

                setTimeout(() => {
                        window.location.reload();
                    }, 2000);

                    setTimeout(() => {
                       router.push('/');
                    }, 20);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4 py-12 ">
            <AmbientBackground reduceMotion={!!prefersReducedMotion} />

            <div className="relative z-10 w-full max-w-lg">

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-[28px] ring-1 ring-stone-100 overflow-hidden"
                >
                    {/* {step !== 'success' && <ProgressStepper current={step} />} */}

                    <div className="px-7 sm:px-10 pt-8 pb-4 ">
                        <AnimatePresence mode="wait" custom={direction} initial={false}>
                            {step === 'email' && (
                                <StepShell key="email" dir={direction}>
                                    <EmailStep form={emailForm} loading={sendingOtp} onSubmit={onSubmitEmail} />
                                </StepShell>
                            )}

                            {step === 'otp' && (
                                <StepShell key="otp" dir={direction}>
                                    <OtpStep
                                        email={email}
                                        verifying={verifyingOtp}
                                        onVerify={onVerifyOtp}
                                        onResend={onResendOtp}
                                        onBack={() => goTo('email', -1)}
                                    />
                                </StepShell>
                            )}

                            {step === 'profile' && (
                                <StepShell key="profile" dir={direction}>
                                    <ProfileStep form={profileForm} onSubmit={onSubmitProfile} onBack={() => goTo('otp', -1)} />
                                </StepShell>
                            )}

                            {step === 'photo' && (
                                <StepShell key="photo" dir={direction}>
                                    <PhotoStep
                                        submitting={registering}
                                        photoUrl={photoUrl}
                                        setPhotoUrl={setPhotoUrl}
                                        onFinish={finalizeRegistration}
                                        onBack={() => goTo('profile', -1)}
                                    />
                                </StepShell>
                            )}

                            {step === 'success' && (
                                <StepShell key="success" dir={1}>
                                    <SuccessStep name={profile?.fullName} />
                                </StepShell>
                            )}
                        </AnimatePresence>
                    </div>

                    {step !== 'success' && (
                        <div className="px-7 sm:px-10 bg-stone-50/70 border-t border-stone-100 text-center">
                            <p className="text-sm text-stone-500">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </motion.div>

            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Ambient background                                                */
/* ------------------------------------------------------------------ */

function AmbientBackground({ reduceMotion }: { reduceMotion: boolean }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
                className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-orange-200/40 to-amber-100/30 blur-3xl"
                animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute top-1/3 -right-32 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-teal-100/40 to-emerald-50/30 blur-3xl"
                animate={reduceMotion ? undefined : { x: [0, -25, 0], y: [0, -15, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute -bottom-32 left-1/4 w-[340px] h-[340px] rounded-full bg-gradient-to-br from-amber-100/30 to-orange-50/20 blur-3xl"
                animate={reduceMotion ? undefined : { x: [0, 20, 0], y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* faint grid texture */}
            <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, #1c1917 1px, transparent 1px), linear-gradient(to bottom, #1c1917 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Progress stepper (signature element)                              */
/* ------------------------------------------------------------------ */

// function ProgressStepper({ current }: { current: Step }) {
//     const idx = STEP_ORDER.indexOf(current);

//     return (
//         <div className="px-7 sm:px-10 pt-7">
//             <div className="flex items-center">
//                 {STEP_ORDER.map((s, i) => {
//                     const meta = STEP_META[s];
//                     const Icon = meta.icon;
//                     const state = i < idx ? 'done' : i === idx ? 'active' : 'upcoming';

//                     return (
//                         <div key={s} className="flex items-center flex-1 last:flex-none">
//                             <div className="flex flex-col items-center gap-1.5">
//                                 <div
//                                     className={cn(
//                                         'relative w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300',
//                                         state === 'done' && 'bg-gradient-to-br from-orange-500 to-red-500 text-white',
//                                         state === 'active' && 'bg-white ring-2 ring-orange-500 text-orange-600',
//                                         state === 'upcoming' && 'bg-stone-100 text-stone-400'
//                                     )}
//                                 >
//                                     {state === 'done' ? (
//                                         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
//                                             <CheckCircle2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
//                                         </motion.div>
//                                     ) : (
//                                         <Icon className="w-4 h-4" strokeWidth={2.25} />
//                                     )}
//                                     {state === 'active' && (
//                                         <motion.span
//                                             className="absolute inset-0 rounded-full ring-2 ring-orange-400"
//                                             animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
//                                             transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
//                                         />
//                                     )}
//                                 </div>
//                                 <span
//                                     className={cn(
//                                         'text-[10.5px] font-medium tracking-wide uppercase hidden sm:block',
//                                         state === 'upcoming' ? 'text-stone-400' : 'text-stone-600'
//                                     )}
//                                 >
//                                     {meta.label}
//                                 </span>
//                             </div>

//                             {i < STEP_ORDER.length - 1 && (
//                                 <div className="flex-1 h-[3px] mx-1.5 sm:mx-2 rounded-full bg-stone-100 overflow-hidden -mt-4 sm:-mt-4">
//                                     <motion.div
//                                         className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
//                                         initial={false}
//                                         animate={{ width: i < idx ? '100%' : '0%' }}
//                                         transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//                                     />
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }

/* ------------------------------------------------------------------ */
/*  Shared step shell (handles enter/exit animation)                  */
/* ------------------------------------------------------------------ */

function StepShell({ children, dir }: { children: React.ReactNode; dir: number }) {
    return (
        <motion.div
            custom={dir}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"
        >
            <AlertCircle className="w-3 h-3" />
            {message}
        </motion.p>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Email                                                    */
/* ------------------------------------------------------------------ */

function EmailStep({
    form,
    loading,
    onSubmit,
}: {
    form: ReturnType<typeof useForm<EmailFormData>>;
    loading: boolean;
    onSubmit: (data: EmailFormData) => void;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = form;

    return (
        <div>
            <h1 className="text-[22px] sm:text-2xl font-bold text-stone-900 tracking-tight">Let's get you started</h1>
            <p className="mt-1.5 text-sm text-stone-500">Enter your email and we'll send you a verification code.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
                    <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            {...register('email')}
                            type="email"
                            autoFocus
                            disabled={loading}
                            placeholder="you@example.com"
                            className={cn(
                                'w-full pl-11 pr-4 py-3.5 rounded-2xl border text-[15px] text-stone-900 placeholder-stone-400 bg-stone-50/60',
                                'focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-300 focus:bg-white transition-all duration-200',
                                'disabled:opacity-50',
                                errors.email ? 'border-red-300' : 'border-stone-200'
                            )}
                        />
                    </div>
                    <FieldError message={errors.email?.message} />
                </div>

                <motion.button
                    type="submit"
                    disabled={loading || !isValid}
                    whileHover={{ scale: loading ? 1 : 1.015 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className={cn(
                        'w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2',
                        'bg-gradient-to-r from-orange-600 to-red-600 shadow-lg shadow-orange-500/25',
                        'disabled:opacity-50 disabled:cursor-not-allowed transition-shadow duration-200'
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-[18px] h-[18px] animate-spin" /> Sending code…
                        </>
                    ) : (
                        <>
                            Continue <ArrowRight className="w-[18px] h-[18px]" />
                        </>
                    )}
                </motion.button>
            </form>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — OTP                                                      */
/* ------------------------------------------------------------------ */

function OtpStep({
    email,
    verifying,
    onVerify,
    onResend,
    onBack,
}: {
    email: string;
    verifying: boolean;
    onVerify: (code: string) => Promise<void>;
    onResend: () => Promise<void>;
    onBack: () => void;
}) {
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [shake, setShake] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [secondsLeft]);

    const code = digits.join('');

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const attemptVerify = useCallback(
        async (fullCode: string) => {
            try {
                await onVerify(fullCode);
            } catch {
                setShake(true);
                setDigits(Array(OTP_LENGTH).fill(''));
                inputsRef.current[0]?.focus();
                setTimeout(() => setShake(false), 420);
            }
        },
        [onVerify]
    );

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = digit;
        setDigits(next);

        if (digit && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
        if (next.every((d) => d !== '') && index === OTP_LENGTH - 1) {
            attemptVerify(next.join(''));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
        if (!pasted.length) return;
        const next = Array(OTP_LENGTH).fill('');
        pasted.forEach((d, i) => (next[i] = d));
        setDigits(next);
        const lastIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
        inputsRef.current[lastIndex]?.focus();
        if (pasted.length === OTP_LENGTH) attemptVerify(next.join(''));
    };

    const handleResend = async () => {
        await onResend();
        setSecondsLeft(RESEND_SECONDS);
        setDigits(Array(OTP_LENGTH).fill(''));
        inputsRef.current[0]?.focus();
    };

    return (
        <div>
            <button
                onClick={onBack}
                className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Change email
            </button>

            <h1 className="text-[22px] sm:text-2xl font-bold text-stone-900 tracking-tight">Check your inbox</h1>
            <p className="mt-1.5 text-sm text-stone-500">
                We sent a {OTP_LENGTH}-digit code to <span className="font-semibold text-stone-700">{email}</span>
            </p>

            <motion.div
                animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.42 }}
                className="mt-7 flex items-center justify-between gap-2.5 sm:gap-3"
            >
                {digits.map((d, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputsRef.current[i] = el }}
                        value={d}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        inputMode="numeric"
                        maxLength={1}
                        disabled={verifying}
                        className={cn(
                            'w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold rounded-2xl border bg-stone-50/60 text-stone-900',
                            'focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-300 focus:bg-white transition-all duration-150',
                            d ? 'border-orange-300 bg-orange-50/40' : 'border-stone-200'
                        )}
                    />
                ))}
            </motion.div>

            <div className="mt-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={secondsLeft > 0}
                    className={cn(
                        'inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
                        secondsLeft > 0 ? 'text-stone-400 cursor-not-allowed' : 'text-orange-600 hover:text-orange-700'
                    )}
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {secondsLeft > 0 ? `Resend in ${formatTime(secondsLeft)}` : 'Resend code'}
                </button>
                {verifying && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-stone-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying…
                    </span>
                )}
            </div>

            {secondsLeft > 0 && secondsLeft <= 300 && (
                <div className="mt-2 text-center">
                    <span className="text-xs text-stone-400">
                        Code expires in <span className="font-mono font-semibold text-orange-600">{formatTime(secondsLeft)}</span>
                    </span>
                </div>
            )}

            <motion.button
                type="button"
                onClick={() => code.length === OTP_LENGTH && attemptVerify(code)}
                disabled={verifying || code.length !== OTP_LENGTH}
                whileHover={{ scale: verifying ? 1 : 1.015 }}
                whileTap={{ scale: verifying ? 1 : 0.98 }}
                className={cn(
                    'mt-7 w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2',
                    'bg-gradient-to-r from-orange-600 to-red-600 shadow-lg shadow-orange-500/25',
                    'disabled:opacity-50 disabled:cursor-not-allowed transition-shadow duration-200'
                )}
            >
                Verify &amp; continue <ArrowRight className="w-[18px] h-[18px]" />
            </motion.button>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Profile                                                  */
/* ------------------------------------------------------------------ */

function ProfileStep({
    form,
    onSubmit,
    onBack,
}: {
    form: ReturnType<typeof useForm<ProfileFormData>>;
    onSubmit: (data: ProfileFormData) => void;
    onBack: () => void;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = form;

    return (
        <div>
            <button
                onClick={onBack}
                className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <h1 className="text-[22px] sm:text-2xl font-bold text-stone-900 tracking-tight">Tell us about you</h1>
            <p className="mt-1.5 text-sm text-stone-500">This is how you'll appear across FIT INFOTECH.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Full name (as on certificate)</label>
                    <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            {...register('fullName')}
                            type="text"
                            autoFocus
                            placeholder="Jamal Uddin Ahmed"
                            className={cn(
                                'w-full pl-11 pr-4 py-3.5 rounded-2xl border text-[15px] text-stone-900 placeholder-stone-400 bg-stone-50/60',
                                'focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-300 focus:bg-white transition-all duration-200',
                                errors.fullName ? 'border-red-300' : 'border-stone-200'
                            )}
                        />
                    </div>
                    <FieldError message={errors.fullName?.message} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                        Nickname <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative group">
                        <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            {...register('nickName')}
                            type="text"
                            placeholder="Jamal"
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-200 text-[15px] text-stone-900 placeholder-stone-400 bg-stone-50/60 focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-300 focus:bg-white transition-all duration-200"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={cn(
                                'w-full pl-11 pr-11 py-3.5 rounded-2xl border text-[15px] text-stone-900 placeholder-stone-400 bg-stone-50/60',
                                'focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-300 focus:bg-white transition-all duration-200',
                                errors.password ? 'border-red-300' : 'border-stone-200'
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                    </div>
                    <FieldError message={errors.password?.message} />
                    {!errors.password && <p className="mt-1.5 text-xs text-stone-400">At least 6 characters, with a letter and a number.</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirm password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            {...register('confirmPassword')}
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={cn(
                                'w-full pl-11 pr-11 py-3.5 rounded-2xl border text-[15px] text-stone-900 placeholder-stone-400 bg-stone-50/60',
                                'focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-300 focus:bg-white transition-all duration-200',
                                errors.confirmPassword ? 'border-red-300' : 'border-stone-200'
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                            {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                    </div>
                    <FieldError message={errors.confirmPassword?.message} />
                </div>

                <motion.button
                    type="submit"
                    disabled={!isValid}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow duration-200 mt-2"
                >
                    Continue <ArrowRight className="w-[18px] h-[18px]" />
                </motion.button>
            </form>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Photo                                                    */
/* ------------------------------------------------------------------ */

function PhotoStep({
    submitting,
    photoUrl,
    setPhotoUrl,
    onFinish,
    onBack,
}: {
    submitting: boolean;
    photoUrl: string;
    setPhotoUrl: (v: string) => void;
    onFinish: (url: string) => void;
    onBack: () => void;
}) {
    const [addThumbnail] = useAddThumbnailMutation();
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const handleFile = async (file: File | undefined) => {
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please choose a JPEG, PNG, or WEBP image');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image should be under 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await addThumbnail(formData).unwrap();
            if (response?.success && response.data?.[0]) {
                setPhotoUrl(response.data[0]);
                toast.success('Photo uploaded');
            } else {
                throw new Error('Upload failed');
            }
        } catch {
            toast.error('Could not upload the photo. Try again.');
            setPreview('');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview('');
        setPhotoUrl('');
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="text-center">
            <button
                onClick={onBack}
                className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors mx-auto"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <h1 className="text-[22px] sm:text-2xl font-bold text-stone-900 tracking-tight">Add a profile photo</h1>
            <p className="mt-1.5 text-sm text-stone-500">
                Helps your instructor recognize you in live classes. You can add this later, too.
            </p>

            <div className="mt-8 flex flex-col items-center">
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="relative group"
                >
                    <div
                        className={cn(
                            'w-32 h-32 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200',
                            'ring-2 ring-offset-4',
                            preview ? 'ring-orange-400' : 'ring-stone-200 group-hover:ring-orange-300',
                            'bg-stone-50'
                        )}
                    >
                        {preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="w-9 h-9 text-stone-300 group-hover:text-orange-400 transition-colors" />
                        )}

                        {uploading && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                            </div>
                        )}
                    </div>

                    <span className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center ring-4 ring-white shadow-md">
                        <Upload className="w-4 h-4 text-white" />
                    </span>
                </button>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {preview && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Remove photo
                    </button>
                )}
            </div>

            <div className="mt-9 space-y-3">
                <motion.button
                    type="button"
                    onClick={() => onFinish(photoUrl)}
                    disabled={submitting || uploading}
                    whileHover={{ scale: submitting ? 1 : 1.015 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow duration-200"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-[18px] h-[18px] animate-spin" /> Finishing up…
                        </>
                    ) : (
                        <>Complete registration</>
                    )}
                </motion.button>

                {!photoUrl && (
                    <button
                        type="button"
                        onClick={() => onFinish('')}
                        disabled={submitting || uploading}
                        className="w-full py-3 rounded-2xl font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                    >
                        Skip for now
                    </button>
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 5 — Success                                                  */
/* ------------------------------------------------------------------ */

function SuccessStep({ name }: { name?: string }) {
    return (
        <div className="text-center py-4">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
                className="relative w-20 h-20 mx-auto mb-6"
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                    <motion.svg viewBox="0 0 24 24" className="w-9 h-9" fill="none">
                        <motion.path
                            d="M5 13l4 4L19 7"
                            stroke="white"
                            strokeWidth={2.75}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                        />
                    </motion.svg>
                </div>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.span
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-teal-400 left-1/2 top-1/2"
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{
                            x: Math.cos((i / 6) * Math.PI * 2) * 46,
                            y: Math.sin((i / 6) * Math.PI * 2) * 46,
                            opacity: 0,
                        }}
                        transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                    />
                ))}
            </motion.div>

            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Welcome{name ? `, ${name.split(' ')[0]}` : ''}!
            </h1>
            <p className="mt-2 text-sm text-stone-500 max-w-xs mx-auto">
                Your account has been created. We're taking you to your dashboard.
            </p>

            <div className="mt-7 h-1.5 max-w-[220px] mx-auto rounded-full bg-stone-100 overflow-hidden">
                <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 text-xs text-stone-400">
                <GraduationCap className="w-3.5 h-3.5" /> FIT INFOTECH
            </div>
        </div>
    );
}

