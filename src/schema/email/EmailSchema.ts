import { z } from 'zod';

export const emailSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  phone: z.string().min(1, 'Phone number is required'),
  country: z.string().optional()
});

export type EmailSchemaData = z.infer<typeof emailSchema>;

export interface EmailType {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string;
  country?: string;
}
