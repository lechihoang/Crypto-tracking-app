'use client';

import { useState } from 'react';
import { alertsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinId: number;
  coinSymbol: string;
  coinName: string;
  currentPrice: number;
}

export default function PriceAlertModal({
  isOpen,
  onClose,
  coinId,
  coinSymbol,
  coinName,
  currentPrice
}: PriceAlertModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const price = parseFloat(targetPrice);
      if (isNaN(price) || price <= 0) {
        setError('Vui lòng nhập giá hợp lệ');
        return;
      }

      const response = await alertsApi.createAlert({
        coinId,
        coinSymbol,
        coinName,
        condition,
        targetPrice: price
      });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Tạo cảnh báo thành công! Bạn sẽ nhận email khi giá đạt mức đã đặt.');
        setTimeout(() => {
          onClose();
          setSuccess('');
          setTargetPrice('');
        }, 2000);
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi tạo cảnh báo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Tạo cảnh báo giá
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {coinName} ({coinSymbol.toUpperCase()})
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Giá hiện tại: <span className="font-medium">${currentPrice.toLocaleString()}</span>
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Điều kiện cảnh báo
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="above">Khi giá vượt lên</option>
              <option value="below">Khi giá giảm xuống</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giá mục tiêu (USD)
            </label>
            <input
              type="number"
              step="0.000001"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Nhập giá mục tiêu"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-primary-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo...' : 'Tạo cảnh báo'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Cảnh báo sẽ được gửi đến email của bạn và tự động tắt sau khi kích hoạt.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}