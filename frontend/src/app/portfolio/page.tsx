'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { portfolioApi } from '@/lib/api';
import Header from '@/components/Header';
import AddCoinBar from '@/components/AddCoinBar';
import PortfolioChart from '@/components/PortfolioChart';
import EditHoldingModal from '@/components/EditHoldingModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { Loader, TrendingUp, TrendingDown, PieChart, Calendar, Edit2, Trash2, MoreHorizontal } from 'lucide-react';

interface PortfolioHolding {
  id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  quantity: number;
  averageBuyPrice?: number;
  notes?: string;
  createdAt: string;
}

interface HoldingWithValue extends PortfolioHolding {
  currentPrice: number;
  currentValue: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

export default function PortfolioPage() {
  const { user, loading: authLoading } = useAuth();
  const [holdings, setHoldings] = useState<HoldingWithValue[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingHolding, setEditingHolding] = useState<HoldingWithValue | null>(null);
  const [deletingHolding, setDeletingHolding] = useState<HoldingWithValue | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      fetchPortfolioData();
    }
  }, [user]);

  // Auto-refresh portfolio data every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchPortfolioData(false); // Don't show loading for auto-refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchPortfolioData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError('');

    try {
      const result = await portfolioApi.getPortfolioValue();

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        const portfolioData = result.data as {
          totalValue: number;
          holdings: Array<{
            holding: PortfolioHolding;
            currentPrice: number;
            currentValue: number;
            profitLoss?: number;
            profitLossPercentage?: number;
          }>;
        };
        setTotalValue(portfolioData.totalValue || 0);
        setHoldings(portfolioData.holdings?.map((h) => ({
          ...h.holding,
          currentPrice: h.currentPrice,
          currentValue: h.currentValue,
          profitLoss: h.profitLoss,
          profitLossPercentage: h.profitLossPercentage,
        })) || []);
      }
      setLastUpdated(new Date());
    } catch {
      setError('Đã có lỗi xảy ra khi tải dữ liệu portfolio');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage?: number) => {
    if (percentage === undefined) return 'N/A';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const handleDeleteHolding = async () => {
    if (!deletingHolding) return;

    setDeleteLoading(true);
    try {
      const result = await portfolioApi.removeHolding(deletingHolding.id);
      if (result.error) {
        setError(result.error);
      } else {
        // Create a snapshot after deleting holding
        try {
          await portfolioApi.createSnapshot();
        } catch (error) {
          console.log('Failed to create snapshot:', error);
          // Don't show error to user, just log it
        }

        await fetchPortfolioData();
        setDeletingHolding(null);
      }
    } catch {
      setError('Đã có lỗi xảy ra khi xóa coin');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Vui lòng đăng nhập để xem portfolio</p>
        </div>
      </div>
    );
  }

  const totalProfitLoss = holdings.reduce((sum, holding) => sum + (Number(holding.profitLoss) || 0), 0);
  const totalInvestment = Number(totalValue) - totalProfitLoss;
  const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh mục đầu tư</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600">Theo dõi danh mục đầu tư crypto của bạn</p>
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  • Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add Coin Bar */}
        <AddCoinBar onSuccess={fetchPortfolioData} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng giá trị</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                totalProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Lãi/Lỗ</p>
                <p className={`text-2xl font-bold ${
                  totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(totalProfitLoss)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Lãi/Lỗ %</p>
                <p className={`text-2xl font-bold ${
                  totalProfitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(totalProfitLossPercentage)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="mb-8">
          <PortfolioChart />
        </div>


        {/* Holdings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách coin</h3>
          </div>

          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Danh mục trống
              </h4>
              <p className="text-gray-600 mb-4">
                Thêm các đồng coin đã mua để bắt đầu theo dõi danh mục đầu tư
              </p>
              <p className="text-sm text-gray-500">
                Sử dụng form ở trên để thêm coin đầu tiên
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá/coin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng giá trị
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {holding.coinName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {holding.coinSymbol.toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(holding.quantity).toFixed(8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(Number(holding.currentPrice))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(Number(holding.currentValue))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingHolding(holding)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingHolding(holding)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Holding Modal */}
        <EditHoldingModal
          isOpen={!!editingHolding}
          holding={editingHolding}
          onClose={() => setEditingHolding(null)}
          onSuccess={fetchPortfolioData}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={!!deletingHolding}
          holding={deletingHolding}
          loading={deleteLoading}
          onConfirm={handleDeleteHolding}
          onCancel={() => setDeletingHolding(null)}
        />
      </main>
    </div>
  );
}