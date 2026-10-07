// redux/api/saas/storeManagementApi.ts
import { apiSlice } from "../apiSlice";

/* =========================================================================
   Types
========================================================================= */
export interface StoreOwner {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  role: string;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export interface StorePackage {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  durationDay: number;
  features?: string[];
  maxProducts?: number | null;
  maxCategories?: number | null;
  maxOrdersPerMonth?: number | null;
}

export interface Store {
  id: number;
  storeCode: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  district?: string | null;
  country?: string;
  ownerId: number;
  packageId?: number | null;
  subscriptionStartAt?: string | null;
  subscriptionEndAt?: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
  primaryColor?: string;
  secondaryColor?: string;
  facebook?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Computed
  isExpired?: boolean;
  daysRemaining?: number;

  // Enriched
  owner?: StoreOwner | null;
  package?: StorePackage | null;
  recentSubscriptions?: any[];
}

export interface StoreListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
  packageId?: number | string;
  district?: string;
}

export interface UpdateStoreInput {
  id: number | string;
  name?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  logo?: string;
  banner?: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  country?: string;
  primaryColor?: string;
  secondaryColor?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
  subscriptionStartAt?: string;
  subscriptionEndAt?: string;
}

/* =========================================================================
   API
========================================================================= */
export const storeManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllStores: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        status = "",
        packageId = "",
        district = "",
      }: StoreListParams = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        if (packageId) params.append("packageId", String(packageId));
        if (district) params.append("district", district);

        return {
          url: `/store/get-all-stores?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }: { id: number }) => ({
              type: "Store" as const,
              id,
            })),
            { type: "Store", id: "LIST" },
          ]
          : [{ type: "Store", id: "LIST" }],
    }),

    getStoreById: builder.query({
      query: (id: string | number) => ({
        url: `/store/get-store/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Store", id }],
    }),

    getStoreBySlug: builder.query({
      query: (slug: string) => ({
        url: `/store/public/store/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [
        { type: "Store", id: `SLUG-${slug}` },
      ],
    }),

    getStoreStats: builder.query({
      query: () => ({
        url: "/store/get-store-stats",
        method: "GET",
      }),
      providesTags: ["Store"],
    }),

    updateStore: builder.mutation({
      query: ({ id, ...data }: UpdateStoreInput) => ({
        url: `/store/update-store/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Store", id },
        { type: "Store", id: "LIST" },
        "StoreOwner",
      ],
    }),

    toggleStoreStatus: builder.mutation({
      query: ({
        id,
        status,
      }: {
        id: number | string;
        status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
      }) => ({
        url: `/store/toggle-store-status/${id}`,
        method: "PUT",
        body: status ? { status } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Store", id },
        { type: "Store", id: "LIST" },
        "StoreOwner",
      ],
    }),

    deleteStore: builder.mutation({
      query: (id: number | string) => ({
        url: `/store/delete-store/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Store", id: "LIST" },
        "StoreOwner",
      ],
    }),

    getPublicStores: builder.query({
      query: ({
        page = 1,
        limit = 50,
        search = "",
        district = "",
      }: { page?: number; limit?: number; search?: string; district?: string } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (district) params.append("district", district);

        return {
          url: `/store/public/stores?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Store", id: "PUBLIC" }],
    }),


  }),
});

export const {
  useGetAllStoresQuery,
  useGetStoreByIdQuery,
  useGetStoreBySlugQuery,
  useGetStoreStatsQuery,
  useUpdateStoreMutation,
  useToggleStoreStatusMutation,
  useDeleteStoreMutation,
  useGetPublicStoresQuery
} = storeManagementApi;