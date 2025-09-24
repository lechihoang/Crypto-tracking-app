'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import { portfolioApi } from '@/lib/api';
import { Plus, Wallet, BarChart3, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    holdings: [],
    totalProfitLoss: 0,
    coinsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchDashboardData = async () => {
    setStatsLoading(true);
    try {
      const result = await portfolioApi.getPortfolioValue();
      if (result.data) {
        const data = result.data as {
          totalValue: number;
          holdings: Array<{
            holding: any;
            currentPrice: number;
            currentValue: number;
            profitLoss?: number;
          }>;
        };

        const totalProfitLoss = data.holdings?.reduce((sum, h) => sum + (Number(h.profitLoss) || 0), 0) || 0;

        setPortfolioData({
          totalValue: Number(data.totalValue) || 0,
          holdings: data.holdings || [],
          totalProfitLoss,
          coinsCount: data.holdings?.length || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const dashboardStats = [
    {
      title: 'Tổng giá trị danh mục',
      value: formatCurrency(portfolioData.totalValue),
      change: '',
      changeType: 'neutral' as const,
      icon: Wallet,
    },
    {
      title: 'Lãi/Lỗ tổng',
      value: formatCurrency(portfolioData.totalProfitLoss),
      change: portfolioData.totalValue > 0 ? formatPercentage((portfolioData.totalProfitLoss / (portfolioData.totalValue - portfolioData.totalProfitLoss)) * 100) : '',
      changeType: portfolioData.totalProfitLoss >= 0 ? 'positive' as const : 'negative' as const,
      icon: BarChart3,
    },
    {
      title: 'Số đồng coin trong danh mục',
      value: portfolioData.coinsCount.toString(),
      change: '',
      changeType: 'neutral' as const,
      icon: BarChart3,
    },
    {
      title: 'Cảnh báo đang hoạt động',
      value: '0',
      change: '',
      changeType: 'neutral' as const,
      icon: AlertCircle,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, {user?.full_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 text-lg">
            Quản lý danh mục đầu tư crypto của bạn một cách dễ dàng
          </p>
        </div>

        <DashboardStats stats={dashboardStats} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Portfolio Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Danh mục đầu tư</h3>
              <Link
                href="/portfolio"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Xem chi tiết
              </Link>
            </div>
            <div className="text-center py-8">
              {portfolioData.coinsCount === 0 ? (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có đồng coin nào trong danh mục
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Thêm đồng coin đầu tiên để bắt đầu theo dõi danh mục đầu tư của bạn
                  </p>
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Quản lý danh mục
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Danh mục đầu tư của bạn
                  </h4>
                  <p className="text-gray-600 mb-2">
                    {portfolioData.coinsCount} đồng coin • {formatCurrency(portfolioData.totalValue)}
                  </p>
                  <p className={`text-sm font-medium mb-4 ${
                    portfolioData.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {portfolioData.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalProfitLoss)}
                  </p>
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Xem chi tiết
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Price Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cảnh báo giá</h3>
            <Link
              href="/alerts"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Quản lý cảnh báo
            </Link>
          </div>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có cảnh báo nào
            </h4>
            <p className="text-gray-600 mb-4">
              Thiết lập cảnh báo giá để không bỏ lỡ cơ hội đầu tư
            </p>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo cảnh báo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}