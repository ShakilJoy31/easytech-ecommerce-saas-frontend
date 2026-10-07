// redux/api/saas/subscriptionApi.ts
import { apiSlice } from "../apiSlice";

export interface Subscription {
  id: number;
  storeId: number;
  packageId: number;
  manualPaymentId: number | null;
  startAt: string;
  endAt: string;
  durationDay: number;
  durationLabel?: string;
  price: number;
  currency: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";
  isRenewal: boolean;
  previousSubscriptionId: number | null;
  notes: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;

  // Enriched
  isExpired?: boolean;
  daysRemaining?: number;
  store?: {
    id: number;
    storeCode: string;
    name: string;
    slug: string;
    status: string;
    email?: string | null;
    phone?: string | null;
    logo?: string | null;
    subscriptionStartAt?: string | null;
    subscriptionEndAt?: string | null;
  } | null;
  package?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    currency: string;
    durationDay: number;
    features?: string[];
    maxProducts?: number | null;
    maxCategories?: number | null;
  } | null;
  manualPayment?: {
    id: number;
    paymentCode: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: string;
    accountNumber: string;
    verifiedAt?: string | null;
  } | null;
}

export interface SubscriptionListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";
  storeId?: number | string;
  packageId?: number | string;
  dateFrom?: string;
  dateTo?: string;
}

export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubscriptions: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        status = "",
        storeId = "",
        packageId = "",
        dateFrom = "",
        dateTo = "",
      }: SubscriptionListParams = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        if (storeId) params.append("storeId", String(storeId));
        if (packageId) params.append("packageId", String(packageId));
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);

        return {
          url: `/subscription/get-all-subscriptions?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({
                type: "Subscription" as const,
                id,
              })),
              { type: "Subscription", id: "LIST" },
            ]
          : [{ type: "Subscription", id: "LIST" }],
    }),

    getSubscriptionById: builder.query({
      query: (id: string | number) => ({
        url: `/subscription/get-subscription/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Subscription", id }],
    }),

    getSubscriptionsByStore: builder.query({
      query: (storeId: string | number) => ({
        url: `/subscription/get-store-subscriptions/${storeId}`,
        method: "GET",
      }),
      providesTags: (result, error, storeId) => [
        { type: "Subscription", id: `STORE-${storeId}` },
      ],
    }),

    getSubscriptionStats: builder.query({
      query: () => ({
        url: "/subscription/get-subscription-stats",
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),

    cancelSubscription: builder.mutation({
      query: ({ id, reason }: { id: number | string; reason?: string }) => ({
        url: `/subscription/cancel-subscription/${id}`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Subscription", id },
        { type: "Subscription", id: "LIST" },
        "Store",
      ],
    }),

    expireOutdatedSubscriptions: builder.mutation({
      query: () => ({
        url: "/subscription/expire-outdated",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Subscription", id: "LIST" },
        "Store",
      ],
    }),
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useGetSubscriptionsByStoreQuery,
  useGetSubscriptionStatsQuery,
  useCancelSubscriptionMutation,
  useExpireOutdatedSubscriptionsMutation,
} = subscriptionApi;