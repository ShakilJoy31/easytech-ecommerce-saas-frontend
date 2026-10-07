// redux/api/saas/manualPaymentApi.ts
import { apiSlice } from "../apiSlice";

export interface SubmitManualPaymentInput {
  storeId: number;
  packageId: number;
  channelId: number;
  accountNumber: string;
  senderAccountNumber?: string;
  transactionId: string;
  paymentDate?: string;
  screenshot?: string;
  notes?: string;
}





export interface GetAllManualPaymentsParams {
  page?: number;
  limit?: number;
  status?: "" | "PENDING" | "VERIFIED" | "REJECTED";
  search?: string;
  storeId?: number | string;
  channelId?: number | string;
  dateFrom?: string;
  dateTo?: string;
}



export const manualPaymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitManualPayment: builder.mutation({
      query: (data: SubmitManualPaymentInput) => ({
        url: "/manual-payment/submit-payment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ManualPayment"],
    }),

    getMyManualPayments: builder.query({
      query: ({ storeId }: { storeId: number | string }) => ({
        url: `/manual-payment/get-store-payments/${storeId}`,
        method: "GET",
      }),
      providesTags: ["ManualPayment"],
    }),

    getManualPaymentById: builder.query({
      query: (id: string | number) => ({
        url: `/manual-payment/get-payment/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ManualPayment", id }],
    }),








    // Add inside endpoints: (builder) => ({
getAllManualPayments: builder.query({
  query: ({
    page = 1,
    limit = 10,
    status = "",
    search = "",
    storeId = "",
    channelId = "",
    dateFrom = "",
    dateTo = "",
  }: GetAllManualPaymentsParams = {}) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    if (storeId) params.append("storeId", String(storeId));
    if (channelId) params.append("channelId", String(channelId));
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);

    return {
      url: `/manual-payment/get-all-payments?${params.toString()}`,
      method: "GET",
    };
  },
  providesTags: (result) =>
    result?.data
      ? [
          ...result.data.map(({ id }: { id: number }) => ({
            type: "ManualPayment" as const,
            id,
          })),
          { type: "ManualPayment", id: "LIST" },
        ]
      : [{ type: "ManualPayment", id: "LIST" }],
}),

getManualPaymentStats: builder.query({
  query: () => ({
    url: "/manual-payment/get-payment-stats",
    method: "GET",
  }),
  providesTags: ["ManualPayment"],
}),

verifyManualPayment: builder.mutation({
  query: ({ id, notes }: { id: number | string; notes?: string }) => ({
    url: `/manual-payment/verify-payment/${id}`,
    method: "PUT",
    body: { notes },
  }),
  invalidatesTags: (result, error, { id }) => [
    { type: "ManualPayment", id },
    { type: "ManualPayment", id: "LIST" },
    "Store",
  ],
}),

rejectManualPayment: builder.mutation({
  query: ({
    id,
    rejectionReason,
  }: {
    id: number | string;
    rejectionReason: string;
  }) => ({
    url: `/manual-payment/reject-payment/${id}`,
    method: "PUT",
    body: { rejectionReason },
  }),
  invalidatesTags: (result, error, { id }) => [
    { type: "ManualPayment", id },
    { type: "ManualPayment", id: "LIST" },
  ],
}),






  }),
});

export const {
  useSubmitManualPaymentMutation,
  useGetMyManualPaymentsQuery,
  useGetManualPaymentByIdQuery,


  useGetAllManualPaymentsQuery,      
  useGetManualPaymentStatsQuery,     
  useVerifyManualPaymentMutation,  
  useRejectManualPaymentMutation,   

} = manualPaymentApi;