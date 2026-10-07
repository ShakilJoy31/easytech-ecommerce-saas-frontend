// redux/api/saas/storeOwnerApi.ts
import { apiSlice } from "../apiSlice";

/* =========================================================================
   Types
========================================================================= */
export interface StoreOwnerUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "STORE_OWNER";
  storeId: number | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreOwnerStore {
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
  package?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterStoreOwnerInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  storeName: string;
  storeTagline?: string;
  storeDescription?: string;
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
  storeDistrict?: string;
  packageId: number;
}

export interface LoginStoreOwnerInput {
  identifier: string;
  password: string;
}

export interface GetAllStoreOwnersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string | boolean;
  storeStatus?: string;
}

export interface CreateStoreOwnerByAdminInput extends RegisterStoreOwnerInput {
  isActive?: boolean;
  activateStore?: boolean;
}

export interface UpdateStoreOwnerByAdminInput {
  id: number | string;
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  storeName?: string;
  storeTagline?: string;
  storeDescription?: string;
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
  storeDistrict?: string;
  packageId?: number;
  storeStatus?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
}

/* =========================================================================
   API
========================================================================= */
export const storeOwnerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- Public / self ---------- */
    registerStoreOwner: builder.mutation({
      query: (data: RegisterStoreOwnerInput) => ({
        url: "/store-owner/register-store-owner",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StoreOwner", "Store"],
    }),

    loginStoreOwner: builder.mutation({
      query: (data: LoginStoreOwnerInput) => ({
        url: "/store-owner/login-store-owner",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StoreOwner"],
    }),

    getCurrentStoreOwner: builder.query({
      query: () => ({
        url: "/store-owner/me",
        method: "GET",
      }),
      providesTags: ["StoreOwner"],
    }),

    /* ---------- Super admin ---------- */
    getAllStoreOwners: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        isActive = "",
        storeStatus = "",
      }: GetAllStoreOwnersParams = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (isActive !== "" && isActive !== undefined)
          params.append("isActive", String(isActive));
        if (storeStatus) params.append("storeStatus", storeStatus);

        return {
          url: `/store-owner/get-all-store-owners?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }: { id: number }) => ({
              type: "StoreOwner" as const,
              id,
            })),
            { type: "StoreOwner", id: "LIST" },
          ]
          : [{ type: "StoreOwner", id: "LIST" }],
    }),

    getStoreOwnerById: builder.query({
      query: (id: string | number) => ({
        url: `/store-owner/get-store-owner/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "StoreOwner", id }],
    }),

    createStoreOwnerByAdmin: builder.mutation({
      query: (data: CreateStoreOwnerByAdminInput) => ({
        url: "/store-owner/create-store-owner",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "StoreOwner", id: "LIST" },
        "Store",
      ],
    }),

    updateStoreOwnerByAdmin: builder.mutation({
      query: ({ id, ...data }: UpdateStoreOwnerByAdminInput) => ({
        url: `/store-owner/update-store-owner/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StoreOwner", id },
        { type: "StoreOwner", id: "LIST" },
        "Store",
      ],
    }),

    toggleStoreOwnerStatus: builder.mutation({
      query: ({
        id,
        isActive,
      }: {
        id: number | string;
        isActive?: boolean;
      }) => ({
        url: `/store-owner/toggle-store-owner-status/${id}`,
        method: "PUT",
        body: isActive !== undefined ? { isActive } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StoreOwner", id },
        { type: "StoreOwner", id: "LIST" },
      ],
    }),

    deleteStoreOwner: builder.mutation({
      query: (id: number | string) => ({
        url: `/store-owner/delete-store-owner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "StoreOwner", id: "LIST" },
        "Store",
      ],
    }),

    getStoreOwnerStats: builder.query({
      query: () => ({
        url: "/store-owner/get-store-owner-stats",
        method: "GET",
      }),
      providesTags: ["StoreOwner"],
    }),
  }),
});

export const {
  // public
  useRegisterStoreOwnerMutation,
  useLoginStoreOwnerMutation,
  useGetCurrentStoreOwnerQuery,

  // super admin
  useGetAllStoreOwnersQuery,
  useGetStoreOwnerByIdQuery,
  useCreateStoreOwnerByAdminMutation,
  useUpdateStoreOwnerByAdminMutation,
  useToggleStoreOwnerStatusMutation,
  useDeleteStoreOwnerMutation,
  useGetStoreOwnerStatsQuery,
} = storeOwnerApi;