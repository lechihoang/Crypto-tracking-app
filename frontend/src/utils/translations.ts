// Hàm dịch một số cụm từ phổ biến trong crypto
export function translateCommonPhrases(text: string): string {
  if (!text) return text;
  
  const phraseTranslations: Record<string, string> = {
    'first cryptocurrency': 'đồng tiền điện tử đầu tiên',
    'digital gold': 'vàng số',
    'store of value': 'kho lưu trữ giá trị',
    'peer-to-peer electronic cash': 'tiền mặt điện tử ngang hàng',
    'decentralized finance': 'tài chính phi tập trung',
    'smart contracts platform': 'nền tảng hợp đồng thông minh',
    'proof of work': 'bằng chứng công việc',
    'proof of stake': 'bằng chứng cổ phần',
    'market capitalization': 'vốn hóa thị trường',
    'trading volume': 'khối lượng giao dịch',
    'circulating supply': 'nguồn cung lưu hành',
    'total supply': 'tổng nguồn cung',
    'maximum supply': 'nguồn cung tối đa',
    'blockchain technology': 'công nghệ blockchain',
    'digital asset': 'tài sản số',
    'virtual currency': 'tiền tệ ảo',
    'not financial advice': 'không phải lời khuyên tài chính',
    'do your own research': 'tự nghiên cứu',
    'Bitcoin': 'Bitcoin',
    'Ethereum': 'Ethereum',
    'cryptocurrency': 'tiền điện tử',
    'blockchain': 'blockchain',
    'decentralized': 'phi tập trung',
    'digital currency': 'tiền tệ số',
    'peer-to-peer': 'ngang hàng',
    'network': 'mạng lưới',
    'mining': 'đào coin',
    'wallet': 'ví điện tử',
    'transaction': 'giao dịch',
    'smart contract': 'hợp đồng thông minh',
    'token': 'token',
    'exchange': 'sàn giao dịch',
    'trading': 'giao dịch',
    'investment': 'đầu tư',
    'volatility': 'biến động',
    'DeFi': 'tài chính phi tập trung',
    'NFT': 'token không thể thay thế',
    'staking': 'staking',
    'validator': 'trình xác thực',
    'consensus': 'đồng thuận',
    'fork': 'fork',
    'halving': 'giảm một nửa',
    'community': 'cộng đồng',
    'developer': 'nhà phát triển',
    'ecosystem': 'hệ sinh thái',
    'adoption': 'áp dụng',
    'regulation': 'quy định',
    'security': 'bảo mật',
    'transparency': 'minh bạch',
    'privacy': 'riêng tư',
    'governance': 'quản trị',
    'protocol': 'giao thức',
    'algorithm': 'thuật toán',
    'hash rate': 'tỷ lệ băm',
    'difficulty': 'độ khó',
    'block reward': 'phần thưởng khối',
    'gas fee': 'phí gas',
    'scalability': 'khả năng mở rộng',
    'interoperability': 'khả năng tương tác'
  };
  
  let translatedText = text;
  
  // Thay thế các cụm từ phổ biến
  Object.entries(phraseTranslations).forEach(([english, vietnamese]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translatedText = translatedText.replace(regex, vietnamese);
  });
  
  return translatedText;
}

// Hàm chính để dịch toàn bộ văn bản
export function translateToVietnamese(text: string): string {
  if (!text) return text;
  
  // Áp dụng dịch cụm từ
  const result = translateCommonPhrases(text);
  
  return result;
}