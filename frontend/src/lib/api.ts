import axios from 'axios';

// Backend API response interfaces
interface BackendCoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank?: number;
}

interface BackendCoinDetailData {
  id: string;
  name: string;
  symbol: string;
  description?: { en?: string };
  image?: { large?: string };
  links?: {
    homepage?: string[];
    whitepaper?: string[];
    twitter_screen_name?: string;
    subreddit_url?: string;
    official_forum_url?: string[];
    announcement_url?: string[];
    chat_url?: string[];
    blockchain_site?: string[];
    repos_url?: { github?: string[] };
  };
  market_data?: {
    current_price?: { usd?: number };
    price_change_percentage_24h?: number;
    market_cap?: { usd?: number };
  };
  market_cap_rank?: number;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const backendApi = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export const clientApi = {
  async getLatestListings(limit: number = 100) {
    const response = await backendApi.get(`/crypto/top?limit=${limit}`);
    if (response.status !== 200) throw new Error('Failed to fetch listings');

    // Transform backend response to match frontend expectations
    return {
      data: (response.data as BackendCoinData[]).map((coin, index) => ({
        id: index + 1, // Use index as numeric ID for compatibility
        name: coin.name,
        symbol: coin.symbol,
        slug: coin.id, // Store the string ID in slug field
        cmc_rank: coin.market_cap_rank || 1,
        num_market_pairs: 0,
        circulating_supply: 0,
        total_supply: 0,
        max_supply: 0,
        last_updated: new Date().toISOString(),
        date_added: new Date().toISOString(),
        tags: [],
        platform: null,
        quote: {
          USD: {
            price: coin.current_price,
            volume_24h: 0,
            volume_change_24h: 0,
            percent_change_1h: 0,
            percent_change_24h: coin.price_change_percentage_24h,
            percent_change_7d: 0,
            percent_change_30d: 0,
            market_cap: coin.market_cap,
            market_cap_dominance: 0,
            fully_diluted_market_cap: coin.market_cap,
            last_updated: new Date().toISOString(),
          }
        }
      }))
    };
  },

  async getCoinInfo(id: string) {
    const response = await backendApi.get(`/crypto/${id}`);
    if (response.status !== 200) throw new Error('Failed to fetch coin info');

    const coinData = response.data as BackendCoinDetailData;
    // Transform backend response to match frontend expectations
    return {
      data: {
        [id]: {
          id: parseInt(id) || 1,
          name: coinData.name,
          symbol: coinData.symbol,
          category: '',
          description: coinData.description?.en || '',
          slug: coinData.id,
          logo: coinData.image?.large || '',
          subreddit: '',
          notice: '',
          tags: [],
          tag_names: [],
          tag_groups: [],
          urls: {
            website: coinData.links?.homepage || [],
            technical_doc: coinData.links?.whitepaper || [],
            twitter: coinData.links?.twitter_screen_name ? [`https://twitter.com/${coinData.links.twitter_screen_name}`] : [],
            reddit: coinData.links?.subreddit_url ? [coinData.links.subreddit_url] : [],
            message_board: coinData.links?.official_forum_url || [],
            announcement: coinData.links?.announcement_url || [],
            chat: coinData.links?.chat_url || [],
            explorer: coinData.links?.blockchain_site || [],
            source_code: coinData.links?.repos_url?.github || [],
            facebook: [],
          },
          platform: null,
          date_added: new Date().toISOString(),
          twitter_username: coinData.links?.twitter_screen_name || '',
          is_hidden: 0,
          date_launched: new Date().toISOString(),
          contract_address: [],
          self_reported_circulating_supply: 0,
          self_reported_tags: null,
          self_reported_market_cap: 0,
        }
      }
    };
  },

  async getQuotes(ids: string) {
    const response = await backendApi.get(`/crypto/${ids}`);
    if (response.status !== 200) throw new Error('Failed to fetch quotes');

    const coinData = response.data as BackendCoinDetailData;
    // Transform backend response to match frontend expectations
    return {
      data: {
        [ids]: {
          id: parseInt(ids) || 1,
          name: coinData.name,
          symbol: coinData.symbol,
          slug: coinData.id,
          cmc_rank: coinData.market_cap_rank || 1,
          num_market_pairs: 0,
          circulating_supply: 0,
          total_supply: 0,
          max_supply: 0,
          last_updated: new Date().toISOString(),
          date_added: new Date().toISOString(),
          tags: [],
          platform: null,
          quote: {
            USD: {
              price: coinData.market_data?.current_price?.usd || 0,
              volume_24h: 0,
              volume_change_24h: 0,
              percent_change_1h: 0,
              percent_change_24h: coinData.market_data?.price_change_percentage_24h || 0,
              percent_change_7d: 0,
              percent_change_30d: 0,
              market_cap: coinData.market_data?.market_cap?.usd || 0,
              market_cap_dominance: 0,
              fully_diluted_market_cap: coinData.market_data?.market_cap?.usd || 0,
              last_updated: new Date().toISOString(),
            }
          }
        }
      }
    };
  },

  async getCoinPriceHistory(coinId: string, days: number = 7) {
    const response = await backendApi.get(`/crypto/${coinId}/history?days=${days}`);
    if (response.status !== 200) throw new Error('Failed to fetch price history');
    return response.data;
  },
};

// Auth API interfaces
interface SignInRequest {
  email: string;
  password: string;
}

interface SignUpRequest {
  email: string;
  password: string;
  fullName?: string;
}

interface ResetPasswordRequest {
  email: string;
}

interface UpdatePasswordRequest {
  password: string;
  accessToken: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface AuthResponse {
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  access_token?: string;
  message?: string;
  error?: string;
}

// Auth API client using backend
export const authApi = {
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      const response = await backendApi.post('/auth/signin', credentials);

      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        this.syncTokenToCookie(response.data.access_token);
        return response.data;
      }

      return { error: 'Đăng nhập thất bại' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Đăng nhập thất bại'
      };
    }
  },

  async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await backendApi.post('/auth/signup', {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
      });

      return {
        message: response.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Đăng ký thất bại'
      };
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await backendApi.post('/auth/reset-password', data);
      return { message: response.data.message || 'Email đặt lại mật khẩu đã được gửi!' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Gửi email đặt lại mật khẩu thất bại'
      };
    }
  },

  async updatePassword(data: UpdatePasswordRequest): Promise<AuthResponse> {
    try {
      const response = await backendApi.post('/auth/update-password', data);
      return { message: response.data.message || 'Mật khẩu đã được cập nhật thành công!' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Cập nhật mật khẩu thất bại'
      };
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.post('/auth/change-password', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { message: response.data.message || 'Đổi mật khẩu thành công!' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Đổi mật khẩu thất bại'
      };
    }
  },

  async getProfile(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        user: {
          id: response.data.id,
          email: response.data.email,
          full_name: response.data.user_metadata?.full_name,
        },
      };
    } catch (error: unknown) {
      this.signOut();
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Lấy thông tin người dùng thất bại'
      };
    }
  },

  signOut(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Remove cookie
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Helper to sync token to cookies for middleware
  syncTokenToCookie(token: string): void {
    if (typeof window !== 'undefined') {
      document.cookie = `auth_token=${token}; path=/; secure; samesite=strict`;
    }
  }
};

// Price Alerts API interfaces
interface PriceAlert {
  id: string;
  user_id: string;
  coin_id: number;
  coin_symbol: string;
  coin_name: string;
  condition: 'above' | 'below';
  target_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateAlertRequest {
  coinId: number;
  coinSymbol: string;
  coinName: string;
  condition: 'above' | 'below';
  targetPrice: number;
}

interface AlertsResponse {
  data?: PriceAlert[];
  error?: string;
  message?: string;
}

// Price Alerts API client
export const alertsApi = {
  async createAlert(alertData: CreateAlertRequest): Promise<AlertsResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.post('/alerts', alertData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return { data: [response.data] };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Tạo cảnh báo thất bại'
      };
    }
  },

  async getAlerts(): Promise<AlertsResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.get('/alerts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Lấy danh sách cảnh báo thất bại'
      };
    }
  },

  async deleteAlert(alertId: string): Promise<AlertsResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.delete(`/alerts/${alertId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return { message: response.data.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Xóa cảnh báo thất bại'
      };
    }
  },

  async toggleAlert(alertId: string, isActive: boolean): Promise<AlertsResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.patch(`/alerts/${alertId}/toggle`,
        { isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return { message: response.data.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Cập nhật cảnh báo thất bại'
      };
    }
  }
};

// Portfolio API interfaces
interface PortfolioHolding {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  quantity: number;
  averageBuyPrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateHoldingRequest {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  quantity: number;
  averageBuyPrice?: number;
  notes?: string;
}

interface UpdateHoldingRequest {
  quantity?: number;
  averageBuyPrice?: number;
  notes?: string;
}

interface PortfolioValue {
  totalValue: number;
  holdings: Array<{
    holding: PortfolioHolding;
    currentPrice: number;
    currentValue: number;
    profitLoss?: number;
    profitLossPercentage?: number;
  }>;
}

interface PortfolioSnapshot {
  id: string;
  userId: string;
  totalValue: number;
  snapshotDate: string;
}

interface PortfolioResponse {
  data?: PortfolioHolding[] | PortfolioValue | PortfolioSnapshot[];
  error?: string;
  message?: string;
}

// Portfolio API client
export const portfolioApi = {
  async getHoldings(): Promise<PortfolioResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.get('/portfolio/holdings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Lấy danh sách holdings thất bại'
      };
    }
  },

  async addHolding(holdingData: CreateHoldingRequest): Promise<PortfolioResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.post('/portfolio/holdings', holdingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { data: [response.data] };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Thêm holding thất bại'
      };
    }
  },

  async updateHolding(holdingId: string, holdingData: UpdateHoldingRequest): Promise<PortfolioResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.put(`/portfolio/holdings/${holdingId}`, holdingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { data: [response.data] };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Cập nhật holding thất bại'
      };
    }
  },

  async removeHolding(holdingId: string): Promise<PortfolioResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.delete(`/portfolio/holdings/${holdingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { message: response.data.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Xóa holding thất bại'
      };
    }
  },

  async getPortfolioValue(): Promise<PortfolioResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.get('/portfolio/value', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Lấy giá trị portfolio thất bại'
      };
    }
  },

  async getPortfolioHistory(days: number = 30): Promise<PortfolioResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.get(`/portfolio/history?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Lấy lịch sử portfolio thất bại'
      };
    }
  },

  async createSnapshot(): Promise<PortfolioResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.post('/portfolio/snapshot', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { data: [response.data] };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Tạo snapshot thất bại'
      };
    }
  },

  async getPortfolioValueHistory(days: number = 7): Promise<PortfolioResponse> {
    try {
      const token = authApi.getToken();
      if (!token) {
        return { error: 'Không tìm thấy token xác thực' };
      }

      const response = await backendApi.get(`/portfolio/value-history?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { data: response.data.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        error: err.response?.data?.message || 'Lấy lịch sử giá trị portfolio thất bại'
      };
    }
  }
};