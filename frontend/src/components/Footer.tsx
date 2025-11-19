import Link from 'next/link';
import { BarChart3, Github, Mail, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 text-gray-400 border-t border-gray-700/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-500 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Crypto Tracker</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
              Nền tảng theo dõi và quản lý cryptocurrency toàn diện, giúp bạn đầu tư thông minh và hiệu quả hơn.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-dark-700 hover:bg-dark-600 hover:text-primary-400 rounded-lg transition-all duration-300 text-gray-400"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-dark-700 hover:bg-dark-600 hover:text-primary-400 rounded-lg transition-all duration-300 text-gray-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@cryptotracker.com"
                className="p-2 bg-dark-700 hover:bg-dark-600 hover:text-primary-400 rounded-lg transition-all duration-300 text-gray-400"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary-400 transition-colors duration-200">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-primary-400 transition-colors duration-200">
                  So sánh
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors duration-200">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary-400 transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="hover:text-primary-400 transition-colors duration-200">
                  Trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors duration-200">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-400 transition-colors duration-200">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/40 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Crypto Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
