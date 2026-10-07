// @/redux/api/file/fileApi.ts
import { apiSlice } from "@/redux/api/apiSlice";

export const fileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Upload image/thumbnail
    addThumbnail: builder.mutation({
      query: (data) => ({
        url: "/file/upload",
        method: "POST",
        body: data,
      }),
    }),

    // Upload document
    uploadDocument: builder.mutation({
      query: (data: FormData) => ({
        url: "/document/upload",
        method: "POST",
        body: data,
      }),
    }),

    // Get gallery
    getGallery: builder.query({
      query: (data: { search?: string }) => ({
        url: `/file/get-images-all?search=${data.search || ""}`,
      }),
    }),

    // Delete file
    deleteFile: builder.mutation({
      query: (key: string) => ({
        url: `/file/delete?key=${encodeURIComponent(key)}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useAddThumbnailMutation,
  useUploadDocumentMutation,
  useDeleteFileMutation,
  useGetGalleryQuery,
} = fileApi;