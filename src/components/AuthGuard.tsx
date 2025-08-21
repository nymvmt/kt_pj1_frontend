'use client';

import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  user: any;
}

export default function AuthGuard({ children, user }: AuthGuardProps) {
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12">
        <div className="text-center px-4">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              로그인이 필요합니다
            </h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              이 페이지에 접근하려면 로그인해주세요.<br/>
              프랜차이즈TV의 모든 기능을 이용하실 수 있습니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              로그인하기
            </Link>
            <Link 
              href="/register" 
              className="inline-block bg-gray-800 border border-gray-700 text-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-700 hover:text-white transition-all duration-200"
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
