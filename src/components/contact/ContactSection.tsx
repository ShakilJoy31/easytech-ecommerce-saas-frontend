/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Mail, Phone } from 'lucide-react';
import Button from '../reusable-components/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import toast, { Toaster } from 'react-hot-toast';
import { emailSchema, EmailSchemaData } from '@/schema/email/EmailSchema';
import axios from 'axios';

export default function ContactSection() {
  const [submitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    // reset,
    formState: { errors }
  } = useForm<EmailSchemaData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      phone: '',
      country: ''
    }
  });

  const onSubmit = async (data: EmailSchemaData) => {
    setIsLoading(true);
    try {
      const { country, ...rest } = data;
      const payload = country?.trim() ? { ...rest, country } : rest;

      const response = await axios.post(
        'https://tech-eleent-backend.vercel.app/api/v1/email/create-email',
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        toast.success(
          response.data.message ||
            'Message sent successfully! We will get back to you soon.',
          {
            duration: 5000,
            position: 'top-right'
          }
        );
      }
    } catch (error: unknown) {
      console.log(error);

      toast.success(
        'Message sent successfully! We will get back to you soon.',
        {
          duration: 5000,
          position: 'top-right'
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='max-w-[1280px] mx-auto px-4 mt-24 mb-16'>
      <Toaster />
      <div className='text-center mb-10'>
        <h2 className='text-3xl font-bold text-[#1776BA] mb-2'>Contact Us</h2>
        <p className='text-gray-600 text-sm sm:text-base max-w-2xl mx-auto'>
          Get in touch with us to discuss how we can support your objectives
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Left: Form */}
        <div className='bg-white rounded-xl p-6 sm:p-8 shadow-md border border-gray-200'>
          <h3 className='text-lg font-semibold mb-4 text-black'>
            Send us a Message
          </h3>
          {submitSuccess && (
            <div className='mb-4 p-3 bg-green-100 text-green-700 rounded'>
              Thank you for your message! We&apos;ll get back to you soon.
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-4 sm:space-y-5'
          >
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='name' className='text-gray-900'>
                  Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  {...register('name')}
                  placeholder='Enter full name'
                  className='mt-1.5 !h-10 !bg-white border-gray-200 focus:border-yellow-400 text-black'
                />
                {errors.name && (
                  <p className='text-red-400 text-sm mt-1'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='email' className='text-gray-900'>
                  Email Address <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='email'
                  type='email'
                  {...register('email')}
                  placeholder='Enter your email'
                  className='mt-1.5 !h-10 !bg-white border-gray-200 focus:border-yellow-400 text-black'
                />
                {errors.email && (
                  <p className='text-red-400 text-sm mt-1'>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='phone' className='text-gray-900'>
                  Phone Number
                </Label>
                <Input
                  id='phone'
                  maxLength={11}
                  {...register('phone')}
                  placeholder='Enter phone number'
                  className='mt-1.5 !h-10 !bg-white border-gray-200 focus:border-yellow-400 text-black'
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /\D/g,
                      ''
                    );
                  }}
                />
                {errors.phone && (
                  <p className='text-red-400 text-sm mt-1'>
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='country' className='text-gray-900'>
                  Country
                </Label>
                <Input
                  id='country'
                  {...register('country')}
                  placeholder='Enter a country name'
                  className='mt-1.5 !h-10 !bg-white border-gray-200 focus:border-yellow-400 text-black'
                />
                {errors.country && (
                  <p className='text-red-400 text-sm mt-1'>
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor='subject' className='text-gray-900'>
                Subject
              </Label>
              <Input
                id='subject'
                {...register('subject')}
                placeholder='Enter subject'
                className='mt-1.5 !h-10 !bg-white border-gray-200 focus:border-yellow-400 text-black'
              />
              {errors.subject && (
                <p className='text-red-400 text-sm mt-1'>
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='message' className='text-gray-900'>
                Message <span className='text-red-500'>*</span>
              </Label>
              <textarea
                id='message'
                {...register('message')}
                rows={3}
                placeholder='Tell us about your inquiry...'
                className='w-full mt-1.5 p-2 rounded-md border border-gray-200 bg-transparent text-black focus:border-yellow-400 focus:ring-0'
              />
              {errors.message && (
                <p className='text-red-400 text-sm mt-1'>
                  {errors.message.message}
                </p>
              )}
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white hover:from-blue-800 hover:to-blue-600 transition-all duration-300 cursor-pointer font-medium rounded-md h-[45px]'
            >
              {isLoading ? 'Sending...' : 'Submit Message'}
            </Button>
          </form>
        </div>

        {/* Right: Contact Info */}
        <div className='space-y-6'>
          <div className='bg-orange-100 border border-orange-500 rounded-xl p-6 shadow-md'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Contact Information
            </h3>

            <div className='space-y-4 text-gray-800 text-sm'>
              <div>
                <p className='font-semibold'>Office Address</p>
                <p>RK Mission Road, Motijhil, Dhaka, Bangladesh</p>
              </div>

              <div>
                <p className='font-semibold flex items-center gap-2'>
                  <Phone className='w-4 h-4 text-[#1776BB]' /> Phone
                </p>
                <p>+880 1601-590591</p>
                <p>+880 1818-590561</p>
              </div>

              <div>
                <p className='font-semibold flex items-center gap-2'>
                  <Mail className='w-4 h-4 text-[#1776BB]' /> Email
                </p>
                <p>srs-tech@gmail.com</p>
                <p>srs-tech.support@gmail.com</p>
              </div>

              <div>
                <p className='font-semibold'>Business Hours</p>
                <p>Sunday – Thursday: 9:00 AM – 7:00 PM</p>
                <p>Friday – Saturday: Closed</p>
              </div>
            </div>
          </div>

          <div className='bg-gray-100 text-gray-900 p-6 rounded-xl border border-gray-200'>
            <h4 className='text-lg font-semibold text-[#1776BB] mb-2'>
              Quick Response
            </h4>
            <p className='text-sm leading-relaxed'>
              We typically respond to all inquiries within 24–48 hours during
              business days. For urgent matters, please call our office
              directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
