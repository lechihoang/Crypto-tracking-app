'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { portfolioApi } from '@/lib/api';

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

interface EditHoldingModalProps {
  isOpen: boolean;
  holding: HoldingWithValue | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditHoldingModal({ isOpen, holding, onClose, onSuccess }: EditHoldingModalProps) {
  const [quantity, setQuantity] = useState('');
  const [averageBuyPrice, setAverageBuyPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (holding) {
      setQuantity(Number(holding.quantity).toString());
      setAverageBuyPrice(holding.averageBuyPrice ? Number(holding.averageBuyPrice).toString() : '');
      setNotes(holding.notes || '');
    }
  }, [holding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holding || !quantity) {
      setError('Vui lòng nhập số lượng');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await portfolioApi.updateHolding(holding.id, {
        quantity: parseFloat(quantity),
        averageBuyPrice: averageBuyPrice ? parseFloat(averageBuyPrice) : undefined,
        notes: notes || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        // Create a snapshot after updating holding
        try {
          await portfolioApi.createSnapshot();
        } catch (error) {
          console.log('Failed to create snapshot:', error);
          // Don't show error to user, just log it
        }

        onSuccess();
        handleClose();
      }
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity('');
    setAverageBuyPrice('');
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen || !holding) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sửa {holding.coinName}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Coin Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{holding.coinName}</p>
                <p className="text-sm text-gray-600">{holding.coinSymbol.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Giá hiện tại</p>
                <p className="font-semibold text-gray-900">
                  ${Number(holding.currentPrice).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="any"
                min="0.00000001"
                placeholder="0.00000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Average Buy Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá mua trung bình (USD) - Tùy chọn
              </label>
              <input
                type="number"
                value={averageBuyPrice}
                onChange={(e) => setAverageBuyPrice(e.target.value)}
                step="any"
                min="0"
                placeholder="Tùy chọn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú - Tùy chọn
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Thêm ghi chú về holding này..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !quantity}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Cập nhật'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}