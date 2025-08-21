'use client';

import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  user: any;
}

export default function AuthGuard({ children, user }: AuthGuardProps) {
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            로그인이 필요합니다
          </h1>
          <p className="text-gray-600 mb-4">
            이 페이지에 접근하려면 로그인해주세요.
          </p>
          <div className="space-x-4">
            <Link 
              href="/login" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              로그인
            </Link>
            <Link 
              href="/register" 
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
