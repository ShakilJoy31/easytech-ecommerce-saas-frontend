// redux/api/saas/orderApi.ts
import { apiSlice } from "../apiSlice";

/* =========================================================================
   Types
========================================================================= */
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  storeId: number;
  productTitle: string;
  productImage: string | null;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  invoiceNumber: string | null;
  storeId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string;
  customerDistrict: string | null;
  customerNote: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: "UNPAID" | "PAID" | "PARTIAL" | "REFUNDED";
  paymentReference: string | null;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  courierName: string | null;
  trackingNumber: string | null;
  notes: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt?: string;
  updatedAt?: string;

  items?: OrderItem[];
  itemCount?: number;
  totalQuantity?: number;
}

export interface CreateOrderInput {
  items: { productId: number; quantity: number }[];
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    district?: string;
    note?: string;
  };
  shippingCost?: number;
  discount?: number;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
}

/* =========================================================================
   API
========================================================================= */
export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data: CreateOrderInput) => ({
        url: "/order/create-order",
        method: "POST",
        body: data,
      }),
    }),

    getOrderByTransaction: builder.query({
      query: (tran_id: string) => ({
        url: `/order/status/${tran_id}`,
        method: "GET",
      }),
    }),

    getStoreOrders: builder.query({
      query: ({
        page = 1,
        limit = 20,
        status = "",
        paymentStatus = "",
        search = "",
      }: OrderListParams = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (status) params.append("status", status);
        if (paymentStatus) params.append("paymentStatus", paymentStatus);
        if (search) params.append("search", search);

        return {
          url: `/order/store-orders?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({
                type: "Order" as const,
                id,
              })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),

    getStoreOrderById: builder.query({
      query: (id: string | number) => ({
        url: `/order/store-order/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    updateOrderStatus: builder.mutation({
      query: ({
        id,
        ...data
      }: {
        id: number | string;
        status?: string;
        paymentStatus?: string;
        courierName?: string;
        trackingNumber?: string;
        cancellationReason?: string;
      }) => ({
        url: `/order/update-order-status/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    getOrderStats: builder.query({
      query: () => ({
        url: "/order/store-order-stats",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderByTransactionQuery,
  useGetStoreOrdersQuery,
  useGetStoreOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useGetOrderStatsQuery,
} = orderApi;