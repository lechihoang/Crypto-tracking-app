# API Migration từ Frontend sang Backend

## ✅ Hoàn thành chuyển đổi

Đã thành công chuyển logic API cryptocurrency từ frontend sang backend NestJS.

## 🔄 Thay đổi chính

### **Trước khi chuyển đổi:**
- Frontend chatbot gọi trực tiếp CoinGecko API
- Logic xử lý crypto data nằm trong `/src/app/api/chatbot/route.ts`
- Axios và API calls trực tiếp từ client

### **Sau khi chuyển đổi:**
- Backend NestJS xử lý tất cả crypto API calls
- Frontend chatbot gọi backend API thông qua `/crypto/chat-data`
- Tách biệt concerns: Frontend chỉ UI, Backend xử lý data

## 🏗️ Backend Architecture

### **Crypto Module Structure:**
```
backend/src/crypto/
├── crypto.module.ts     # Module definition
├── crypto.controller.ts # API endpoints
└── crypto.service.ts    # Business logic
```

### **API Endpoints Available:**
```typescript
POST /crypto/prices          # Get prices for specific coins
GET  /crypto/top?limit=10    # Get top coins by market cap
GET  /crypto/search?q=btc    # Search coins by query
POST /crypto/chat-data       # Get crypto data for chatbot
GET  /crypto/coin/:coinId    # Get detailed coin info
GET  /crypto/supported-coins # Get list of supported coins
```

## 🔧 Configuration

### **Environment Variables:**
```env
# Frontend (.env.local)
BACKEND_API_URL=http://localhost:3001
GOOGLE_AI_API_KEY=your-api-key

# Backend (.env)
COINMARKETCAP_API_KEY=your-key
```

### **Startup Order:**
1. **Backend**: `cd backend && npm run start:dev` (port 3001)
2. **Frontend**: `npm run dev` (port 3000)

## 🚀 Benefits của Migration

### **Performance:**
- ✅ Giảm bundle size frontend (loại bỏ axios dependencies)
- ✅ Caching có thể implement ở backend layer
- ✅ Rate limiting tập trung

### **Security:**
- ✅ API keys được bảo vệ ở backend
- ✅ CORS policy được kiểm soát
- ✅ Input validation ở backend

### **Scalability:**
- ✅ Backend có thể scale độc lập
- ✅ Multiple frontend có thể dùng chung backend
- ✅ Easy to add authentication/authorization

### **Maintainability:**
- ✅ Separation of concerns rõ ràng
- ✅ TypeScript interfaces được share
- ✅ Centralized error handling

## 🧪 Testing

### **Backend API Test:**
```bash
# Test crypto endpoints
curl -X POST http://localhost:3001/crypto/chat-data \
  -H "Content-Type: application/json" \
  -d '{"query": "bitcoin price"}'

curl -X GET http://localhost:3001/crypto/top?limit=5
```

### **Frontend Test:**
1. Mở chatbot UI
2. Hỏi: "Giá bitcoin bao nhiêu?"
3. Chatbot sẽ gọi backend API và trả về kết quả

## 🔍 Code Changes

### **Removed from Frontend:**
- ❌ Direct CoinGecko API calls trong chatbot route
- ❌ Crypto data processing logic
- ❌ Coin patterns và search logic

### **Added to Backend:**
- ✅ `CryptoService` với full crypto functionality
- ✅ `CryptoController` với REST endpoints
- ✅ Error handling và logging
- ✅ TypeScript interfaces cho data types

### **Updated in Frontend:**
- ✅ Chatbot route giờ gọi backend API
- ✅ Environment variable cho backend URL
- ✅ Simplified error handling

## 📝 Next Steps

1. **Add Authentication**: Protect crypto endpoints
2. **Implement Caching**: Redis for crypto data
3. **Add Rate Limiting**: Per-user API limits
4. **Database Integration**: Store crypto data
5. **WebSocket**: Real-time price updates

## 🎉 Migration Complete!

- ✅ Backend có đầy đủ crypto API functionality
- ✅ Frontend chatbot hoạt động qua backend
- ✅ Code được tổ chức tốt hơn và maintainable
- ✅ Security và performance được cải thiện