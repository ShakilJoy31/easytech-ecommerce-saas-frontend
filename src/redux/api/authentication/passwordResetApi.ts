// redux/api/authentication/passwordResetApi.ts

import { apiSlice } from '@/redux/api/apiSlice';

export interface SendPasswordResetOTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expiresIn: string;
  };
}

export interface VerifyPasswordResetOTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    verified: boolean;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const passwordResetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Step 1: Send OTP for password reset
    sendPasswordResetOTP: builder.mutation<
      SendPasswordResetOTPResponse,
      { email: string }
    >({
      query: (data) => ({
        url: '/auth/register/send-password-reset-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // Step 2: Verify OTP
    verifyPasswordResetOTP: builder.mutation<
      VerifyPasswordResetOTPResponse,
      { email: string; otp: string }
    >({
      query: (data) => ({
        url: '/auth/register/verify-password-reset-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // Step 3: Reset password
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      { email: string; newPassword: string; confirmPassword: string }
    >({
      query: (data) => ({
        url: '/auth/register/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useSendPasswordResetOTPMutation,
  useVerifyPasswordResetOTPMutation,
  useResetPasswordMutation,
} = passwordResetApi;