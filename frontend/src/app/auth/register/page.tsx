'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api';
import { SignUpSchema, SignUpFormData } from '@/lib/validations';
import { Mail, Lock, User, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    getValues
  } = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
    mode: 'onChange', // Validate on every change
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError('');

    try {
      const result = await authApi.signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

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
        <div className="max-w-lg w-full space-y-8">
          <div className="bg-gray-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-10 border border-gray-600/50 text-center">
            <div className="mx-auto h-16 w-16 bg-success-500/20 rounded-full flex items-center justify-center mb-4 border border-success-500/40">
              <CheckCircle className="h-8 w-8 text-success-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Đăng ký thành công!
            </h2>
            <p className="text-gray-100 mb-6">
              Chúng tôi đã gửi email xác nhận đến <strong className="text-primary-400">{getValues('email')}</strong>.
              Vui lòng kiểm tra email và nhấp vào liên kết để kích hoạt tài khoản.
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-all"
              >
                Đăng nhập ngay
              </Link>
              <Link
                href="/"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-600 rounded-lg text-sm font-medium text-gray-100 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-gray-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-10 border border-gray-600/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Tạo tài khoản
            </h2>
            <p className="text-gray-100">
              Tham gia Crypto Tracker để theo dõi danh mục của bạn
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
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-100 mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    {...register('fullName')}
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    onFocus={handleInputFocus}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-300 text-gray-50 bg-gray-800 ${
                      errors.fullName ? 'border-danger-500/40' : 'border-gray-600'
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-danger-400">{errors.fullName.message}</p>
                )}
              </div>

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
                    autoComplete="new-password"
                    onFocus={handleInputFocus}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-300 text-gray-50 bg-gray-800 ${
                      errors.password ? 'border-danger-500/40' : 'border-gray-600'
                    }`}
                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-300 hover:text-gray-100" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-300 hover:text-gray-100" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-400">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-100 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    onFocus={handleInputFocus}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-300 text-gray-50 bg-gray-800 ${
                      errors.confirmPassword ? 'border-danger-500/40' : 'border-gray-600'
                    }`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-300 hover:text-gray-100" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-300 hover:text-gray-100" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-danger-400">{errors.confirmPassword.message}</p>
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
                'Tạo tài khoản'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-100">Hoặc đăng ký với</span>
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

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-gray-100">Đã có tài khoản? </span>
              <Link
                href="/auth/login"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}