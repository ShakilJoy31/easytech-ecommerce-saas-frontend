// redux/api/saas/categoryApi.ts
import { apiSlice } from "../apiSlice";

export interface Category {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  storeId: number;
  userId: number | null;
  displayOrder: number;
  isActive: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
  productCount?: number;
}

export interface CategoryOption {
  id: number;
  title: string;
  slug: string;
}

export interface CreateCategoryInput {
  title: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: number | string;
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string | boolean;
}

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (data: CreateCategoryInput) => ({
        url: "/category/create-category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: "OPTIONS" },
      ],
    }),

    getAllCategories: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        isActive = "",
      }: CategoryListParams = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (isActive !== "" && isActive !== undefined)
          params.append("isActive", String(isActive));

        return {
          url: `/category/get-categories?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({
                type: "Category" as const,
                id,
              })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),

    getCategoryOptions: builder.query<{ data: CategoryOption[] }, void>({
      query: () => ({
        url: "/category/get-category-options",
        method: "GET",
      }),
      providesTags: [{ type: "Category", id: "OPTIONS" }],
    }),

    getCategoryById: builder.query({
      query: (id: string | number) => ({
        url: `/category/get-category/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...data }: UpdateCategoryInput) => ({
        url: `/category/update-category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Category", id: "OPTIONS" },
      ],
    }),

    toggleCategoryStatus: builder.mutation({
      query: ({
        id,
        isActive,
      }: {
        id: number | string;
        isActive?: boolean;
      }) => ({
        url: `/category/toggle-category-status/${id}`,
        method: "PUT",
        body: isActive !== undefined ? { isActive } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Category", id: "OPTIONS" },
      ],
    }),

    deleteCategory: builder.mutation({
      query: (id: number | string) => ({
        url: `/category/delete-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: "OPTIONS" },
      ],
    }),

    getCategoryStats: builder.query({
      query: () => ({
        url: "/category/get-category-stats",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetCategoryOptionsQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useToggleCategoryStatusMutation,
  useDeleteCategoryMutation,
  useGetCategoryStatsQuery,
} = categoryApi;