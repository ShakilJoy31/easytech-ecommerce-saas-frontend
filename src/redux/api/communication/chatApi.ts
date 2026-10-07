import { apiSlice } from "../apiSlice";

export interface ChatMessage {
  id: string;
  type: 'user' | 'admin' | 'bot';
  text: string;
  image?: string | null;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  messages: ChatMessage[];
  status: 'active' | 'resolved' | 'archived';
  isOnline: boolean;
  lastActivity: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  success: boolean;
  data: Chat | Chat[];
  message?: string;
  isExisting?: boolean;
}

export interface PaginatedChatResponse {
  success: boolean;
  data: Chat[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface ChatStats {
  total: number;
  active: number;
  resolved: number;
  archived: number;
  totalUnread: number;
  chatsWithUnread: number;
}

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new chat session (public - from frontend form)
    createChat: builder.mutation<ChatResponse, {
      name: string;
      email: string;
      phone: string;
    }>({
      query: (data) => ({
        url: "/chats",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Chat', 'ChatStats'],
    }),

    // Get all chats with pagination and search (admin)
    getAllChats: builder.query<PaginatedChatResponse, {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }>({
      query: ({ page = 1, limit = 10, search = "", status = "active" }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search && search.trim() !== "") {
          params.append("search", search.trim());
        }
        if (status) {
          params.append("status", status);
        }
        
        return {
          url: `/chats/?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) => {
        if (result?.data) {
          return [
            ...result.data.map(({ id }) => ({ type: 'Chat' as const, id })),
            { type: 'Chat', id: 'LIST' },
          ];
        }
        return [{ type: 'Chat', id: 'LIST' }];
      },
    }),

    // Get single chat by ID (admin)
    getChatById: builder.query<ChatResponse, number>({
      query: (id) => ({
        url: `/chats/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Chat', id }],
    }),

    // Send a message in a chat (admin & user)
   sendMessage: builder.mutation<ChatResponse, {
  id: number;
  text?: string;
  image?: string;
  type?: 'user' | 'admin';
}>({
  query: ({ id, ...data }) => ({
    url: `/chats/${id}/messages`,
    method: "POST",
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [
    { type: 'Chat', id },
    { type: 'Chat', id: 'LIST' },
    'ChatStats'
  ],
}),

    // Mark all messages as read (admin)
    markAllAsRead: builder.mutation<ChatResponse, number>({
      query: (id) => ({
        url: `/chats/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Chat', id },
        { type: 'Chat', id: 'LIST' },
        'ChatStats'
      ],
    }),

    // Update chat status (admin)
    updateChatStatus: builder.mutation<ChatResponse, {
      id: number;
      status: 'active' | 'resolved' | 'archived';
    }>({
      query: ({ id, ...data }) => ({
        url: `/chats/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Chat', id },
        { type: 'Chat', id: 'LIST' },
        'ChatStats'
      ],
    }),

    // Delete chat session (admin)
    deleteChat: builder.mutation<ChatResponse, number>({
      query: (id) => ({
        url: `/chats/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: 'Chat', id: 'LIST' },
        'ChatStats'
      ],
    }),

    // Get chat statistics (admin)
    getChatStats: builder.query<{ success: boolean; data: ChatStats }, void>({
      query: () => ({
        url: "/chats/stats",
        method: "GET",
      }),
      providesTags: ['ChatStats'],
    }),
  }),
});

export const {
  useCreateChatMutation,
  useGetAllChatsQuery,
  useGetChatByIdQuery,
  useSendMessageMutation,
  useMarkAllAsReadMutation,
  useUpdateChatStatusMutation,
  useDeleteChatMutation,
  useGetChatStatsQuery,
} = chatApi;