"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Users,
    Columns3,
    CalendarClock,
    LayoutDashboard,
    ArrowRight,
    Sparkles,
    AlertCircle,
    ShieldCheck,
    TrendingUp,
    Store,
    Wallet,
    Receipt,
    Package,
    ShoppingCart,
    FolderTree,
    BarChart3,
    Settings,
    Clock,
} from "lucide-react";
import {
    motion,
    MotionConfig,
    animate,
    useMotionValue,
    useMotionTemplate,
    useTransform,
    type Variants,
} from "framer-motion";

import { getUserInfo } from "@/utils/helper/userFromToken";

/* =====================================================================
   DESIGN SYSTEM (dark luxury + Storely green)
===================================================================== */
const glass =
    "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]";

const brandBtn =
    "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)]";

const staggerContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 110, damping: 18 },
    },
};

/* =====================================================================
   GLOBAL STYLES
===================================================================== */
const GlobalStyles = () => (
    <>
        <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
        <style jsx global>{`
      .storely-root {
        font-family: "Plus Jakarta Sans", system-ui, -apple-system,
          "Segoe UI", sans-serif;
      }
      .storely-root ::selection {
        background: rgba(16, 185, 129, 0.35);
      }
      .storely-root .skeleton {
        position: relative;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
      }
      .storely-root .skeleton::after {
        content: "";
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.08),
          transparent
        );
        animation: storely-shimmer 1.6s infinite;
      }
      @keyframes storely-shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `}</style>
    </>
);

/* =====================================================================
   PAGE SHELL
===================================================================== */
export const PageShell = ({ children }: { children: React.ReactNode }) => (
    <MotionConfig reducedMotion="user">
        <div className="storely-root relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
            <GlobalStyles />
            <div className="pointer-events-none absolute inset-0">
                <motion.div
                    className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-700/25 blur-[130px]"
                    animate={{ x: [0, 70, 0], y: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute -bottom-48 -right-32 h-[480px] w-[480px] rounded-full bg-green-600/15 blur-[130px]"
                    animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
                    transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
                />
                <div
                    className="absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                        backgroundSize: "56px 56px",
                        maskImage:
                            "radial-gradient(ellipse at 50% 20%, black 20%, transparent 75%)",
                        WebkitMaskImage:
                            "radial-gradient(ellipse at 50% 20%, black 20%, transparent 75%)",
                    }}
                />
            </div>
            <div className="relative z-10">{children}</div>
        </div>
    </MotionConfig>
);

/* =====================================================================
   COUNT-UP
===================================================================== */
const CountUp = ({ value }: { value: number }) => {
    const mv = useMotionValue(0);
    const rounded = useTransform(mv, (v) =>
        Math.round(v).toLocaleString("en-US")
    );

    useEffect(() => {
        const controls = animate(mv, value, { duration: 1.2, ease: "easeOut" });
        return () => controls.stop();
    }, [value, mv]);

    return <motion.span>{rounded}</motion.span>;
};

/* =====================================================================
   LOADING SCREEN
===================================================================== */
const LoadingScreen = () => (
    <PageShell>
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="relative mx-auto mb-8 h-24 w-24">
                    <motion.span
                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-500/40"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.span
                        className="absolute inset-3 rounded-full border-2 border-transparent border-b-green-400 border-l-green-400/40"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.9, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Sparkles className="h-7 w-7 text-emerald-400" />
                    </motion.div>
                </div>
                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-semibold text-white"
                >
                    Preparing your dashboard
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="mt-2 text-sm text-white/50"
                >
                    Loading Storely admin panel...
                </motion.p>
            </div>
        </div>
    </PageShell>
);

/* =====================================================================
   FEATURE CARD
===================================================================== */
interface MenuCardItem {
    key: string;
    icon: any;
    label: string;
    href: string;
    description: string;
    accent: string;
    stat: string;
    statLabel: string;
}

const FeatureCard = ({ item }: { item: MenuCardItem }) => {
    const ItemIcon = item.icon;
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const spotlight = useMotionTemplate`radial-gradient(280px circle at ${mx}px ${my}px, rgba(16,185,129,0.18), transparent 70%)`;

    return (
        <motion.div variants={fadeUp}>
            <Link href={item.href} className="group block h-full">
                <motion.div
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseMove={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        mx.set(e.clientX - r.left);
                        my.set(e.clientY - r.top);
                    }}
                    className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-colors duration-300 hover:border-emerald-500/40"
                >
                    <motion.div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: spotlight }}
                    />
                    <div className="relative">
                        <div className="mb-5 flex items-start justify-between">
                            <div
                                className={`rounded-xl border border-white/10 bg-gradient-to-br ${item.accent} p-3 shadow-lg shadow-emerald-900/30 transition-all duration-300 group-hover:scale-105`}
                            >
                                <ItemIcon className="h-6 w-6 text-white" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-white/25 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-400" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-white">
                            {item.label}
                        </h3>
                        <p className="text-xs leading-relaxed text-white/50">
                            {item.description}
                        </p>
                        <div className="mt-5 flex items-end justify-between border-t border-white/5 pt-4">
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
                                    {item.statLabel}
                                </p>
                                <p className="text-lg font-bold text-white">{item.stat}</p>
                            </div>
                            <span className="text-[11px] font-medium text-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                Open →
                            </span>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
};

/* =====================================================================
   SUPER ADMIN DASHBOARD
===================================================================== */
const SuperAdminDashboard = () => {
    const now = new Date();
    const greeting =
        now.getHours() < 12
            ? "Good morning"
            : now.getHours() < 18
            ? "Good afternoon"
            : "Good evening";

    const menuCards: MenuCardItem[] = [
        {
            key: "packages",
            icon: Package,
            label: "Packages",
            href: "/admin/packages",
            description:
                "Create and manage subscription packages offered to store owners.",
            accent: "from-emerald-600 to-green-600",
            stat: "—",
            statLabel: "All Packages",
        },
        {
            key: "subscriptions",
            icon: Receipt,
            label: "Subscriptions & Billing",
            href: "/admin/subscriptions",
            description:
                "Track active subscriptions, billing cycles, and payment statuses.",
            accent: "from-green-600 to-teal-600",
            stat: "—",
            statLabel: "Active Subscriptions",
        },
        {
            key: "stores",
            icon: Store,
            label: "Store Management",
            href: "/admin/stores",
            description:
                "Approve, suspend, or manage every store registered on the platform.",
            accent: "from-teal-600 to-emerald-600",
            stat: "—",
            statLabel: "Total Stores",
        },
        {
            key: "channels",
            icon: Wallet,
            label: "Payment Channels",
            href: "/admin/payment-channels",
            description:
                "Configure bKash, Nagad, and bank channels for manual payments.",
            accent: "from-emerald-600 to-lime-600",
            stat: "—",
            statLabel: "Payment Channels",
        },
        {
            key: "payments",
            icon: Receipt,
            label: "Manual Payments",
            href: "/admin/payments",
            description:
                "Verify and approve manual payment submissions from store owners.",
            accent: "from-green-700 to-emerald-600",
            stat: "—",
            statLabel: "Pending Verification",
        },
        {
            key: "users",
            icon: Users,
            label: "Users",
            href: "/admin/users/store-owners",
            description:
                "Manage store owner accounts, roles, and access permissions.",
            accent: "from-emerald-700 to-green-600",
            stat: "—",
            statLabel: "Store Owners",
        },
    ];

    return (
        <PageShell>
            <div className="min-h-screen p-4">
                <div className="mx-auto max-w-8xl">
                    {/* ============ HEADER ============ */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 16 }}
                        className={`${glass} relative mb-6 overflow-hidden p-6 md:p-8`}
                    >
                        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-600/15 blur-3xl" />
                        <div className="relative flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -30 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 12,
                                        delay: 0.15,
                                    }}
                                    className="rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 p-3.5 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)]"
                                >
                                    <LayoutDashboard className="h-7 w-7 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-400">
                                        {greeting}
                                    </p>
                                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
                                        Storely Command Center
                                    </h1>
                                    <p className="mt-1 text-sm text-white/55">
                                        Manage every store, subscription, and payment — all in one place.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                <span className="text-xs font-medium text-emerald-300">
                                    Live · Synced
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ============ SECTION LABEL ============ */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 flex items-center justify-between"
                    >
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Core Modules
                            </h2>
                            <p className="text-xs text-white/50">
                                Super admin workspace
                            </p>
                        </div>
                        <div className="hidden items-center gap-2 text-xs text-white/40 md:flex">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                                {now.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </motion.div>

                    {/* ============ FEATURE CARDS ============ */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {menuCards.map((item) => (
                            <FeatureCard key={item.key} item={item} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </PageShell>
    );
};

/* =====================================================================
   STORE OWNER DASHBOARD
===================================================================== */
const StoreOwnerDashboard = () => {
    const now = new Date();
    const greeting =
        now.getHours() < 12
            ? "Good morning"
            : now.getHours() < 18
            ? "Good afternoon"
            : "Good evening";

    const menuCards: MenuCardItem[] = [
        {
            key: "categories",
            icon: FolderTree,
            label: "Categories",
            href: "/admin/store/categories",
            description:
                "Organize your products with categories and subcategories.",
            accent: "from-emerald-600 to-green-600",
            stat: "—",
            statLabel: "Total Categories",
        },
        {
            key: "products",
            icon: Package,
            label: "Products",
            href: "/admin/store/products",
            description:
                "Add, edit, and manage everything you sell in your store.",
            accent: "from-green-600 to-teal-600",
            stat: "—",
            statLabel: "Total Products",
        },
        {
            key: "orders",
            icon: ShoppingCart,
            label: "Orders",
            href: "/admin/store/orders",
            description:
                "Track new orders, fulfil shipments, and manage invoices.",
            accent: "from-teal-600 to-emerald-600",
            stat: "—",
            statLabel: "Total Orders",
        },
        {
            key: "reports",
            icon: BarChart3,
            label: "Sales Reports",
            href: "/admin/store/reports",
            description:
                "Understand your sales performance with detailed analytics.",
            accent: "from-emerald-600 to-lime-600",
            stat: "—",
            statLabel: "This Month",
        },
        {
            key: "settings",
            icon: Settings,
            label: "Store Settings",
            href: "/admin/store/settings",
            description:
                "Update your store profile, branding, and contact details.",
            accent: "from-green-700 to-emerald-600",
            stat: "—",
            statLabel: "Configuration",
        },
    ];

    return (
        <PageShell>
            <div className="min-h-screen p-4">
                <div className="mx-auto max-w-8xl">
                    {/* ============ HEADER ============ */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 16 }}
                        className={`${glass} relative mb-6 overflow-hidden p-6 md:p-8`}
                    >
                        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-600/15 blur-3xl" />
                        <div className="relative flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -30 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 12,
                                        delay: 0.15,
                                    }}
                                    className="rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 p-3.5 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)]"
                                >
                                    <Store className="h-7 w-7 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-400">
                                        {greeting}
                                    </p>
                                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
                                        Storely Store Admin
                                    </h1>
                                    <p className="mt-1 text-sm text-white/55">
                                        Everything you need to run your store — from one dashboard.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                <span className="text-xs font-medium text-emerald-300">
                                    Live · Synced
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ============ SECTION LABEL ============ */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 flex items-center justify-between"
                    >
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Store Modules
                            </h2>
                            <p className="text-xs text-white/50">
                                Your day-to-day workspace
                            </p>
                        </div>
                        <div className="hidden items-center gap-2 text-xs text-white/40 md:flex">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                                {now.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </motion.div>

                    {/* ============ FEATURE CARDS ============ */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {menuCards.map((item) => (
                            <FeatureCard key={item.key} item={item} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </PageShell>
    );
};

/* =====================================================================
   ROOT — role gate
===================================================================== */
const StorelyAdminPanel = () => {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const userInfo = await getUserInfo();
            if (!userInfo) {
                router.push("/");
            } else {
                setUser(userInfo);
            }
        };
        fetchUser();
    }, [router]);

    /* ---------- Role detection ---------- */
    const isStoreOwner = user?.role === "STORE_OWNER";

    const isSuperAdmin =
        user?.role === "super-admin" ||
        user?.role === "superadmin" ||
        user?.role === "admin" ||
        user?.userType === "admin" ||
        user?.isAdmin === true;

    if (!user) return <LoadingScreen />;

    if (isStoreOwner) return <StoreOwnerDashboard />;

    if (isSuperAdmin) return <SuperAdminDashboard />;

    /* ---------- No recognized role ---------- */
    return (
        <PageShell>
            <div className="flex min-h-screen items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 110, damping: 16 }}
                    className={`${glass} w-full max-w-7xl p-8 text-center`}
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10"
                    >
                        <AlertCircle className="h-10 w-10 text-rose-300" />
                    </motion.div>
                    <h2 className="mb-2 text-2xl font-semibold text-white">
                        Access Denied
                    </h2>
                    <p className="mb-7 text-sm leading-relaxed text-white/60">
                        You do not have administrator privileges to view this page.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => router.push("/")}
                        className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold ${brandBtn}`}
                    >
                        Return Home
                        <ArrowRight className="h-4 w-4" />
                    </motion.button>
                </motion.div>
            </div>
        </PageShell>
    );
};

export default StorelyAdminPanel;