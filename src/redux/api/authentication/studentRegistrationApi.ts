// redux/api/authentication/studentRegistrationApi.ts
import { apiSlice } from "../apiSlice";

export const studentRegistrationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        registerStudent: builder.mutation({
            query: (studentData: {
                fullName: string;
                nickName?: string;
                email: string;
                password: string;
                photo?: string;
                metadata?: {
                    registrationSource?: string;
                    deviceType?: string;
                    browserInfo?: string;
                    registeredAt?: string;
                };
            }) => ({
                url: "/students/register",
                method: "POST",
                body: studentData,
            }),
            invalidatesTags: ["RegisteredStudent"],
        }),

        //! The routes for the admin.
        getAllRegisteredStudents: builder.query({
            query: (params) => ({
                url: "/students/get-all",
                method: "GET",
                params,
            }),
            providesTags: ["RegisteredStudent"],
        }),

        // Get registration statistics
        getRegistrationStats: builder.query({
            query: () => ({
                url: "/students/get-stats",
                method: "GET",
            }),
            providesTags: ["RegisteredStudent"],
        }),

        // Get single registered student by ID
        getRegisteredStudentById: builder.query({
            query: (id: number) => ({
                url: `/students/get/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "RegisteredStudent", id }],
        }),

        getRegisteredStudentByIdForHimselfStudentVerification: builder.query({
            query: (id: number) => ({
                url: `/students/get-himself/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "RegisteredStudent", id }],
        }),

        // Approve registered student
        approveRegisteredStudent: builder.mutation({
            query: (id: number) => ({
                url: `/students/approve/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["RegisteredStudent", "Student"],
        }),

        // Reject registered student
        rejectRegisteredStudent: builder.mutation({
            query: ({ id, rejectionReason }: { id: number; rejectionReason: string }) => ({
                url: `/students/reject/${id}`,
                method: "PUT",
                body: { rejectionReason },
            }),
            invalidatesTags: ["RegisteredStudent"],
        }),

        // Delete registered student
        deleteRegisteredStudent: builder.mutation({
            query: (id: number) => ({
                url: `/students/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["RegisteredStudent"],
        }),


        updateRegisteredStudent: builder.mutation({
            query: ({ id, data }: {
                id: number; data: Partial<{
                    fullName: string;
                    nickName: string;
                    phoneNo: string;
                    photo: string;
                }>
            }) => ({
                url: `/students/update/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["RegisteredStudent"],
        }),
    }),
});

export const {
    useRegisterStudentMutation,
    useGetAllRegisteredStudentsQuery,
    useGetRegistrationStatsQuery,
    useGetRegisteredStudentByIdQuery,
    useGetRegisteredStudentByIdForHimselfStudentVerificationQuery,
    useApproveRegisteredStudentMutation,
    useRejectRegisteredStudentMutation,
    useDeleteRegisteredStudentMutation,
    useUpdateRegisteredStudentMutation,
} = studentRegistrationApi;