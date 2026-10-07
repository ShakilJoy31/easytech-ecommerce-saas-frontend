'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MessageCircle,
    Send,
    ImageIcon,
    Loader2,
    User,
    Mail,
    Phone,
    Check,
    RefreshCw,
    Trash2,
    Menu,
    X,
    ArrowLeft,
    AlertTriangle,
    Trash,
    Eye
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useAddThumbnailMutation } from '@/redux/features/file/fileApi';
import { cn } from '@/lib/utils';
import { useDeleteChatMutation, useGetAllChatsQuery, useGetChatByIdQuery, useGetChatStatsQuery, useMarkAllAsReadMutation, useSendMessageMutation, useUpdateChatStatusMutation } from '@/redux/api/communication/chatApi';

interface Message {
    id: string;
    type: 'user' | 'admin' | 'bot';
    text: string;
    image?: string | null;
    timestamp: string;
    isRead: boolean;
}

interface Chat {
    id: number;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    messages: Message[];
    status: 'active' | 'resolved' | 'archived';
    isOnline: boolean;
    lastActivity: string;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    resolved: 'bg-blue-100 text-blue-700 border-blue-200',
    archived: 'bg-gray-100 text-gray-700 border-gray-200'
};

const statusLabels = {
    active: 'Active',
    resolved: 'Resolved',
    archived: 'Archived'
};

export default function AdminChatDashboard() {
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('active');
    const [page, setPage] = useState(1);
    const [inputMessage, setInputMessage] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile menu when selecting a chat
    useEffect(() => {
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    }, [selectedChatId, isMobile]);

    // Queries
    const { data: chatsData, isLoading: isLoadingChats, refetch: refetchChats } = useGetAllChatsQuery({
        page,
        limit: 20,
        search: searchQuery,
        status: statusFilter
    });

    const { data: selectedChatData, refetch: refetchSelectedChat } = useGetChatByIdQuery(
        selectedChatId || 0,
        { skip: !selectedChatId }
    );

    const { data: statsData, refetch: refetchStats } = useGetChatStatsQuery();

    // Mutations
    const [sendMessage] = useSendMessageMutation();
    const [updateChatStatus] = useUpdateChatStatusMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [deleteChat] = useDeleteChatMutation();
    const [addThumbnail] = useAddThumbnailMutation();

    const selectedChat = selectedChatData?.data as Chat | undefined;

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages]);

    // Refetch data periodically
    useEffect(() => {
        const interval = setInterval(() => {
            refetchChats();
            refetchStats();
            if (selectedChatId) {
                refetchSelectedChat();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [refetchChats, refetchStats, refetchSelectedChat, selectedChatId]);

   const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChatId || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
        await sendMessage({
            id: selectedChatId,
            text: inputMessage,
            type: 'admin'
        }).unwrap();
        setInputMessage('');
        refetchSelectedChat();
        refetchChats();
        
        // Re-focus the input after sending
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    } catch (error) {
        console.error('Send message error:', error);
        toast.error('Failed to send message');
    } finally {
        setIsSendingMessage(false);
    }
};

    const handleImageUpload = async (file: File) => {
        if (!selectedChatId) return;

        try {
            setIsUploadingImage(true);

            const formData = new FormData();
            formData.append('image', file);

            const response = await addThumbnail(formData).unwrap();

            if (response.success && response.data && response.data[0]) {
                const imageUrl = response.data[0];

                await sendMessage({
                    id: selectedChatId,
                    image: imageUrl,
                    type: 'admin'
                }).unwrap();

                toast.success('Image sent successfully!');
                refetchSelectedChat();
                refetchChats();
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            handleImageUpload(file);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleStatusChange = async (status: 'active' | 'resolved' | 'archived') => {
        if (!selectedChatId) return;
        try {
            await updateChatStatus({ id: selectedChatId, status }).unwrap();
            toast.success(`Chat marked as ${statusLabels[status]}`);
            refetchSelectedChat();
            refetchChats();
            refetchStats();
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('Failed to update status');
        }
    };

    const handleMarkAsRead = async () => {
        if (!selectedChatId) return;
        try {
            await markAllAsRead(selectedChatId).unwrap();
            refetchSelectedChat();
            refetchChats();
            refetchStats();
        } catch (error) {
            console.error('Mark as read error:', error);
            toast.error('Failed to mark as read');
        }
    };

    // Open delete confirmation modal
    const openDeleteModal = (chatId: number) => {
        setChatToDelete(chatId);
        setShowDeleteModal(true);
    };

    // Close delete confirmation modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setChatToDelete(null);
    };

    // Handle delete confirmation
    const confirmDelete = async () => {
        if (!chatToDelete) return;

        setIsDeleting(true);
        try {
            await deleteChat(chatToDelete).unwrap();
            toast.success('Chat deleted successfully');
            if (selectedChatId === chatToDelete) {
                setSelectedChatId(null);
            }
            refetchChats();
            refetchStats();
            closeDeleteModal();
        } catch (error) {
            console.error('Delete chat error:', error);
            toast.error('Failed to delete chat');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getChats = chatsData?.data as Chat[] || [];
    const stats = statsData?.data;

    // Mobile: Show chat list or chat window
    const showChatList = !isMobile || (isMobile && !selectedChatId) || (isMobile && isMobileMenuOpen);
    const showChatWindow = !isMobile || (isMobile && selectedChatId && !isMobileMenuOpen);

    return (
        <>
            <div className="h-[calc(100vh-120px)] flex bg-gray-50 rounded-2xl overflow-hidden relative z-10">
                {/* Mobile Menu Toggle Button */}
                {isMobile && selectedChatId && (
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="absolute top-4 left-3.5 z-50 p-2 bg-white rounded-lg  md:mr-0 shadow-lg hover:bg-gray-50 transition-colors md:hidden"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                )}

                {/* Left Panel - Chat List */}
                <div
                    className={cn(
                        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
                        isMobile ? "absolute inset-0 z-40" : "w-96 relative",
                        isMobile && !showChatList && "hidden",
                        isMobile && showChatList && "flex"
                    )}
                >
                    {/* Stats Bar - Responsive */}
                    <div className="p-3 sm:p-4 border-b border-gray-100">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="text-center p-2 bg-blue-50 rounded-xl">
                                <p className="text-base sm:text-lg font-bold text-blue-600">{stats?.active || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Active</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded-xl">
                                <p className="text-base sm:text-lg font-bold text-green-600">{stats?.resolved || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Resolved</p>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded-xl">
                                <p className="text-base sm:text-lg font-bold text-purple-600">{stats?.totalUnread || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Unread</p>
                            </div>
                            <div className="text-center p-2 bg-orange-50 rounded-xl">
                                <p className="text-base sm:text-lg font-bold text-orange-600">{stats?.chatsWithUnread || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Chats</p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter - Responsive */}
                    <div className="p-3 sm:p-4 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="resolved">Resolved</option>
                                <option value="archived">Archived</option>
                                <option value="">All</option>
                            </select>
                        </div>
                    </div>

                    {/* Chat List - Responsive */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoadingChats ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : getChats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                                <MessageCircle className="w-12 h-12 mb-2" />
                                <p className="text-sm text-center">No chats found</p>
                            </div>
                        ) : (
                            getChats.map((chat) => (
                                <motion.div
                                    key={chat.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={cn(
                                        "p-3 sm:p-4 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-colors",
                                        selectedChatId === chat.id && "bg-blue-50 border-l-4 border-l-blue-500"
                                    )}
                                    onClick={() => setSelectedChatId(chat.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <span className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                                                    {chat.userName}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] sm:text-xs px-2 py-0.5 rounded-full border whitespace-nowrap",
                                                    statusColors[chat.status as keyof typeof statusColors]
                                                )}>
                                                    {statusLabels[chat.status as keyof typeof statusLabels]}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                {chat.messages[chat.messages.length - 1]?.text || 'No messages'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] sm:text-xs text-gray-400">
                                                    {formatTime(chat.lastActivity)}
                                                </span>
                                                {chat.unreadCount > 0 && (
                                                    <span className="text-[10px] sm:text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel - Chat Window */}
                <div
                    className={cn(
                        "flex-1 bg-white flex flex-col rounded-r-2xl transition-all duration-300 ease-in-out",
                        isMobile ? "absolute inset-0 z-40" : "relative",
                        isMobile && !showChatWindow && "hidden",
                        isMobile && showChatWindow && "flex"
                    )}
                >
                    {selectedChat ? (
                        <>
                            {/* Chat Header - Responsive */}
                            <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between bg-white rounded-tr-2xl">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    {/* Mobile Back Button */}
                                    {isMobile && (
                                        <button
                                            onClick={() => {
                                                setSelectedChatId(null);
                                                setIsMobileMenuOpen(true);
                                            }}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                    )}
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm sm:text-base">
                                        {selectedChat.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                                            {selectedChat.userName}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                                            <span className="truncate max-w-[80px] sm:max-w-none">{selectedChat.userEmail}</span>
                                            <span>•</span>
                                            <span className="truncate">{selectedChat.userPhone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <button
                                        onClick={handleMarkAsRead}
                                        className="p-1.5 sm:p-2 text-gray-500 cursor-pointer hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Mark all as read"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <select
                                        value={selectedChat.status}
                                        onChange={(e) => handleStatusChange(e.target.value as any)}
                                        className="px-2 sm:px-3 py-1 cursor-pointer sm:py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xs sm:text-sm bg-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="archived">Archived</option>
                                    </select>

                                    <button
                                        onClick={() => openDeleteModal(selectedChat.id)}
                                        className="p-1.5 sm:p-2 text-gray-500 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete chat"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            refetchSelectedChat();
                                            refetchChats();
                                        }}
                                        className="p-1.5 cursor-pointer sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Refresh"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages - Responsive */}
                            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
                                <AnimatePresence>
                                    {selectedChat.messages.map((message, index) => {
                                        const isUser = message.type === 'user';
                                        const isAdmin = message.type === 'admin' || message.type === 'bot';

                                        return (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={cn(
                                                    "flex mb-3",
                                                    isUser ? 'justify-start' : 'justify-end'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3",
                                                        isUser
                                                            ? 'bg-white border border-gray-200 text-gray-800'
                                                            : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                                                    )}
                                                >
                                                    {message.image && (
                                                        <div className="mb-2 rounded-lg overflow-hidden max-w-[180px] sm:max-w-[250px]">
                                                            <Image
                                                                src={message.image}
                                                                alt="Shared image"
                                                                width={250}
                                                                height={250}
                                                                className="object-cover w-full h-auto rounded-lg"
                                                            />
                                                        </div>
                                                    )}
                                                    {message.text && (
                                                        <p className="text-sm whitespace-pre-line break-words">{message.text}</p>
                                                    )}
                                                    <div className="flex items-center justify-between gap-2 sm:gap-3 mt-1">
                                                        <p className={cn(
                                                            "text-[10px] sm:text-xs",
                                                            isUser ? 'text-gray-400' : 'text-blue-100'
                                                        )}>
                                                            {formatTime(message.timestamp)}
                                                        </p>
                                                        {isUser && (
                                                            <span className={cn(
                                                                "text-[10px] sm:text-xs",
                                                                message.isRead ? 'text-blue-400' : 'text-gray-400'
                                                            )}>
                                                                {message.isRead ? 'Read' : 'Sent'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {isUploadingImage && (
                                    <div className="flex justify-end mb-3">
                                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                                            <div className="flex items-center gap-2 text-white">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-xs sm:text-sm">Uploading image...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input - Responsive */}
                            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white rounded-br-2xl">
                                <div className="flex gap-2 items-center">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm sm:text-base"
                                        disabled={isSendingMessage}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 sm:p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                        title="Attach image"
                                        disabled={isSendingMessage || isUploadingImage}
                                    >
                                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isSendingMessage}
                                        className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSendingMessage ? (
                                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mb-4 opacity-20" />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 text-center">Select a chat</h3>
                            <p className="text-xs sm:text-sm text-center">Choose a conversation from the left panel</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeDeleteModal}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="fixed inset-0 flex items-center justify-center z-[1000] p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                                {/* Header with animated icon */}
                                <div className="p-6 pb-4">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            delay: 0.1
                                        }}
                                        className="flex justify-center mb-4"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
                                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                                                <AlertTriangle size={36} className="text-white" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-center"
                                    >
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            Delete Chat?
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Are you sure you want to delete this chat? This action cannot be undone and all messages will be permanently removed.
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Chat info preview */}
                                {selectedChat && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.35 }}
                                        className="mx-6 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                {selectedChat.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {selectedChat.userName}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {selectedChat.userEmail}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full border whitespace-nowrap",
                                                statusColors[selectedChat.status as keyof typeof statusColors]
                                            )}>
                                                {statusLabels[selectedChat.status as keyof typeof statusLabels]}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Action buttons */}
                                <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={closeDeleteModal}
                                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 order-2 sm:order-1"
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash size={18} />
                                                Delete Forever
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}


