// redux/api/package/packageApi.ts
import { apiSlice } from "../apiSlice";

export interface Package {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  durationDay: number;
  durationLabel?: string;
  maxProducts: number | null;
  maxCategories: number | null;
  maxOrdersPerMonth: number | null;
  maxProductsLabel?: string;
  maxCategoriesLabel?: string;
  maxOrdersPerMonthLabel?: string;
  features: string[];
  displayOrder: number;
  isPopular: boolean;
  isActive: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePackageInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  durationDay?: number;
  maxProducts?: number | null;
  maxCategories?: number | null;
  maxOrdersPerMonth?: number | null;
  features?: string[] | string;
  displayOrder?: number;
  isPopular?: boolean;
  isActive?: boolean;
}

export interface UpdatePackageInput extends Partial<CreatePackageInput> {
  id: number | string;
}

export interface PackageListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string | boolean;
  isPopular?: string | boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export const packageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create
    createPackage: builder.mutation({
      query: (data: CreatePackageInput) => ({
        url: "/package/create-package",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Package", id: "LIST" }],
    }),

    // List (admin)
    getAllPackages: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        isActive = "",
        isPopular = "",
        sortBy = "displayOrder",
        sortOrder = "ASC",
      }: PackageListParams = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (isActive !== "" && isActive !== undefined)
          params.append("isActive", String(isActive));
        if (isPopular !== "" && isPopular !== undefined)
          params.append("isPopular", String(isPopular));
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        return {
          url: `/package/get-packages?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({
                type: "Package" as const,
                id,
              })),
              { type: "Package", id: "LIST" },
            ]
          : [{ type: "Package", id: "LIST" }],
    }),

    // Public list (landing page)
    getPublicPackages: builder.query({
      query: () => ({
        url: "/package/public/packages",
        method: "GET",
      }),
      providesTags: [{ type: "Package", id: "PUBLIC" }],
    }),

    // Single
    getPackageById: builder.query({
      query: (id: string | number) => ({
        url: `/package/get-package/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Package", id }],
    }),

    getPackageBySlug: builder.query({
      query: (slug: string) => ({
        url: `/package/public/packages/slug/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [
        { type: "Package", id: `SLUG-${slug}` },
      ],
    }),

    // Update
    updatePackage: builder.mutation({
      query: ({ id, ...data }: UpdatePackageInput) => ({
        url: `/package/update-package/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Package", id },
        { type: "Package", id: "LIST" },
        { type: "Package", id: "PUBLIC" },
      ],
    }),

    // Delete
    deletePackage: builder.mutation({
      query: (id: string | number) => ({
        url: `/package/delete-package/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Package", id: "LIST" },
        { type: "Package", id: "PUBLIC" },
      ],
    }),

    // Toggle status
    togglePackageStatus: builder.mutation({
      query: ({
        id,
        isActive,
      }: {
        id: string | number;
        isActive?: boolean;
      }) => ({
        url: `/package/toggle-package-status/${id}`,
        method: "PUT",
        body: isActive !== undefined ? { isActive } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Package", id },
        { type: "Package", id: "LIST" },
        { type: "Package", id: "PUBLIC" },
      ],
    }),

    // Reorder
    reorderPackages: builder.mutation({
      query: (items: { id: number; displayOrder: number }[]) => ({
        url: "/package/reorder-packages",
        method: "PUT",
        body: { items },
      }),
      invalidatesTags: [{ type: "Package", id: "LIST" }],
    }),

    // Stats
    getPackageStats: builder.query({
      query: () => ({
        url: "/package/get-package-stats",
        method: "GET",
      }),
      providesTags: ["Package"],
    }),
  }),
});

export const {
  useCreatePackageMutation,
  useGetAllPackagesQuery,
  useGetPublicPackagesQuery,
  useGetPackageByIdQuery,
  useGetPackageBySlugQuery,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useTogglePackageStatusMutation,
  useReorderPackagesMutation,
  useGetPackageStatsQuery,
} = packageApi;