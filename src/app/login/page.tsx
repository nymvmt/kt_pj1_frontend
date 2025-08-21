'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type UserType = 'user' | 'manager';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [userType, setUserType] = useState<UserType>('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      
      // 사용자 타입에 따라 다른 API 호출
      if (userType === 'user') {
        response = await authAPI.login(formData);
      } else {
        response = await authAPI.managerLogin(formData);
      }
      
      // ApiResponse로 감싸진 응답에서 data 추출
      if (!response.data.success) {
        throw new Error(response.data.message || '로그인에 실패했습니다.');
      }
      
      const { user, manager, userType: responseUserType } = response.data.data;
      
      // 사용자 타입에 따라 로그인 처리
      if (responseUserType === 'USER' && user) {
        const userData = {
          id: user.userId,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: 'USER' as const,
        };
        login(userData);
      } else if (responseUserType === 'MANAGER' && manager) {
        const managerUser = {
          id: manager.managerId,
          email: manager.email,
          name: manager.name,
          phone: manager.phone,
          role: 'MANAGER' as const,
        };
        login(managerUser);
      } else {
        throw new Error('로그인 응답이 올바르지 않습니다.');
      }
      
      // 로그인 성공 후 홈으로 이동
      router.push('/');
    } catch (err: any) {
      console.error('로그인 실패:', err);
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          또는{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            회원가입
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 사용자 타입 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              로그인 유형 선택
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUserType('user')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                일반 사용자
              </button>
              <button
                type="button"
                onClick={() => setUserType('manager')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'manager'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                브랜드 매니저
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로그인 중...' : `${userType === 'user' ? '일반 사용자' : '브랜드 매니저'} 로그인`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
