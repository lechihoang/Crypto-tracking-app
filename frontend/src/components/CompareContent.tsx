import React from 'react';
import { X, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { CryptoCurrency } from '@/types/crypto';

const formatPrice = (price: number) => {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatMarketCap = (marketCap: number) => {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
};

const formatSupply = (supply: number) => {
  if (supply >= 1e12) return `${(supply / 1e12).toFixed(2)}T`;
  if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
  if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
  return supply.toLocaleString();
};

const PercentageChange = ({ change }: { change: number }) => {
  const isPositive = change > 0;
  const isZero = Math.abs(change) < 0.01;
  
  const Icon = isZero ? null : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isZero ? 'text-gray-500' : isPositive ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      {Icon && <Icon size={16} />}
      <span>{isPositive ? '+' : ''}{Math.abs(change).toFixed(2)}%</span>
    </div>
  );
};

interface CompareContentProps {
  allCryptos: CryptoCurrency[];
  selectedCoins: (CryptoCurrency | null)[];
  loading: boolean;
  onSelectCoin: (coin: CryptoCurrency, index: number) => void;
  onRemoveCoin: (index: number) => void;
}

export default function CompareContent({
  allCryptos,
  selectedCoins,
  loading,
  onSelectCoin,
  onRemoveCoin
}: CompareContentProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  const availableCryptos = allCryptos.filter(crypto => 
    !selectedCoins.find(selected => selected?.id === crypto.id)
  );

  const renderDropdown = (index: number, placeholder: string) => {
    const selectedCoin = selectedCoins[index];
    
    return (
      <div className="relative group">
        <select
          value={selectedCoin?.id || ''}
          onChange={(e) => {
            const coinId = e.target.value;
            if (coinId) {
              const coin = allCryptos.find(c => c.id === parseInt(coinId));
              if (coin) {
                onSelectCoin(coin, index);
              }
            } else {
              onRemoveCoin(index);
            }
          }}
          className="w-full p-4 pr-12 border-2 border-gray-300 rounded-xl bg-gray-50 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none focus:bg-white appearance-none text-base font-medium text-gray-800 hover:border-gray-400 transition-all duration-200 cursor-pointer"
        >
          <option value="" className="text-gray-500">{placeholder}</option>
          {availableCryptos.map((crypto) => (
            <option key={crypto.id} value={crypto.id} className="text-gray-900 py-2">
              #{crypto.cmc_rank} - {crypto.name} ({crypto.symbol}) - ${crypto.quote.USD.price.toFixed(2)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none group-hover:text-blue-500 transition-colors duration-200" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 rounded-xl pointer-events-none transition-opacity duration-200"></div>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Selection Section */}
      <div className="bg-white p-8 rounded-xl shadow-xl mb-8 border border-gray-100">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚖️</span>
            </div>
            Chọn 2 đồng tiền để so sánh
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">Sử dụng danh sách kéo xuống bên dưới để chọn các đồng tiền cryptocurrency bạn muốn so sánh chi tiết</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Đồng tiền thứ nhất
            </label>
            {renderDropdown(0, "Chọn đồng tiền thứ nhất...")}
          </div>
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Đồng tiền thứ hai
            </label>
            {renderDropdown(1, "Chọn đồng tiền thứ hai...")}
          </div>
        </div>

        {/* Selected Coins Display */}
        {selectedCoins.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Đã chọn:</span>
              <button
                onClick={() => {
                  onRemoveCoin(0);
                  onRemoveCoin(1);
                }}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCoins.map((coin, index) => coin && (
                <div key={coin.id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium">{coin.name} ({coin.symbol})</span>
                  <button
                    onClick={() => onRemoveCoin(index)}
                    className="ml-2 hover:text-blue-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).length === 2 && (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">So sánh chi tiết</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chỉ số
                  </th>
                  {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).map((coin) => (
                    <th key={coin.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{coin.name}</span>
                        <span className="text-gray-500">({coin.symbol})</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Xếp hạng
                  </td>
                  {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).map((coin) => (
                    <td key={coin.id} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full">
                        #{coin.cmc_rank}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Giá hiện tại
                  </td>
                  {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).map((coin) => (
                    <td key={coin.id} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatPrice(coin.quote.USD.price)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Thay đổi 24h
                  </td>
                  {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).map((coin) => (
                    <td key={coin.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      <PercentageChange change={coin.quote.USD.percent_change_24h} />
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Thay đổi 7 ngày
                  </td>
                  {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).map((coin) => (
                    <td key={coin.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      <PercentageChange change={coin.quote.USD.percent_change_7d} />
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Vốn hóa thị trường
                  </td>
                  {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).map((coin) => (
                    <td key={coin.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMarketCap(coin.quote.USD.market_cap)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Khối lượng giao dịch (24h)
                  </td>
                  {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).map((coin) => (
                    <td key={coin.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMarketCap(coin.quote.USD.volume_24h)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Nguồn cung lưu hành
                  </td>
                  {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).map((coin) => (
                    <td key={coin.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatSupply(coin.circulating_supply)} {coin.symbol}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Tổng nguồn cung tối đa
                  </td>
                  {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).map((coin) => (
                    <td key={coin.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coin.max_supply ? `${formatSupply(coin.max_supply)} ${coin.symbol}` : 'Không giới hạn'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCoins.filter((coin): coin is CryptoCurrency => coin !== null).length < 2 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-xl border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Chưa chọn đủ đồng tiền
            </h3>
            <p className="text-gray-600 text-base leading-relaxed">
              Vui lòng chọn đủ 2 đồng tiền từ danh sách kéo xuống ở trên để bắt đầu so sánh
            </p>
          </div>
        </div>
      )}
    </main>
  );
}