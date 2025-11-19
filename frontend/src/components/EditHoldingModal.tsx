'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { portfolioApi } from '@/lib/api';
import toast from 'react-hot-toast';

import { HoldingWithValue } from '@/types';

interface EditHoldingModalProps {
  isOpen: boolean;
  holding: HoldingWithValue | null;
  onClose: () => void;
  onSuccess: () => void;
  hasBenchmark?: boolean;
}

export default function EditHoldingModal({ isOpen, holding, onClose, onSuccess }: EditHoldingModalProps) {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (holding) {
      setQuantity(Number(holding.quantity).toString());
    }
  }, [holding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holding || !quantity) {
      toast.error('Vui lòng nhập số lượng');
      return;
    }

    setLoading(true);
    const coinName = holding.coinName;

    try {
      const updatePromise = (async () => {
        const result = await portfolioApi.updateHolding(holding._id, {
          quantity: parseFloat(quantity),
        });

        if (result.error) {
          throw new Error(result.error);
        }

        return result;
      })();

      toast.promise(
        updatePromise,
        {
          loading: 'Đang cập nhật...',
          success: `Đã cập nhật ${coinName}`,
          error: 'Không thể cập nhật coin',
        }
      );

      await updatePromise;

      onSuccess();
      handleClose();
    } catch {
      // Error already handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity('');
    onClose();
  };

  if (!isOpen || !holding) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-600/50 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600/50">
          <h3 className="text-lg font-semibold text-white">Sửa {holding.coinName}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Coin Info */}
          <div className="mb-6 p-4 bg-gray-700 border border-gray-600/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{holding.coinName}</p>
                <p className="text-sm text-gray-300">{holding.coinSymbol.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Giá hiện tại</p>
                <p className="font-semibold text-white">
                  ${Number(holding.currentPrice).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số lượng *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="any"
                min="0.00000001"
                placeholder="0.00000000"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !quantity}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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