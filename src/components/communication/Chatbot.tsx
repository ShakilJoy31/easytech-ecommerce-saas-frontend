'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  User,
  Mail,
  Phone,
  MessageCircle,
  Sparkles,
  Loader2,
  Minimize2,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useAddThumbnailMutation } from '@/redux/features/file/fileApi';
import { useCreateChatMutation, useSendMessageMutation, useGetChatByIdQuery } from '@/redux/api/communication/chatApi';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'admin';
  text: string;
  image?: string | null;
  timestamp: Date;
  isRead?: boolean;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

interface ChatData {
  id: number;
  messages: Message[];
  status: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

const STORAGE_KEY = 'chat_session';

export default function Chatbot({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isChatResolved, setIsChatResolved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createChat] = useCreateChatMutation();
  const [sendMessage] = useSendMessageMutation();
  const [addThumbnail] = useAddThumbnailMutation();

  // Fetch chat by ID for polling
  const { data: fetchedChatData, refetch: refetchChat } = useGetChatByIdQuery(
    chatId || 0,
    { skip: !chatId }
  );

  // Load chat from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem(STORAGE_KEY);
    if (savedChat) {
      try {
        const chatData: ChatData = JSON.parse(savedChat);
        // Check if chat is still active (not resolved)
        if (chatData.status !== 'resolved' && chatData.status !== 'archived') {
          setChatId(chatData.id);
          setMessages(chatData.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
          setStep('chat');
          // Set user info from saved chat
          setUserInfo({
            name: chatData.userName,
            email: chatData.userEmail,
            phone: chatData.userPhone,
          });
        } else {
          // Chat is resolved, clear storage
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading chat from localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save chat to localStorage whenever messages or chatId changes
  useEffect(() => {
    if (chatId && messages.length > 0) {
      const chatData: ChatData = {
        id: chatId,
        messages: messages,
        status: isChatResolved ? 'resolved' : 'active',
        userId: `user_${Date.now()}`,
        userName: userInfo.name,
        userEmail: userInfo.email,
        userPhone: userInfo.phone,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatData));
    }
  }, [messages, chatId, userInfo, isChatResolved]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!chatId || isChatResolved) return;

    const pollInterval = setInterval(() => {
      refetchChat();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [chatId, refetchChat, isChatResolved]);

  // Update messages when fetched data changes
  useEffect(() => {
    if (fetchedChatData?.data) {
      const chatData = fetchedChatData.data as any;

      // Check if chat is resolved
      if (chatData.status === 'resolved' || chatData.status === 'archived') {
        setIsChatResolved(true);
        // Show resolved message
        toast.success('This chat has been resolved. Thank you for contacting us!');
        // Clear storage after a delay
        setTimeout(() => {
          localStorage.removeItem(STORAGE_KEY);
        }, 5000);
        return;
      }

      // Update messages if they've changed
      if (chatData.messages) {
        const formattedMessages = chatData.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));

        // Check if there are new admin messages
        const currentMessageIds = new Set(messages.map(m => m.id));
        const newMessages = formattedMessages.filter((m: Message) => !currentMessageIds.has(m.id));

        // Only update if there are new messages
        if (newMessages.length > 0) {
          const adminMessages = newMessages.filter((m: Message) => m.type === 'admin' || m.type === 'bot');
          if (adminMessages.length > 0) {
            setMessages(formattedMessages);
            // Show notification for new admin message
            toast.success('New reply from support!');
          } else {
            // Just update messages
            setMessages(formattedMessages);
          }
        }
      }
    }
  }, [fetchedChatData, messages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on chat start
  useEffect(() => {
    if (step === 'chat' && !isChatResolved) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [step, isChatResolved]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.name && userInfo.email && userInfo.phone) {
      setIsSubmitting(true);
      try {
        const response = await createChat({
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
        }).unwrap();

        if (response.success && response.data) {
          const chatData = response.data as any;
          setChatId(chatData.id);

          // Set messages from the response
          if (chatData.messages && chatData.messages.length > 0) {
            const formattedMessages = chatData.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            setMessages(formattedMessages);
          }

          setStep('chat');

          if (response.isExisting) {
            toast.success('Welcome back! Continuing your chat.');
          } else {
            toast.success('Chat started successfully!');
          }
        }
      } catch (error: any) {
        console.error('Create chat error:', error);
        toast.error(error?.data?.message || 'Failed to start chat. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatId || isChatResolved) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      text: inputMessage,
      timestamp: new Date(),
      isRead: false
    };

    // Optimistically add message
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    try {
      const response = await sendMessage({
        id: chatId,
        text: inputMessage,
        type: 'user'
      }).unwrap();

      if (response.success && response.data) {
        const chatData = response.data as any;
        const formattedMessages = chatData.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message. Please try again.');
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!chatId || isChatResolved) {
      toast.error('Chat is no longer active');
      return;
    }

    try {
      setIsUploadingImage(true);

      const formData = new FormData();
      formData.append('image', file);

      const response = await addThumbnail(formData).unwrap();

      if (response.success && response.data && response.data[0]) {
        const imageUrl = response.data[0];

        // Add image message
        const imageMsg: Message = {
          id: `msg_${Date.now()}`,
          type: 'user',
          text: '',
          image: imageUrl,
          timestamp: new Date(),
          isRead: false
        };

        setMessages(prev => [...prev, imageMsg]);

        await sendMessage({
          id: chatId,
          image: imageUrl,
          type: 'user'
        }).unwrap();

        toast.success('Image sent successfully!');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Please try again.');
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
      if (step === 'form') {
        handleFormSubmit(e as any);
      } else {
        handleSendMessage();
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl shadow-2xl p-4 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-3 text-white">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Chat with ISAB</span>
          {!isChatResolved && (
            <span className="ml-auto text-xs bg-green-400/30 px-2 py-1 rounded-full">Online</span>
          )}
          {isChatResolved && (
            <span className="ml-auto text-xs bg-gray-400/30 px-2 py-1 rounded-full">Resolved</span>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[600px] h-[500px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">ISAB Support</h3>
            <p className="text-blue-100 text-xs">
              {isChatResolved ? 'Chat Resolved' : 'Online • Usually replies instantly'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {step === 'form' ? (
          // Form Step
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-blue-100 mb-3">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Welcome to ISAB</h3>
              <p className="text-gray-600 text-sm mt-1">
                Please fill in your details to start chatting with our support team.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Starting Chat...
                  </>
                ) : (
                  <>
                    Start Chat
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          // Chat Step
          <div className="space-y-3">
            {isChatResolved && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-green-700 text-sm font-medium">
                  ✅ This chat has been resolved. Thank you for contacting us!
                </p>
                <p className="text-green-600 text-xs mt-1">
                  This chat will be closed in a few seconds.
                </p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message) => {
                // For client view:
                // - User messages on RIGHT (justify-end)
                // - Admin/Bot messages on LEFT (justify-start)
                const isUser = message.type === 'user';
                const isAdmin = message.type === 'admin' || message.type === 'bot';

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                    >
                      {message.image && (
                        <div className="mb-2 rounded-lg overflow-hidden max-w-[200px]">
                          <Image
                            src={message.image}
                            alt="Shared image"
                            width={200}
                            height={200}
                            className="object-cover w-full h-auto rounded-lg"
                          />
                        </div>
                      )}
                      {message.text && (
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                      )}
                      <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                        {formatTime(message.timestamp)}
                        {isUser && !message.isRead && ' • Sent'}
                        {isAdmin && ' • Support'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isUploadingImage && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-white">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Uploading image...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer / Input */}
      {step === 'chat' && !isChatResolved && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              disabled={isChatResolved}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              title="Attach image"
              disabled={isChatResolved}
            >
              <ImageIcon className="w-5 h-5" />
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
              disabled={!inputMessage.trim() || isChatResolved}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Powered by ISAB Support • Usually replies instantly
          </p>
        </div>
      )}

      {step === 'chat' && isChatResolved && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-center text-sm text-gray-500">
            This chat has been resolved
          </p>
        </div>
      )}
    </div>
  );
}


