// redux/api/saas/productApi.ts
import { apiSlice } from "../apiSlice";

export interface Product {
  id: number;
  productCode: string;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  currency: string;
  images: string[];
  thumbnail: string | null;
  stock: number;
  sku: string | null;
  trackStock: boolean;
  categoryId: number | null;
  storeId: number;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  totalSold: number;
  totalViews: number;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;

  // Enriched
  category?: {
    id: number;
    title: string;
    slug: string;
  } | null;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  currency?: string;
  images?: string[];
  thumbnail?: string;
  stock?: number;
  sku?: string;
  trackStock?: boolean;
  categoryId?: number | null;
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: number | string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number | string;
  isActive?: string | boolean;
  isFeatured?: string | boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PublicProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  storeSlug?: string;
  isFeatured?: string | boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (data: CreateProductInput) => ({
        url: "/product/create-product",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Product", id: "LIST" },
        "Category",
      ],
    }),

    getAllProducts: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        categoryId = "",
        isActive = "",
        isFeatured = "",
        sortBy = "createdAt",
        sortOrder = "DESC",
      }: ProductListParams = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (categoryId) params.append("categoryId", String(categoryId));
        if (isActive !== "" && isActive !== undefined)
          params.append("isActive", String(isActive));
        if (isFeatured !== "" && isFeatured !== undefined)
          params.append("isFeatured", String(isFeatured));
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        return {
          url: `/product/get-products?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({
                type: "Product" as const,
                id,
              })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    getProductById: builder.query({
      query: (id: string | number) => ({
        url: `/product/get-product/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...data }: UpdateProductInput) => ({
        url: `/product/update-product/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    toggleProductStatus: builder.mutation({
      query: ({
        id,
        isActive,
      }: {
        id: number | string;
        isActive?: boolean;
      }) => ({
        url: `/product/toggle-product-status/${id}`,
        method: "PUT",
        body: isActive !== undefined ? { isActive } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    toggleProductFeatured: builder.mutation({
      query: (id: number | string) => ({
        url: `/product/toggle-product-featured/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id: number | string) => ({
        url: `/product/delete-product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    getProductStats: builder.query({
      query: () => ({
        url: "/product/get-product-stats",
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    getPublicProducts: builder.query({
  query: ({
    page = 1,
    limit = 12,
    search = "",
    categorySlug = "",
    storeSlug = "",
    isFeatured = "",
    sortBy = "createdAt",
    sortOrder = "DESC",
  }: PublicProductListParams = {}) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) params.append("search", search);
    if (categorySlug) params.append("categorySlug", categorySlug);
    if (storeSlug) params.append("storeSlug", storeSlug);
    if (isFeatured !== "" && isFeatured !== undefined)
      params.append("isFeatured", String(isFeatured));
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);

    return {
      url: `/product/public/products?${params.toString()}`,
      method: "GET",
    };
  },
  providesTags: (result) =>
    result?.data
      ? [
          ...result.data.map(({ id }: { id: number }) => ({
            type: "Product" as const,
            id,
          })),
          { type: "Product", id: "PUBLIC" },
        ]
      : [{ type: "Product", id: "PUBLIC" }],
}),

getPublicProductById: builder.query({
  query: (id: string | number) => ({
    url: `/product/public/product/${id}`,
    method: "GET",
  }),
  providesTags: (result, error, id) => [{ type: "Product", id }],
}),



  }),
});

export const {
  useCreateProductMutation,
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useToggleProductStatusMutation,
  useToggleProductFeaturedMutation,
  useDeleteProductMutation,
  useGetProductStatsQuery,
  useGetPublicProductsQuery,
  useGetPublicProductByIdQuery
} = productApi;