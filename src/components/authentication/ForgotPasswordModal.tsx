'use client';

import { useState, useEffect, useRef, useCallback, KeyboardEvent, ClipboardEvent } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Mail, Lock, Eye, EyeOff, X, Loader2, AlertCircle,
    ArrowLeft, RefreshCw, ArrowRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
    useResetPasswordMutation,
    useSendPasswordResetOTPMutation,
    useVerifyPasswordResetOTPMutation,
} from '@/redux/api/authentication/passwordResetApi';

const OTP_LENGTH = 5;
const RESEND_SECONDS = 300; // 5 min

type Step = 'email' | 'otp' | 'newPassword' | 'success';

const emailSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});
type EmailFormData = z.infer<typeof emailSchema>;

const passwordSchema = z
    .object({
        newPassword: z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(20, 'Password must not exceed 20 characters')
            .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Include at least one letter and one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });
type PasswordFormData = z.infer<typeof passwordSchema>;

const stepVariants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [step, setStep] = useState<Step>('email');
    const [direction, setDirection] = useState(1);
    const [email, setEmail] = useState('');
    const [otpValue, setOtpValue] = useState('');

    const [sendOTP, { isLoading: sendingOTP }] = useSendPasswordResetOTPMutation();
    const [verifyOTP, { isLoading: verifyingOTP }] = useVerifyPasswordResetOTPMutation();
    const [resetPassword, { isLoading: resettingPassword }] = useResetPasswordMutation();

    const goTo = (next: Step, dir: 1 | -1 = 1) => {
        setDirection(dir);
        setStep(next);
    };

    useEffect(() => {
        if (!isOpen) {
            setStep('email');
            setEmail('');
            setOtpValue('');
        }
    }, [isOpen]);

    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
        mode: 'onChange',
    });

    const onSubmitEmail = async (data: EmailFormData) => {
        try {
            const res = await sendOTP({ email: data.email }).unwrap();
            if (res?.success) {
                setEmail(data.email);
                toast.success('OTP sent to your email');
                goTo('otp');
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Could not send OTP. Please try again.');
        }
    };

    const onVerifyOTP = async (code: string) => {
        try {
            const res = await verifyOTP({ email, otp: code }).unwrap();
            if (res?.success) {
                toast.success('OTP verified');
                goTo('newPassword');
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Invalid OTP. Please try again.');
            throw error;
        }
    };

    const onResendOTP = async () => {
        try {
            await sendOTP({ email }).unwrap();
            toast.success('A new OTP has been sent');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Could not resend OTP.');
        }
    };

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
        mode: 'onChange',
    });

    const onSubmitPassword = async (data: PasswordFormData) => {
        try {
            const res = await resetPassword({
                email,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            }).unwrap();
            if (res?.success) {
                toast.success('Password reset successfully!');
                goTo('success');
                setTimeout(() => onClose(), 3000);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to reset password.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 text-gray-400 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-6 sm:p-8">
                        <AnimatePresence mode="wait" custom={direction} initial={false}>
                            {step === 'email' && (
                                <motion.div
                                    key="email"
                                    custom={direction}
                                    variants={stepVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <EmailStep
                                        form={emailForm}
                                        loading={sendingOTP}
                                        onSubmit={onSubmitEmail}
                                        onClose={onClose}
                                    />
                                </motion.div>
                            )}

                            {step === 'otp' && (
                                <motion.div
                                    key="otp"
                                    custom={direction}
                                    variants={stepVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <OTPStep
                                        email={email}
                                        verifying={verifyingOTP}
                                        onVerify={onVerifyOTP}
                                        onResend={onResendOTP}
                                        onBack={() => goTo('email', -1)}
                                    />
                                </motion.div>
                            )}

                            {step === 'newPassword' && (
                                <motion.div
                                    key="newPassword"
                                    custom={direction}
                                    variants={stepVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <PasswordStep
                                        form={passwordForm}
                                        loading={resettingPassword}
                                        onSubmit={onSubmitPassword}
                                        onBack={() => goTo('otp', -1)}
                                    />
                                </motion.div>
                            )}

                            {step === 'success' && (
                                <motion.div
                                    key="success"
                                    custom={direction}
                                    variants={stepVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <SuccessStep />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ================= Sub-components =================

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

// ---- Step 1: Email ----
function EmailStep({
    form, loading, onSubmit, onClose,
}: {
    form: ReturnType<typeof useForm<EmailFormData>>;
    loading: boolean;
    onSubmit: (data: EmailFormData) => void;
    onClose: () => void;
}) {
    const { register, handleSubmit, formState: { errors, isValid } } = form;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                <p className="mt-1.5 text-sm text-gray-500">
                    Enter your email and we'll send you a verification code to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Email Address
                    </label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-red-600 transition-colors" />
                        <input
                            {...register('email')}
                            type="email"
                            autoFocus
                            disabled={loading}
                            placeholder="you@example.com"
                            className={cn(
                                'w-full pl-11 pr-4 py-3.5 rounded-xl border bg-white text-[15px] text-gray-900 placeholder-gray-400',
                                'focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-200',
                                'disabled:opacity-50',
                                errors.email ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
                            )}
                        />
                    </div>
                    <FieldError message={errors.email?.message} />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !isValid}
                        className="flex-1 px-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {loading ? (
                            <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Sending…</>
                        ) : (
                            <>Send Code <ArrowRight className="w-[18px] h-[18px]" /></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ---- Step 2: OTP ----
function OTPStep({
    email, verifying, onVerify, onResend, onBack,
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

    useEffect(() => { inputsRef.current[0]?.focus(); }, []);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [secondsLeft]);

    const formatTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const attemptVerify = useCallback(async (fullCode: string) => {
        try {
            await onVerify(fullCode);
        } catch {
            setShake(true);
            setDigits(Array(OTP_LENGTH).fill(''));
            inputsRef.current[0]?.focus();
            setTimeout(() => setShake(false), 420);
        }
    }, [onVerify]);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = digit;
        setDigits(next);
        if (digit && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
        if (next.every((d) => d !== '') && index === OTP_LENGTH - 1) attemptVerify(next.join(''));
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
                className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
                <p className="mt-1.5 text-sm text-gray-500">
                    We sent a {OTP_LENGTH}-digit code to{' '}
                    <span className="font-semibold text-gray-700">{email}</span>
                </p>
            </div>

            <motion.div
                animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.42 }}
                className="flex items-center justify-center gap-2.5 sm:gap-3"
            >
                {digits.map((d, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputsRef.current[i] = el; }}
                        value={d}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        inputMode="numeric"
                        maxLength={1}
                        disabled={verifying}
                        className={cn(
                            'w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold rounded-xl border bg-gray-50/60 text-gray-900',
                            'focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all duration-150',
                            d ? 'border-red-300 bg-red-50/40' : 'border-gray-200'
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
                        secondsLeft > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-700'
                    )}
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {secondsLeft > 0 ? `Resend in ${formatTime(secondsLeft)}` : 'Resend Code'}
                </button>
                {verifying && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying…
                    </span>
                )}
            </div>
        </div>
    );
}

// ---- Step 3: New Password ----
function PasswordStep({
    form, loading, onSubmit, onBack,
}: {
    form: ReturnType<typeof useForm<PasswordFormData>>;
    loading: boolean;
    onSubmit: (data: PasswordFormData) => void;
    onBack: () => void;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { register, handleSubmit, formState: { errors, isValid } } = form;

    return (
        <div>
            <button
                onClick={onBack}
                className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                <p className="mt-1.5 text-sm text-gray-500">
                    Choose a strong password for your account.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        New Password
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-red-600 transition-colors" />
                        <input
                            {...register('newPassword')}
                            type={showPassword ? 'text' : 'password'}
                            autoFocus
                            placeholder="••••••••"
                            className={cn(
                                'w-full pl-11 pr-11 py-3.5 rounded-xl border bg-white text-[15px] text-gray-900 placeholder-gray-400',
                                'focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-200',
                                errors.newPassword ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                    </div>
                    <FieldError message={errors.newPassword?.message} />
                    {!errors.newPassword && (
                        <p className="mt-1.5 text-xs text-gray-400">
                            At least 6 characters with a letter and a number.
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-red-600 transition-colors" />
                        <input
                            {...register('confirmPassword')}
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={cn(
                                'w-full pl-11 pr-11 py-3.5 rounded-xl border bg-white text-[15px] text-gray-900 placeholder-gray-400',
                                'focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-200',
                                errors.confirmPassword ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            tabIndex={-1}
                        >
                            {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                    </div>
                    <FieldError message={errors.confirmPassword?.message} />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !isValid}
                        className="flex-1 px-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {loading ? (
                            <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Resetting…</>
                        ) : (
                            <>Reset Password <ArrowRight className="w-[18px] h-[18px]" /></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ---- Step 4: Success ----
function SuccessStep() {
    return (
        <div className="text-center py-4">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
                className="relative w-20 h-20 mx-auto mb-6"
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
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
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900">Password Reset!</h2>
            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
                Your password has been reset successfully. You can now sign in with your new password.
            </p>

            <div className="mt-6 h-1.5 max-w-[220px] mx-auto rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'linear' }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                />
            </div>
        </div>
    );
}