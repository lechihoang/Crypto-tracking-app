'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { portfolioApi } from '@/lib/api';
import { Loader, TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioSnapshot {
  id: string;
  totalValue: number;
  createdAt: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
}

export default function PortfolioChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchPortfolioHistory();
  }, [timeRange]);

  const fetchPortfolioHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await portfolioApi.getPortfolioValueHistory(timeRange);

      if (result.error) {
        // Check if it's a rate limit error
        if (result.error.includes('Too Many Requests') || result.error.includes('429')) {
          setError('API bị giới hạn tốc độ. Vui lòng đợi 1-2 phút và thử lại.');
        } else {
          setError(result.error);
        }
      } else if (result.data) {
        const history = result.data as Array<{ timestamp: number; totalValue: number; date: string }>;
        const processedData = history.map((dataPoint) => ({
          date: dataPoint.date,
          value: Number(dataPoint.totalValue),
          formattedDate: new Date(dataPoint.timestamp).toLocaleDateString('vi-VN'),
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setChartData(processedData);
        setError(''); // Clear any previous errors
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('API bị giới hạn tốc độ. Vui lòng đợi 1-2 phút và thử lại.');
      } else {
        setError('Không thể tải lịch sử giá trị portfolio');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{payload[0].payload.formattedDate}</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getChangeInfo = () => {
    if (chartData.length < 2) return { change: 0, percentage: 0, isPositive: true };

    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    const change = lastValue - firstValue;
    const percentage = firstValue > 0 ? (change / firstValue) * 100 : 0;

    return {
      change,
      percentage,
      isPositive: change >= 0,
    };
  };

  const changeInfo = getChangeInfo();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPortfolioHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tổng giá trị đầu tư theo thời gian</h3>
          {chartData.length >= 2 && (
            <div className="flex items-center gap-2 mt-1">
              {changeInfo.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                changeInfo.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeInfo.isPositive ? '+' : ''}{formatCurrency(changeInfo.change)}
                ({changeInfo.isPositive ? '+' : ''}{changeInfo.percentage.toFixed(2)}%)
              </span>
              <span className="text-sm text-gray-500">
                trong {timeRange} ngày qua
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Chưa có dữ liệu lịch sử portfolio
          </p>
          <p className="text-sm text-gray-500">
            Dữ liệu sẽ được thu thập khi bạn thêm coin vào danh mục
          </p>
        </div>
      ) : chartData.length === 1 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {formatCurrency(chartData[0].value)}
          </p>
          <p className="text-gray-600 mb-4">
            Giá trị portfolio hiện tại
          </p>
          <p className="text-sm text-gray-500">
            Biểu đồ sẽ hiển thị khi có nhiều điểm dữ liệu theo thời gian
          </p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="formattedDate"
                stroke="#64748b"
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <YAxis
                domain={(() => {
                  if (chartData.length === 0) return ['auto', 'auto'];
                  const values = chartData.map(d => d.value);
                  const minValue = Math.min(...values);
                  const maxValue = Math.max(...values);
                  const padding = (maxValue - minValue) * 0.05; // 5% padding
                  return [
                    Math.max(0, minValue - padding), // Don't go below 0
                    maxValue + padding
                  ];
                })()}
                stroke="#64748b"
                fontSize={12}
                tick={{ fill: '#64748b' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}