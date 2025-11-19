'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api';
import { ForgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations';
import { Mail, Loader, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError('');

    try {
      const result = await authApi.resetPassword({ email: data.email });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    setError('');
    clearErrors();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-gray-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-gray-600/50 p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-success-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Email đã được gửi!
            </h2>
            <p className="text-gray-100 mb-6">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{getValues('email')}</strong>.
              Vui lòng kiểm tra email và làm theo hướng dẫn.
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors"
              >
                Quay về đăng nhập
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-600 rounded-lg text-sm font-medium text-gray-100 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Gửi lại email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-gray-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-gray-600/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Quên mật khẩu?
            </h2>
            <p className="text-gray-100">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {error && (
              <div className="bg-danger-500/20 border border-danger-500/40 text-danger-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-100 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  onFocus={handleInputFocus}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-300 text-gray-50 bg-gray-800 ${
                    errors.email ? 'border-danger-500/40' : 'border-gray-600'
                  }`}
                  placeholder="Nhập email của bạn"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger-400">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin text-primary-500" />
              ) : (
                'Gửi liên kết đặt lại'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center text-sm">
              <span className="text-gray-100">Nhớ mật khẩu? </span>
              <Link
                href="/auth/login"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}