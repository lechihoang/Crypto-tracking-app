'use client';

import { useState, useEffect, useRef } from 'react';
import { alertsApi } from '@/lib/api';
import { formatNumber } from '@/utils/formatPrice';
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';
import { PriceAlert } from '@/types/alerts';
import Image from 'next/image';

interface EditAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: PriceAlert;
  onSuccess: () => void;
}

export default function EditAlertModal({ isOpen, onClose, alert, onSuccess }: EditAlertModalProps) {
  const [condition, setCondition] = useState<'above' | 'below'>(alert.condition);
  const [targetPrice, setTargetPrice] = useState(alert.targetPrice.toString());
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const conditions = [
    { value: 'above' as const, label: 'Khi giá vượt lên' },
    { value: 'below' as const, label: 'Khi giá giảm xuống' }
  ];

  // Reset form when alert changes
  useEffect(() => {
    if (isOpen) {
      setCondition(alert.condition);
      setTargetPrice(alert.targetPrice.toString());
    }
  }, [isOpen, alert]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConditionSelect = (value: 'above' | 'below') => {
    setCondition(value);
    setIsDropdownOpen(false);
  };

  const getSelectedLabel = () => {
    return conditions.find(c => c.value === condition)?.label || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate price
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        condition,
        targetPrice: price
      };

      const updatePromise = alertsApi.updateAlert(alert._id, updateData);

      toast.promise(
        updatePromise,
        {
          loading: 'Đang cập nhật cảnh báo...',
          success: `Đã cập nhật cảnh báo cho ${alert.coinName || alert.coinId}`,
          error: 'Không thể cập nhật cảnh báo',
        }
      );

      await updatePromise;

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch {
      // Error already handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-card border border-gray-600/50 max-w-md w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-600/30">
          <h3 className="text-lg font-semibold text-white">Chỉnh sửa cảnh báo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Coin Info (Read-only) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100 mb-2">
              Đồng coin
            </label>
            <div className="p-3 border border-gray-600 rounded-lg bg-gray-700/50 flex items-center gap-3">
              {alert.coinImage ? (
                <Image
                  src={alert.coinImage}
                  alt={alert.coinName || alert.coinId}
                  width={32}
                  height={32}
                  className="rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(alert.coinSymbol || alert.coinId).toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium text-white">{alert.coinName || alert.coinId}</div>
                <div className="text-sm text-gray-400 uppercase">{alert.coinSymbol || alert.coinId}</div>
              </div>
            </div>
          </div>

          {/* Condition Selection - Custom Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100 mb-2">
              Điều kiện
            </label>
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-3 pr-10 border border-gray-600 rounded-lg bg-gray-800 text-gray-50 text-left hover:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
              >
                {getSelectedLabel()}
                <ChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-dark-600 border border-gray-700 rounded-lg shadow-card">
                  {conditions.map((cond) => (
                    <div
                      key={cond.value}
                      onClick={() => handleConditionSelect(cond.value)}
                      className={`px-4 py-3 cursor-pointer transition-all duration-300 ${
                        condition === cond.value
                          ? 'bg-primary-500/20 text-primary-400 font-medium'
                          : 'text-gray-200 hover:bg-dark-700'
                      }`}
                    >
                      {cond.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-100 mb-2">
              Giá mục tiêu (USD)
            </label>
            <input
              type="number"
              step="0.000001"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Nhập giá mục tiêu"
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-50 placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
              required
            />
            <p className="text-sm text-gray-400 mt-2">
              Giá hiện tại: <span className="font-semibold text-primary-400">${formatNumber(alert.targetPrice)}</span>
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-700 rounded-lg text-gray-300 bg-dark-700 hover:bg-dark-600 hover:border-gray-600 focus:ring-2 focus:ring-primary-500 transition-all duration-300 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
