'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: '홈', icon: '🏠' },
    { href: '/brands', label: '브랜드', icon: '🏢' },
    // 매니저일 때는 "내 브랜드 관리", 일반 사용자일 때는 "찜한 브랜드"
    ...(user?.role === 'MANAGER' 
      ? [
          { href: '/manager', label: '브랜드 관리', icon: '⚙️' },
          { href: '/manager/consultations', label: '상담 관리', icon: '💼' }
        ]
      : [
          { href: '/saved', label: '찜한 브랜드', icon: '❤️' },
          { href: '/consultations', label: '상담 이력', icon: '💬' }
        ]
    ),
    { href: '/notifications', label: '알림', icon: '🔔' },
    ...(user ? [
      { href: '/profile', label: '내 정보', icon: '👤' }
    ] : [
      { href: '/login', label: '로그인', icon: '👤' }
    ]),
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm text-white fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800/50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              pathname === item.href
                ? 'text-blue-400 bg-gray-800'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
        
        {user && (
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-red-400 hover:text-white hover:bg-red-800"
          >
            <span className="text-lg mb-1">🚪</span>
            <span className="text-xs font-medium">로그아웃</span>
          </button>
        )}
      </div>
    </nav>
  );
}
