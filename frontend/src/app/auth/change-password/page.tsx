'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api';
import { ChangePasswordSchema, ChangePasswordFormData } from '@/lib/validations';
import { Lock, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true);

    try {
      const changePasswordPromise = (async () => {
        const result = await authApi.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });

        if (result.error) {
          throw new Error(result.error);
        }

        reset();
        setTimeout(() => {
          router.push('/settings');
        }, 1500);
        return result;
      })();

      toast.promise(
        changePasswordPromise,
        {
          loading: 'Đang đổi mật khẩu...',
          success: 'Đã đổi mật khẩu thành công!',
          error: (err) => err.message || 'Không thể đổi mật khẩu',
        }
      );

      await changePasswordPromise;
    } catch {
      // Error already handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    clearErrors();
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-gray-800 rounded-xl shadow-card border border-gray-600/50 backdrop-blur-sm p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Đổi mật khẩu
            </h2>
            <p className="text-gray-100">
              Cập nhật mật khẩu để bảo mật tài khoản tốt hơn
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-100 mb-2">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    {...register('currentPassword')}
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    onFocus={handleInputFocus}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-300 text-gray-50 bg-gray-800 ${
                      errors.currentPassword ? 'border-danger-500/40' : 'border-gray-600'
                    }`}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-300 hover:text-gray-100" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-300 hover:text-gray-100" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-danger-400">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-100 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    {...register('newPassword')}
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    onFocus={handleInputFocus}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-300 text-gray-50 bg-gray-800 ${
                      errors.newPassword ? 'border-danger-500/40' : 'border-gray-600'
                    }`}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-300 hover:text-gray-100" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-300 hover:text-gray-100" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-danger-400">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-100 mb-2">
                  Xác nhận mật khẩu mới
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
                    placeholder="Nhập lại mật khẩu mới"
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin text-primary-500" />
              ) : (
                'Đổi mật khẩu'
              )}
            </button>

            {/* Back to Settings */}
            <div className="text-center text-sm">
              <span className="text-gray-100">Không muốn đổi? </span>
              <button
                type="button"
                onClick={() => router.push('/settings')}
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Quay lại cài đặt
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="bg-primary-500/20 border border-primary-500/40 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-primary-400 mb-3">
            Mẹo bảo mật
          </h4>
          <ul className="text-sm text-gray-100 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">•</span>
              <span>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">•</span>
              <span>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">•</span>
              <span>Không sử dụng lại mật khẩu từ các tài khoản khác</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">•</span>
              <span>Thay đổi mật khẩu định kỳ để tăng cường bảo mật</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
