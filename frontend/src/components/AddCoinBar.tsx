'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader, X } from 'lucide-react';
import { portfolioApi, clientApi } from '@/lib/api';
import toast from 'react-hot-toast';

import { Coin } from '@/types';

interface AddCoinBarProps {
  onSuccess: () => void;
}

export default function AddCoinBar({ onSuccess }: AddCoinBarProps) {
  const [showForm, setShowForm] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [coinsLoading, setCoinsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Load top coins when form is shown
  useEffect(() => {
    if (showForm && coins.length === 0) {
      loadTopCoins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  // Filter coins based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCoins(coins.slice(0, 10)); // Show top 10 by default
    } else {
      const filtered = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCoins(filtered.slice(0, 10));
    }
  }, [searchTerm, coins]);

  const loadTopCoins = async () => {
    setCoinsLoading(true);
    try {
      const result = await clientApi.getLatestListings(100);
      if (result.data) {
        const coinData = result.data
          .filter(coin => coin.image)
          .map(coin => ({
            id: coin.slug || String(coin.id),
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image!,
          }));
        setCoins(coinData);
        setFilteredCoins(coinData.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to load coins:', error);
    } finally {
      setCoinsLoading(false);
    }
  };

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setSearchTerm(coin.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !quantity) {
      toast.error('Vui lòng chọn coin và nhập số lượng');
      return;
    }

    setLoading(true);
    const coinName = selectedCoin.name;

    try {
      const addPromise = (async () => {
        const result = await portfolioApi.addHolding({
          coinId: selectedCoin.id,
          coinSymbol: selectedCoin.symbol,
          coinName: selectedCoin.name,
          coinImage: selectedCoin.image,
          quantity: parseFloat(quantity),
        });

        if (result.error) {
          throw new Error(result.error);
        }

        return result;
      })();

      toast.promise(
        addPromise,
        {
          loading: 'Đang thêm coin...',
          success: `Đã thêm ${coinName} vào danh mục`,
          error: 'Không thể thêm coin',
        }
      );

      await addPromise;

      // Reset form
      setSelectedCoin(null);
      setSearchTerm('');
      setQuantity('');
      setShowForm(false);
      onSuccess();
    } catch {
      // Error already handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedCoin(null);
    setSearchTerm('');
    setQuantity('');
    setError('');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="bg-gray-800 border border-gray-600/50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all p-4 mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-600/50 rounded-lg text-gray-300 hover:border-primary-500/50 hover:text-primary-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm coin vào danh mục đầu tư
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-600/50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Thêm coin mới</h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-danger-500/20 border border-danger-500/40 text-danger-400 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Coin Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chọn coin
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (e.target.value !== selectedCoin?.name) {
                    setSelectedCoin(null);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Tìm kiếm coin..."
                className="w-full px-3 py-2 border border-gray-700/40 bg-dark-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-8 placeholder-gray-400"
              />
              <Search className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />

              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-dark-700 border border-gray-700/40 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {coinsLoading ? (
                    <div className="p-3 text-center">
                      <Loader className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                    </div>
                  ) : filteredCoins.length > 0 ? (
                    filteredCoins.map((coin) => (
                      <button
                        key={coin.id}
                        type="button"
                        onClick={() => handleCoinSelect(coin)}
                        className="w-full px-3 py-2 text-left hover:bg-dark-600 border-b border-gray-700/30 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{coin.name}</span>
                          <span className="text-sm text-gray-400">{coin.symbol.toUpperCase()}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-400 text-sm">
                      Không tìm thấy coin nào
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Số lượng
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="any"
              min="0.00000001"
              placeholder="0.00000000"
              className="w-full px-3 py-2 border border-gray-700/40 bg-dark-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !selectedCoin || !quantity}
              className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-0"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}