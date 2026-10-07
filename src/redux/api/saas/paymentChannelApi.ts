// redux/api/saas/paymentChannelApi.ts
import { apiSlice } from "../apiSlice";

export interface PaymentChannel {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  accountType: "PERSONAL" | "MERCHANT" | "AGENT" | "BANK";
  accountTypeLabel?: string;
  accountNumber: string;
  accountHolderName: string | null;
  bankName: string | null;
  branchName: string | null;
  routingNumber: string | null;
  instructions: string | null;
  displayOrder: number;
  isActive: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChannelInput {
  name: string;
  logo?: string;
  accountType?: "PERSONAL" | "MERCHANT" | "AGENT" | "BANK";
  accountNumber: string;
  accountHolderName?: string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  instructions?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateChannelInput extends Partial<CreateChannelInput> {
  id: number | string;
}

export interface ChannelListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string | boolean;
  accountType?: string;
}

export const paymentChannelApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentChannel: builder.mutation({
      query: (data: CreateChannelInput) => ({
        url: "/payment-channel/create-channel",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "PaymentChannel", id: "LIST" }],
    }),

    getAllPaymentChannels: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        isActive = "",
        accountType = "",
      }: ChannelListParams = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (isActive !== "" && isActive !== undefined)
          params.append("isActive", String(isActive));
        if (accountType) params.append("accountType", accountType);

        return {
          url: `/payment-channel/get-channels?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({
                type: "PaymentChannel" as const,
                id,
              })),
              { type: "PaymentChannel", id: "LIST" },
            ]
          : [{ type: "PaymentChannel", id: "LIST" }],
    }),

    getPublicPaymentChannels: builder.query<{ data: PaymentChannel[] }, void>({
      query: () => ({
        url: "/payment-channel/public/channels",
        method: "GET",
      }),
      providesTags: [{ type: "PaymentChannel", id: "PUBLIC" }],
    }),

    getPaymentChannelById: builder.query({
      query: (id: string | number) => ({
        url: `/payment-channel/get-channel/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "PaymentChannel", id }],
    }),

    updatePaymentChannel: builder.mutation({
      query: ({ id, ...data }: UpdateChannelInput) => ({
        url: `/payment-channel/update-channel/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PaymentChannel", id },
        { type: "PaymentChannel", id: "LIST" },
        { type: "PaymentChannel", id: "PUBLIC" },
      ],
    }),

    deletePaymentChannel: builder.mutation({
      query: (id: string | number) => ({
        url: `/payment-channel/delete-channel/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "PaymentChannel", id: "LIST" },
        { type: "PaymentChannel", id: "PUBLIC" },
      ],
    }),

    togglePaymentChannelStatus: builder.mutation({
      query: ({
        id,
        isActive,
      }: {
        id: string | number;
        isActive?: boolean;
      }) => ({
        url: `/payment-channel/toggle-channel-status/${id}`,
        method: "PUT",
        body: isActive !== undefined ? { isActive } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PaymentChannel", id },
        { type: "PaymentChannel", id: "LIST" },
        { type: "PaymentChannel", id: "PUBLIC" },
      ],
    }),

    getPaymentChannelStats: builder.query({
      query: () => ({
        url: "/payment-channel/get-channel-stats",
        method: "GET",
      }),
      providesTags: ["PaymentChannel"],
    }),
  }),
});

export const {
  useCreatePaymentChannelMutation,
  useGetAllPaymentChannelsQuery,
  useGetPublicPaymentChannelsQuery,
  useGetPaymentChannelByIdQuery,
  useUpdatePaymentChannelMutation,
  useDeletePaymentChannelMutation,
  useTogglePaymentChannelStatusMutation,
  useGetPaymentChannelStatsQuery,
} = paymentChannelApi;