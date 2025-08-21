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
      
      // 서버에서 반환한 상세 오류 메시지 처리
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errorCode === 'LOGIN_FAILED' || errorData.message) {
          setError(errorData.message || errorData.errorCode);
        } else if (errorData.errorCode === 'INTERNAL_ERROR') {
          setError('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError(errorData.message || '로그인에 실패했습니다.');
        }
      } else if (err.message) {
        setError(err.message);
      } else if (err.response?.status === 400) {
        setError('입력하신 정보를 다시 확인해주세요.');
      } else if (err.response?.status === 500) {
        setError('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (err.response?.status === 404) {
        setError('로그인 서비스를 찾을 수 없습니다.');
      } else {
        setError('네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          또는{' '}
          <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            회원가입
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {/* 사용자 타입 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              로그인 유형 선택
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUserType('user')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  userType === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                일반 사용자
              </button>
              <button
                type="button"
                onClick={() => setUserType('manager')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  userType === 'manager'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                브랜드 매니저
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
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
