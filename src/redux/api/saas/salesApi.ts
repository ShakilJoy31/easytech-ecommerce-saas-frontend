// redux/api/saas/salesApi.ts
import { apiSlice } from "../apiSlice";

export type SalesRange =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export interface SalesQueryParams {
  range?: SalesRange;
  dateFrom?: string;
  dateTo?: string;
}

export interface SalesOverview {
  range: { start: string; end: string; preset: string };
  orders: {
    total: number;
    paid: number;
    delivered: number;
    pending: number;
    cancelled: number;
  };
  revenue: {
    gross: number;
    net: number;
    discount: number;
    shipping: number;
  };
  metrics: {
    avgOrderValue: number;
    unitsSold: number;
    uniqueCustomers: number;
  };
}

export interface RevenuePoint {
  period: string;
  label: string;
  orders: number;
  revenue: number;
}

export interface RevenueChart {
  grouping: "day" | "month";
  points: RevenuePoint[];
}

export interface TopProduct {
  productId: number | null;
  title: string;
  image: string | null;
  sku: string | null;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface PaymentBreakdown {
  method: string;
  count: number;
  revenue: number;
}

export interface CategorySales {
  categoryId: number | null;
  categoryName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesOverview: builder.query({
      query: ({ range = "last30days", dateFrom = "", dateTo = "" }: SalesQueryParams = {}) => {
        const params = new URLSearchParams();
        params.append("range", range);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        return {
          url: `/order/sales/overview?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Sales"],
    }),

    getRevenueChart: builder.query({
      query: ({ range = "last30days", dateFrom = "", dateTo = "" }: SalesQueryParams = {}) => {
        const params = new URLSearchParams();
        params.append("range", range);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        return {
          url: `/order/sales/revenue-chart?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Sales"],
    }),

    getTopProducts: builder.query({
      query: ({
        range = "last30days",
        dateFrom = "",
        dateTo = "",
        limit = 10,
      }: SalesQueryParams & { limit?: number } = {}) => {
        const params = new URLSearchParams();
        params.append("range", range);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        params.append("limit", String(limit));
        return {
          url: `/order/sales/top-products?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Sales"],
    }),

    getRecentOrders: builder.query({
      query: ({ limit = 5 }: { limit?: number } = {}) => ({
        url: `/order/sales/recent-orders?limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    getPaymentBreakdown: builder.query({
      query: ({ range = "last30days", dateFrom = "", dateTo = "" }: SalesQueryParams = {}) => {
        const params = new URLSearchParams();
        params.append("range", range);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        return {
          url: `/order/sales/payment-breakdown?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Sales"],
    }),

    getSalesByCategory: builder.query({
      query: ({ range = "last30days", dateFrom = "", dateTo = "" }: SalesQueryParams = {}) => {
        const params = new URLSearchParams();
        params.append("range", range);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        return {
          url: `/order/sales/by-category?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Sales"],
    }),
  }),
});

export const {
  useGetSalesOverviewQuery,
  useGetRevenueChartQuery,
  useGetTopProductsQuery,
  useGetRecentOrdersQuery,
  useGetPaymentBreakdownQuery,
  useGetSalesByCategoryQuery,
} = salesApi;