'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { SignInSchema, SignInFormData } from '@/lib/validations';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors
  } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn(data.email, data.password);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        // Đăng nhập thành công, redirect đến dashboard
        const redirectTo = new URLSearchParams(window.location.search).get('redirectTo');
        window.location.href = redirectTo || '/dashboard';
      } else {
        setError('Đăng nhập thất bại');
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

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-gray-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-10 border border-gray-600/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Đăng nhập
            </h2>
            <p className="text-gray-100">
              Chào mừng bạn trở lại với Crypto Tracker
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {error && (
              <div className="bg-danger-500/20 border border-danger-500/40 text-danger-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
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
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-800 text-gray-50 placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                      errors.email ? 'border-danger-500/40' : 'border-gray-600'
                    }`}
                    placeholder="Nhập email của bạn"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-danger-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-100 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    onFocus={handleInputFocus}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-gray-800 text-gray-50 placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                      errors.password ? 'border-danger-500/40' : 'border-gray-600'
                    }`}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-300 hover:text-gray-100 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-300 hover:text-gray-100 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading || isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Đăng nhập'
              )}
            </button>

            {/* Links */}
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Quên mật khẩu?
              </Link>
              <Link
                href="/auth/register"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Tạo tài khoản mới
              </Link>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-100">Hoặc đăng nhập với</span>
              </div>
            </div>

            {/* Social Login Button */}
            <button
              type="button"
              onClick={() => authApi.loginWithGoogle()}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-sm font-medium text-gray-100 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
              Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}