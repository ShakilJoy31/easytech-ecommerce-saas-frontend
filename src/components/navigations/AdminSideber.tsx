'use client';

import * as Avatar from '@radix-ui/react-avatar';
import {
    LayoutDashboard,
    Package,
    CreditCard,
    Store,
    Wallet,
    ChevronDown,
    X,
    PlusCircle,
    ListChecks,
    Settings,
    Receipt,
    Clock,
    Users,
    UserPlus,
    FolderTree,
    Tags,
    ShoppingCart,
    FileText,
    BarChart3,
} from 'lucide-react';
import { MdLogout } from 'react-icons/md';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import alecLogo from '../../../public/The_Logo/alec_logo.png';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { shareWithCookies } from '@/utils/helper/shareWithCookies';
import { appConfiguration } from '@/utils/constant/appConfiguration';
import { getUserInfo } from '@/utils/helper/userFromToken';

interface AdminSidebarProps {
    isOpen?: boolean;
    onToggleSidebar?: () => void;
    isMobile?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    isOpen = true,
    onToggleSidebar,
    isMobile = false,
}) => {
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userInfo = await getUserInfo();
            if (!userInfo) {
                router.push('/');
            } else {
                setUser(userInfo);
            }
        };
        fetchUser();
    }, [router]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setInternalIsOpen(isOpen);
    }, [isOpen]);

    /* ================================================================
       ROLE-BASED MENU CONFIGURATION
       ================================================================ */

    const isStoreOwner = user?.role === 'STORE_OWNER';

    // -------- SUPER ADMIN MENU --------
    const superAdminMenu = [
        {
            key: 'dashboard',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            key: 'packages',
            icon: <Package size={20} />,
            label: 'Packages',
            subItems: [
                {
                    key: 'all-packages',
                    icon: <ListChecks size={16} />,
                    label: 'All Packages',
                    href: '/admin/packages',
                },
                {
                    key: 'add-package',
                    icon: <PlusCircle size={16} />,
                    label: 'Add Package',
                    href: '/admin/packages/new',
                },
            ],
        },
        {
            key: 'subscriptions',
            icon: <CreditCard size={20} />,
            label: 'Subscriptions & Billing',
            href: '/admin/subscriptions',
        },
        {
            key: 'stores',
            icon: <Store size={20} />,
            label: 'Store Management',
            href: '/admin/stores',
        },
        {
            key: 'channels',
            icon: <Wallet size={20} />,
            label: 'Payment Channels',
            subItems: [
                {
                    key: 'all-channels',
                    icon: <ListChecks size={16} />,
                    label: 'All Channels',
                    href: '/admin/payment-channels',
                },
                {
                    key: 'add-channel',
                    icon: <PlusCircle size={16} />,
                    label: 'Add Channel',
                    href: '/admin/payment-channels/new',
                },
            ],
        },
        {
            key: 'payments',
            icon: <Receipt size={20} />,
            label: 'Manual Payments',
            href: '/admin/payments',
        },
        {
            key: 'users',
            icon: <Users size={20} />,
            label: 'Users',
            subItems: [
                {
                    key: 'store-owners',
                    icon: <ListChecks size={16} />,
                    label: 'Store Owners',
                    href: '/admin/users/store-owners',
                },
                {
                    key: 'add-store-owner',
                    icon: <UserPlus size={16} />,
                    label: 'Add Store Owner',
                    href: '/admin/users/store-owners-new',
                },
            ],
        },
        // {
        //     key: 'settings',
        //     icon: <Settings size={20} />,
        //     label: 'Settings',
        //     href: '/admin/settings',
        // },
    ];

    // -------- STORE OWNER MENU --------
    const storeOwnerMenu = [
        {
            key: 'dashboard',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            key: 'categories',
            icon: <FolderTree size={20} />,
            label: 'Categories',
            subItems: [
                {
                    key: 'all-categories',
                    icon: <Tags size={16} />,
                    label: 'All Categories',
                    href: '/admin/store/categories',
                },
                {
                    key: 'add-category',
                    icon: <PlusCircle size={16} />,
                    label: 'Add Category',
                    href: '/admin/store/new-category',
                },
            ],
        },
        {
            key: 'products',
            icon: <Package size={20} />,
            label: 'Products',
            subItems: [
                {
                    key: 'all-products',
                    icon: <ListChecks size={16} />,
                    label: 'All Products',
                    href: '/admin/store/products',
                },
                {
                    key: 'add-product',
                    icon: <PlusCircle size={16} />,
                    label: 'Add Product',
                    href: '/store/products/new',
                },
            ],
        },
        {
            key: 'orders',
            icon: <ShoppingCart size={20} />,
            label: 'Orders',
            subItems: [
                {
                    key: 'all-orders',
                    icon: <ListChecks size={16} />,
                    label: 'All Orders',
                    href: '/admin/store/orders',
                },
                {
                    key: 'invoices',
                    icon: <FileText size={16} />,
                    label: 'Invoices',
                    href: '/admin/store/orders/invoices',
                },
            ],
        },
        {
            key: 'reports',
            icon: <BarChart3 size={20} />,
            label: 'Sales Reports',
            href: '/admin/store/reports',
        },
        {
            key: 'settings',
            icon: <Settings size={20} />,
            label: 'Store Settings',
            href: '/admin/store/settings',
        },
    ];

    // Pick the active menu based on role
    const menuItems = isStoreOwner ? storeOwnerMenu : superAdminMenu;

    /* ================================================================
       DISPLAY HELPERS
       ================================================================ */
    const getDisplayName = () => {
        return user?.name || user?.fullName || 'User';
    };

    const getDisplayEmail = () => {
        return user?.email || 'user@saas.com';
    };

    const getProfileImage = () => user?.photo || '';

    const getProfileInitial = () => {
        const name = user?.name || user?.fullName || 'A';
        return name.charAt(0).toUpperCase();
    };

    /* ================================================================
       ACTIVE LOGIC
       ================================================================ */
    const isActive = (href: string, strict = false) => {
        if (!pathname || !href) return false;

        const normPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        const normHref = href.endsWith('/') ? href.slice(0, -1) : href;

        // Exact match always wins
        if (normPath === normHref) return true;

        // Strict mode: no prefix matching
        if (strict) return false;

        // Non-strict: allow prefix matching for nested routes
        return normPath.startsWith(normHref + '/');
    };

    const isActiveSubmenu = (item: any): boolean => {
        if (!item.subItems) return false;
        return item.subItems.some((sub: { href: string }) =>
            isActive(sub.href, true)
        );
    };

    /* ================================================================
       HANDLERS
       ================================================================ */
    const handleLogout = () => {
        shareWithCookies('remove', `${appConfiguration.appCode}token`);
        shareWithCookies('remove', `${appConfiguration.appCode}refreshToken`);
        router.push('/');
        router.refresh();
    };

    const handleProfileRedirect = () => {
        router.push(isStoreOwner ? '/store/profile' : '/admin/profile');
    };

    const handleMobileClose = () => {
        if (isMobile && onToggleSidebar) onToggleSidebar();
    };

    // Auto-open submenu based on route
    useEffect(() => {
        if (!pathname) return;
        for (const item of menuItems) {
            if (item.subItems) {
                for (const sub of item.subItems) {
                    if (isActive(sub.href, true)) {
                        setActiveSubmenu(item.key);
                        return;
                    }
                }
            }
        }
        setActiveSubmenu(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, user?.role]);

    const displayIsOpen = isMobile ? isOpen : internalIsOpen;

    return (
        <motion.aside
            initial={false}
            animate={{
                width: displayIsOpen ? (isMobile ? '100%' : 264) : 76,
                x: isMobile ? (isOpen ? 0 : -100) : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
                'h-screen flex flex-col overflow-hidden relative z-20',
                'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950',
                'shadow-[8px_0_24px_-8px_rgba(0,0,0,0.45)]',
                isMobile ? 'max-w-xl' : 'sticky top-0'
            )}
        >
            {/* Subtle green glow accent at top */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-emerald-600/10 to-transparent pointer-events-none" />

            {/* ==================== LOGO ==================== */}
            <div className="relative p-4 flex items-center justify-between">
                <Link
                    href={isStoreOwner ? '/admin/dashboard' : '/admin/dashboard'}
                    onClick={handleMobileClose}
                    className="flex items-center gap-3 min-w-0"
                >
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                            opacity: displayIsOpen ? 1 : 0,
                            x: displayIsOpen ? 0 : -20,
                        }}
                        transition={{ duration: 0.2 }}
                        className={cn('flex items-center gap-3', !displayIsOpen && 'hidden')}
                    >
                        {/* Logo mark */}
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 blur-md opacity-60" />
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                                {mounted && (
                                    <Image
                                        src={alecLogo}
                                        alt="Storely"
                                        width={28}
                                        height={28}
                                        className="w-6 h-6 object-contain brightness-0 invert"
                                        priority
                                    />
                                )}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[15px] font-bold text-white tracking-tight leading-tight">
                                {isStoreOwner ? 'Store Admin' : 'Storely Admin'}
                            </p>
                        </div>
                    </motion.div>
                </Link>

                {/* Mobile close button */}
                {isMobile && (
                    <button
                        onClick={() => onToggleSidebar && onToggleSidebar()}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors md:hidden"
                        aria-label="Close menu"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                )}
            </div>

            {/* ==================== NAVIGATION ==================== */}
            <nav className="relative flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const active = !item.subItems ? isActive(item.href) : false;
                        const subActive = item.subItems ? isActiveSubmenu(item) : false;
                        const highlighted = active || subActive;

                        return (
                            <li key={item.key}>
                                {!item.subItems ? (
                                    <Link
                                        href={item.href}
                                        onClick={handleMobileClose}
                                        className={cn(
                                            'group relative flex items-center px-3 py-2.5 gap-3 rounded-xl transition-all duration-200',
                                            'text-gray-400 hover:text-white',
                                            !highlighted && 'hover:bg-white/[0.04]',
                                            highlighted &&
                                                'bg-gradient-to-r from-emerald-600/90 to-green-600/90 text-white shadow-lg shadow-emerald-900/40'
                                        )}
                                    >
                                        {/* Active left indicator */}
                                        {highlighted && (
                                            <motion.span
                                                layoutId="active-indicator"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/90"
                                            />
                                        )}

                                        <span
                                            className={cn(
                                                'text-[20px] transition-colors flex-shrink-0',
                                                highlighted
                                                    ? 'text-white'
                                                    : 'text-gray-500 group-hover:text-emerald-400'
                                            )}
                                        >
                                            {item.icon}
                                        </span>
                                        {displayIsOpen && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-sm font-medium truncate"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </Link>
                                ) : (
                                    <div>
                                        <button
                                            onClick={() =>
                                                setActiveSubmenu(
                                                    activeSubmenu === item.key ? null : item.key
                                                )
                                            }
                                            className={cn(
                                                'group relative flex items-center px-3 py-2.5 gap-3 w-full rounded-xl transition-all duration-200',
                                                'text-gray-400 hover:text-white',
                                                !subActive &&
                                                    activeSubmenu !== item.key &&
                                                    'hover:bg-white/[0.04]',
                                                (subActive || activeSubmenu === item.key) &&
                                                    'bg-white/[0.04] text-white'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'text-[20px] transition-colors flex-shrink-0',
                                                    subActive || activeSubmenu === item.key
                                                        ? 'text-emerald-400'
                                                        : 'text-gray-500 group-hover:text-emerald-400'
                                                )}
                                            >
                                                {item.icon}
                                            </span>
                                            {displayIsOpen && (
                                                <>
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-sm font-medium flex-1 text-left truncate"
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                    <ChevronDown
                                                        size={16}
                                                        className={cn(
                                                            'transition-transform text-gray-500 flex-shrink-0',
                                                            activeSubmenu === item.key
                                                                ? 'rotate-180'
                                                                : ''
                                                        )}
                                                    />
                                                </>
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {(activeSubmenu === item.key || subActive) &&
                                                item.subItems &&
                                                displayIsOpen && (
                                                    <motion.ul
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{
                                                            height: 'auto',
                                                            opacity: 1,
                                                        }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="ml-7 mt-1 space-y-0.5 overflow-hidden border-l border-white/5 pl-2"
                                                    >
                                                        {item.subItems.map((subItem) => {
                                                            const subIsActive = isActive(
                                                                subItem.href,
                                                                true
                                                            );
                                                            return (
                                                                <motion.li
                                                                    key={subItem.key}
                                                                    initial={{ opacity: 0, x: -8 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ duration: 0.1 }}
                                                                >
                                                                    <Link
                                                                        href={subItem.href}
                                                                        onClick={handleMobileClose}
                                                                        className={cn(
                                                                            'flex items-center px-3 py-2 gap-2.5 text-sm rounded-lg transition-all duration-150',
                                                                            'text-gray-400 hover:text-white hover:bg-white/[0.04]',
                                                                            subIsActive &&
                                                                                'bg-gradient-to-r from-emerald-600/20 to-green-600/10 text-emerald-300 font-medium'
                                                                        )}
                                                                    >
                                                                        <span
                                                                            className={cn(
                                                                                'text-[15px] transition-colors flex-shrink-0',
                                                                                subIsActive
                                                                                    ? 'text-emerald-400'
                                                                                    : 'text-gray-500'
                                                                            )}
                                                                        >
                                                                            {subItem.icon}
                                                                        </span>
                                                                        <span className="truncate">
                                                                            {subItem.label}
                                                                        </span>
                                                                    </Link>
                                                                </motion.li>
                                                            );
                                                        })}
                                                    </motion.ul>
                                                )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* ==================== USER SECTION ==================== */}
            <div className="relative p-3">
                <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <div className="flex items-center gap-3 pt-2">
                    <Avatar.Root
                        onClick={handleProfileRedirect}
                        className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 cursor-pointer ring-2 ring-white/10 hover:ring-emerald-500/50 transition-all"
                    >
                        <Avatar.Image
                            src={getProfileImage()}
                            alt={getDisplayName()}
                            className="object-cover w-full h-full"
                        />
                        <Avatar.Fallback
                            delayMs={600}
                            className="bg-gradient-to-br from-emerald-600 to-green-600 text-white flex items-center justify-center w-full h-full text-sm font-semibold"
                        >
                            {getProfileInitial()}
                        </Avatar.Fallback>
                    </Avatar.Root>

                    {displayIsOpen && (
                        <motion.div
                            onClick={handleProfileRedirect}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: displayIsOpen ? 1 : 0,
                                x: displayIsOpen ? 0 : -20,
                            }}
                            transition={{ duration: 0.2 }}
                            className="text-sm flex-1 min-w-0 cursor-pointer"
                        >
                            <p className="font-semibold text-white truncate leading-tight">
                                {getDisplayName()}
                            </p>
                            <p className="text-xs text-gray-500 truncate leading-tight">
                                {getDisplayEmail()}
                            </p>
                        </motion.div>
                    )}

                    {displayIsOpen && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="p-2 rounded-lg hover:bg-emerald-600/10 transition-colors flex-shrink-0 group">
                                    <MdLogout
                                        size={18}
                                        className="text-gray-500 group-hover:text-emerald-400 transition-colors"
                                    />
                                </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="bg-gray-900 border border-gray-800 max-w-[95vw] md:max-w-md mx-auto">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-gray-100">
                                        {isStoreOwner
                                            ? 'Sign out of Store Admin?'
                                            : 'Sign out of Storely Admin?'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                        You will be signed out of your current session.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                                    <AlertDialogCancel className="bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700 order-2 sm:order-1">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleLogout}
                                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white order-1 sm:order-2"
                                    >
                                        Sign Out
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};

export default AdminSidebar;