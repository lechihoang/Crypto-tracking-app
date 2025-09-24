'use client';

import React from 'react';
import { AlertTriangle, Loader } from 'lucide-react';

interface HoldingWithValue {
  id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  quantity: number;
  averageBuyPrice?: number;
  notes?: string;
  currentPrice: number;
  currentValue: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

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
  if (!isOpen || !holding) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Xóa coin khỏi danh mục?
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-center mb-6">
            Bạn có chắc muốn xóa <strong>{holding.coinName}</strong> khỏi danh mục đầu tư?
            Hành động này không thể hoàn tác.
          </p>

          {/* Holding Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Số lượng:</span>
              <span className="font-medium">{Number(holding.quantity).toFixed(8)} {holding.coinSymbol.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Giá trị hiện tại:</span>
              <span className="font-medium">{formatCurrency(Number(holding.currentValue))}</span>
            </div>
            {holding.profitLoss !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lãi/Lỗ:</span>
                <span className={`font-medium ${
                  Number(holding.profitLoss) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Number(holding.profitLoss))}
                </span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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