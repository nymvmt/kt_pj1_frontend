'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

type UserType = 'user' | 'manager';

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    // 매니저 전용 필드
    brandName: '',
    categoryId: 0,
    initialCost: '',
    totalInvestment: '',
    avgMonthlyRevenue: '',
    storeCount: '',
    brandDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 클라이언트 사이드 유효성 검사 (백엔드 규칙과 일치)
    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    
    if (!formData.phone) {
      setError('전화번호는 필수입니다.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (userType === 'manager' && !formData.brandName) {
      setError('브랜드명은 필수입니다.');
      return;
    }
    
    if (userType === 'manager' && !formData.categoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (userType === 'user') {
        await authAPI.registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
        });
      } else {
        await authAPI.registerManager({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          brandName: formData.brandName,
          categoryId: formData.categoryId,
          initialCost: formData.initialCost ? parseFloat(formData.initialCost) : undefined,
          totalInvestment: formData.totalInvestment ? parseFloat(formData.totalInvestment) : undefined,
          avgMonthlyRevenue: formData.avgMonthlyRevenue ? parseFloat(formData.avgMonthlyRevenue) : undefined,
          storeCount: formData.storeCount ? parseInt(formData.storeCount) : undefined,
          brandDescription: formData.brandDescription || undefined,
        });
      }
      
      // 회원가입 성공 후 로그인 페이지로 이동
      router.push('/login?message=회원가입이 완료되었습니다. 로그인해주세요.');
    } catch (err: any) {
      console.error('회원가입 실패:', err);
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          또는{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            로그인
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 사용자 타입 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              회원 유형 선택
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {userType === 'user' ? '이름' : '매니저명'} *
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                전화번호 *
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {userType === 'manager' && (
              <>
                <div>
                  <label htmlFor="brandName" className="block text-sm font-medium text-gray-700">
                    브랜드명 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="brandName"
                      name="brandName"
                      type="text"
                      required
                      value={formData.brandName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                    카테고리 *
                  </label>
                  <div className="mt-1">
                    <select
                      id="categoryId"
                      name="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">카테고리를 선택하세요</option>
                      <option value="1">외식</option>
                      <option value="2">뷰티</option>
                      <option value="3">교육</option>
                      <option value="4">편의점</option>
                      <option value="5">서비스</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="brandDescription" className="block text-sm font-medium text-gray-700">
                    브랜드 설명
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="brandDescription"
                      name="brandDescription"
                      rows={3}
                      value={formData.brandDescription}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일 *
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호 *
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  maxLength={255}
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">6자 이상 입력해주세요</p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인 *
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '회원가입 중...' : `${userType === 'user' ? '일반 사용자' : '브랜드 매니저'} 회원가입`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
