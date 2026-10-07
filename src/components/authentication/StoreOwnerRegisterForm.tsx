"use client";

import { useState, useEffect, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Eye, EyeOff, Lock, X, Loader2, AlertCircle, ArrowRight,
  Mail, ShoppingBag, Package, Truck, CreditCard, TrendingUp,
  User, Phone, Store as StoreIcon, MapPin, Check,
  Sparkles, Crown, Infinity as InfinityIcon, Building2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { shareWithCookies } from "@/utils/helper/shareWithCookies";
import { appConfiguration } from "@/utils/constant/appConfiguration";
import { useRegisterStoreOwnerMutation } from "@/redux/api/saas/storeOwnerApi";
import { useGetPublicPackagesQuery } from "@/redux/api/saas/packageApi";

/* =========================================================================
   Schema (input / output split — same trick we used before)
========================================================================= */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{11,14}$/;

const registerSchema = z
  .object({
    // ---- Owner ----
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name must be under 60 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .refine((v) => emailRegex.test(v), "Enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone is required")
      .refine((v) => phoneRegex.test(v), "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),

    // ---- Store ----
    storeName: z
      .string()
      .min(2, "Store name must be at least 2 characters")
      .max(80, "Store name must be under 80 characters"),
    storeTagline: z.string().max(120, "Tagline must be under 120 characters").optional().or(z.literal("")),
    storeDescription: z.string().max(500, "Description must be under 500 characters").optional().or(z.literal("")),
    storePhone: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || phoneRegex.test(v), "Enter a valid store phone"),
    storeEmail: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || emailRegex.test(v), "Enter a valid store email"),
    storeAddress: z.string().max(300).optional().or(z.literal("")),
    storeDistrict: z.string().max(60).optional().or(z.literal("")),

    // ---- Package ----
    packageId: z.coerce.number().min(1, "Please select a package"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormInput = z.input<typeof registerSchema>;
type RegisterFormData = z.output<typeof registerSchema>;

/* =========================================================================
   Showcase data
========================================================================= */
const LIVE_ORDERS = [
  { id: "#10482", item: "Wireless Earbuds Pro", amount: "৳4,250", icon: ShoppingBag },
  { id: "#10483", item: "Cotton Panjabi Set", amount: "৳2,890", icon: Package },
  { id: "#10484", item: "Smart Fitness Band", amount: "৳3,490", icon: Truck },
  { id: "#10485", item: "Kitchen Blender 1.5L", amount: "৳5,120", icon: CreditCard },
];

const SPARK_PATH =
  "M0 62 C 20 58, 30 40, 52 44 S 90 56, 112 34 S 150 18, 172 24 S 208 8, 232 6";

/* =========================================================================
   Small helpers
========================================================================= */
function CountUp({
  to,
  prefix = "",
  duration = 1.8,
}: {
  to: number;
  prefix?: string;
  duration?: number;
}) {
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => `${prefix}${Math.round(v).toLocaleString("en-US")}`);

  useEffect(() => {
    const controls = animate(value, to, { duration, ease: "easeOut", delay: 0.5 });
    return () => controls.stop();
  }, [to, duration, value]);

  return <motion.span>{text}</motion.span>;
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
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="absolute inset-0 flex items-center gap-3 rounded-2xl bg-white/95 px-4 shadow-xl shadow-black/20"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              New order {order.id}
            </p>
            <p className="truncate text-xs text-gray-500">{order.item}</p>
          </div>
          <span className="text-sm font-bold text-emerald-700">{order.amount}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   Field wrapper
========================================================================= */
function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-800">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   MAIN COMPONENT
========================================================================= */
export default function StoreOwnerRegisterForm() {
  const router = useRouter();
  const reduceMotion = !!useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [registerStoreOwner, { isLoading }] = useRegisterStoreOwnerMutation();

const { data: packagesData, isLoading: isLoadingPackages } = useGetPublicPackagesQuery(undefined);

  const packages = packagesData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormInput, any, RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      storeName: "",
      storeTagline: "",
      storeDescription: "",
      storePhone: "",
      storeEmail: "",
      storeAddress: "",
      storeDistrict: "",
      packageId: 0,
    },
    mode: "onChange",
  });

  const selectedPackageId = watch("packageId");
  const selectedPackage = useMemo(
    () => packages.find((p: any) => p.id === Number(selectedPackageId)),
    [packages, selectedPackageId]
  );

  useEffect(() => setMounted(true), []);

  /* ---------------- submit ---------------- */
  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    try {
      const payload = {
        // owner
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        password: data.password,

        // store
        storeName: data.storeName.trim(),
        storeTagline: data.storeTagline?.trim() || "",
        storeDescription: data.storeDescription?.trim() || "",
        storePhone: data.storePhone?.trim() || data.phone.trim(),
        storeEmail: data.storeEmail?.trim() || data.email.trim(),
        storeAddress: data.storeAddress?.trim() || "",
        storeDistrict: data.storeDistrict?.trim() || "",

        // package
        packageId: Number(data.packageId),
      };

      const response = await registerStoreOwner(payload).unwrap();

      if (response.success && response.data?.tokens?.accessToken) {
        const { accessToken, refreshToken } = response.data.tokens;
        const tokenName = `${appConfiguration.appCode}token`;
        const refreshTokenName = `${appConfiguration.appCode}refreshToken`;

        // Auto-login: persist tokens
        shareWithCookies("set", tokenName, 1440, accessToken);
        shareWithCookies("set", refreshTokenName, 10080, refreshToken);

        toast.success("Store created! Complete payment to activate.");

        const slug = response.data.store?.slug || "";
        const storeId = response.data.store?.id;

        // Redirect to manual payment page for this store
        router.push(
          `/store/payment?storeId=${storeId}&slug=${encodeURIComponent(slug)}&packageId=${payload.packageId}`
        );
      }
    } catch (error: any) {
      console.error("Register error:", error);
      const msg =
        error?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex animate-pulse flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gray-100" />
          <div className="h-4 w-40 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full py-3 rounded-xl border bg-white text-sm font-medium text-gray-900 placeholder-gray-400 " +
    "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const inputWithIcon = `${inputBase} pl-11`;

  return (
    <>
      {/* On lg+: the page itself is locked to the viewport height (no page scroll). */}
      <div className="grid min-h-screen bg-gray-50 lg:h-screen lg:grid-cols-[1.05fr_1fr] lg:overflow-hidden mt-16 ">
        {/* ========= LEFT: SHOWCASE (fixed, vertically centered, never scrolls on lg+) ========= */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[#0b2b26] px-6 py-12 text-white sm:px-10 sm:py-16 lg:h-screen lg:px-12 lg:py-8 xl:px-16">
          <motion.div
            aria-hidden
            className="absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-500/25 blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-40 -right-24 h-[460px] w-[460px] rounded-full bg-amber-400/20 blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative w-full max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-xs font-semibold tracking-wide text-emerald-200">
                Launch your store in minutes
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-left xl:text-5xl"
            >
              Start selling online — today.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-center text-sm leading-relaxed text-emerald-50/70 sm:mt-5 sm:text-base lg:text-left"
            >
              Create your store, add products, accept orders and grow — all
              from one dashboard.
            </motion.p>

            {/* Feature bullet list */}
            <motion.ul
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {[
                "Unlimited store page",
                "Product & order management",
                "Sales reports & invoices",
                "Fast setup, no code needed",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-emerald-50/90"
                >
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-300" />
                  {item}
                </li>
              ))}
            </motion.ul>

            {/* Sales card + live orders */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-8 space-y-4 sm:mt-10"
            >
              <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 backdrop-blur sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-emerald-100/70">Today&apos;s sales</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">
                      <CountUp to={284650} prefix="৳" />
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +18.4%
                  </span>
                </div>
                <svg viewBox="0 0 232 70" className="mt-4 h-14 w-full sm:h-16" fill="none" aria-hidden>
                  <defs>
                    <linearGradient id="sparkFillReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d={`${SPARK_PATH} L 232 70 L 0 70 Z`}
                    fill="url(#sparkFillReg)"
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
                    transition={{ delay: 0.5, duration: 1.6, ease: "easeInOut" }}
                  />
                </svg>
              </div>

              <LiveOrderTicker reduceMotion={reduceMotion} />
            </motion.div>
          </div>
        </div>

        {/* ========= RIGHT: REGISTER FORM (the only scrollable area on lg+) ========= */}
        <div className="flex items-start justify-center bg-white p-6 sm:p-12 lg:h-screen lg:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="w-full max-w-xl"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1">
                <StoreIcon className="h-3 w-3 text-emerald-700" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Store Owner Registration
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Create your store account
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Fill in the details below. You&apos;ll complete a quick payment
                step after registration to activate your store.
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* ============ SECTION: Owner Info ============ */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Your Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Full Name" required error={errors.name?.message}>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          {...register("name")}
                          type="text"
                          placeholder="Rahim Uddin"
                          disabled={isLoading}
                          className={cn(
                            inputWithIcon,
                            "pr-4",
                            errors.name
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Email" required error={errors.email?.message}>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className={cn(
                          inputWithIcon,
                          "pr-4",
                          errors.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                    </div>
                  </Field>

                  <Field label="Phone" required error={errors.phone?.message}>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("phone")}
                        type="tel"
                        inputMode="numeric"
                        placeholder="01712345678"
                        autoComplete="tel"
                        disabled={isLoading}
                        className={cn(
                          inputWithIcon,
                          "pr-4",
                          errors.phone
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                    </div>
                  </Field>

                  <Field label="Password" required error={errors.password?.message}>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        disabled={isLoading}
                        className={cn(
                          inputWithIcon,
                          "pr-12",
                          errors.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirm Password" required error={errors.confirmPassword?.message}>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("confirmPassword")}
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter password"
                        disabled={isLoading}
                        className={cn(
                          inputWithIcon,
                          "pr-12",
                          errors.confirmPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        tabIndex={-1}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                </div>
              </section>

              {/* ============ SECTION: Store Info ============ */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Store Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      label="Store Name"
                      required
                      hint="This will be your store URL"
                      error={errors.storeName?.message}
                    >
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          {...register("storeName")}
                          type="text"
                          placeholder="Rahim Electronics"
                          disabled={isLoading}
                          className={cn(
                            inputWithIcon,
                            "pr-4",
                            errors.storeName
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Tagline"
                      hint="Optional"
                      error={errors.storeTagline?.message}
                    >
                      <input
                        {...register("storeTagline")}
                        type="text"
                        placeholder="Best electronics in town"
                        disabled={isLoading}
                        className={cn(
                          inputBase,
                          "px-4",
                          errors.storeTagline
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Store Description"
                      hint="Optional"
                      error={errors.storeDescription?.message}
                    >
                      <textarea
                        {...register("storeDescription")}
                        rows={2}
                        placeholder="A short description about your store..."
                        disabled={isLoading}
                        className={cn(
                          inputBase,
                          "resize-none px-4",
                          errors.storeDescription
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                    </Field>
                  </div>

                  <Field label="Store Phone" hint="Optional" error={errors.storePhone?.message}>
                    <input
                      {...register("storePhone")}
                      type="tel"
                      placeholder="Defaults to your phone"
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        "px-4",
                        errors.storePhone
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    />
                  </Field>

                  <Field label="Store Email" hint="Optional" error={errors.storeEmail?.message}>
                    <input
                      {...register("storeEmail")}
                      type="email"
                      placeholder="Defaults to your email"
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        "px-4",
                        errors.storeEmail
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Store Address" hint="Optional" error={errors.storeAddress?.message}>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          {...register("storeAddress")}
                          rows={2}
                          placeholder="Shop address..."
                          disabled={isLoading}
                          className={cn(
                            inputBase,
                            "resize-none pl-11 pr-4",
                            errors.storeAddress
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="District" hint="Optional" error={errors.storeDistrict?.message}>
                      <input
                        {...register("storeDistrict")}
                        type="text"
                        placeholder="Dhaka"
                        disabled={isLoading}
                        className={cn(
                          inputBase,
                          "px-4",
                          errors.storeDistrict
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* ============ SECTION: Package ============ */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Choose Your Package
                  </h3>
                </div>

                {isLoadingPackages ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-28 animate-pulse rounded-2xl bg-gray-100"
                      />
                    ))}
                  </div>
                ) : packages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                    <AlertCircle className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      No packages available right now.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {packages.map((pkg: any) => {
                        const isSelected = Number(selectedPackageId) === pkg.id;
                        return (
                          <motion.button
                            key={pkg.id}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              setValue("packageId", pkg.id, {
                                shouldValidate: true,
                              })
                            }
                            className={cn(
                              "relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all",
                              isSelected
                                ? "border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-500/10"
                                : "border-gray-200 bg-white hover:border-emerald-300"
                            )}
                          >
                            {pkg.isPopular && (
                              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                <Crown className="h-3 w-3" />
                                Popular
                              </span>
                            )}

                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </motion.span>
                            )}

                            <p className="text-sm font-bold text-gray-900">
                              {pkg.name}
                            </p>
                            <p className="mt-1 text-xl font-bold text-gray-900">
                              {pkg.currency === "BDT" ? "৳" : pkg.currency}
                              {Number(pkg.price).toLocaleString("en-US")}
                              <span className="ml-1 text-xs font-medium text-gray-500">
                                / {pkg.durationLabel?.toLowerCase() || `${pkg.durationDay}d`}
                              </span>
                            </p>

                            <div className="mt-3 flex flex-col gap-1 text-[11px] text-gray-600">
                              <span className="flex items-center gap-1">
                                Products:
                                {pkg.maxProducts === null ? (
                                  <InfinityIcon className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <b>{pkg.maxProducts}</b>
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                Categories:
                                {pkg.maxCategories === null ? (
                                  <InfinityIcon className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <b>{pkg.maxCategories}</b>
                                )}
                              </span>
                            </div>

                            {pkg.features && pkg.features.length > 0 && (
                              <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3">
                                {pkg.features.slice(0, 3).map((f: string, i: number) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-1.5 text-[11px] text-gray-600"
                                  >
                                    <Check className="h-3 w-3 flex-shrink-0 text-emerald-600" />
                                    <span className="truncate">{f}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {errors.packageId && (
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.packageId.message as string}
                      </p>
                    )}

                    {selectedPackage && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800"
                      >
                        <b>Selected:</b> {selectedPackage.name} — ৳
                        {Number(selectedPackage.price).toLocaleString("en-US")} for{" "}
                        {selectedPackage.durationDay} days. You&apos;ll pay this
                        amount after registration.
                      </motion.div>
                    )}
                  </>
                )}
              </section>

              {/* ============ SUBMIT ============ */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className={cn(
                  "group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-[15px] font-semibold text-white",
                  "bg-[#0b2b26] shadow-lg shadow-emerald-900/20 hover:bg-[#0f3a33]",
                  "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                )}
              >
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                />
                {isLoading ? (
                  <>
                    <Loader2 className="relative z-10 h-[18px] w-[18px] animate-spin" />
                    <span className="relative z-10">Creating your store…</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Create Store & Continue</span>
                    <ArrowRight className="relative z-10 h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </motion.button>

              {/* Footer — link to login */}
              <p className="text-center text-xs text-gray-500">
                Already have a store?{" "}
                <Link
                  href="/store/login"
                  className="font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Sign in here
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}