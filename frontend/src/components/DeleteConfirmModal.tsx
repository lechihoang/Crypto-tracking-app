'use client';

import React from 'react';
import { AlertTriangle, Loader, X } from 'lucide-react';
import { HoldingWithValue } from '@/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  holding: HoldingWithValue | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  holding,
  loading,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !holding) return null;

  const formatCurrency = (amount: number, showFullDecimals = false) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: showFullDecimals ? 2 : 2,
      maximumFractionDigits: showFullDecimals ? 8 : 2,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-600/50 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600/50">
          <h3 className="text-lg font-semibold text-gray-100">Xóa {holding.coinName}</h3>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex items-center justify-center w-12 h-12 bg-danger-500/20 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-danger-500" />
          </div>

          {/* Description */}
          <p className="text-gray-300 text-center mb-6">
            Bạn có chắc muốn xóa <strong className="text-gray-100">{holding.coinName}</strong> khỏi danh mục đầu tư?
            Hành động này không thể hoàn tác.
          </p>

          {/* Holding Info */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Số lượng:</span>
              <span className="font-medium text-gray-200">
                {Number(holding.quantity).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 8
                })} {holding.coinSymbol.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Giá trị hiện tại:</span>
              <span className="font-medium text-gray-200">{formatCurrency(Number(holding.currentValue), true)}</span>
            </div>
            {holding.profitLoss !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Lãi/Lỗ:</span>
                <span className={`font-medium ${
                  Number(holding.profitLoss) >= 0 ? 'text-success-500' : 'text-danger-500'
                }`}>
                  {Number(holding.profitLoss) >= 0 ? '+' : ''}{formatCurrency(Math.abs(Number(holding.profitLoss)), true)}
                </span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:border-gray-600 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Xóa'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}