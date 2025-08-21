'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, managerBrandAPI } from '@/lib/api';
import { BrandCategory } from '@/types';

type UserType = 'user' | 'manager';

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('user');
  const [categories, setCategories] = useState<BrandCategory[]>([]);
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

  // 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('카테고리 목록 조회 시작...');
        const response = await managerBrandAPI.getCategories();
        console.log('카테고리 응답:', response);
        if (response.data.success) {
          setCategories(response.data.data);
          console.log('카테고리 목록 설정 완료:', response.data.data);
        } else {
          console.error('카테고리 응답 실패:', response.data);
        }
      } catch (err: any) {
        console.error('카테고리 목록 조회 실패:', err);
        if (err.response) {
          console.error('응답 상태:', err.response.status);
          console.error('응답 데이터:', err.response.data);
        }
      }
    };

    fetchCategories();
  }, []);

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
    
    if (userType === 'manager' && !formData.initialCost) {
      setError('가맹비는 필수입니다.');
      return;
    }
    
    if (userType === 'manager' && parseFloat(formData.initialCost) <= 0) {
      setError('가맹비는 0보다 커야 합니다.');
      return;
    }
    
    if (userType === 'manager' && !formData.totalInvestment) {
      setError('총 창업비용은 필수입니다.');
      return;
    }
    
    if (userType === 'manager' && parseFloat(formData.totalInvestment) <= 0) {
      setError('총 창업비용은 0보다 커야 합니다.');
      return;
    }
    
    if (userType === 'manager' && !formData.avgMonthlyRevenue) {
      setError('평균 월매출은 필수입니다.');
      return;
    }
    
    if (userType === 'manager' && parseFloat(formData.avgMonthlyRevenue) <= 0) {
      setError('평균 월매출은 0보다 커야 합니다.');
      return;
    }
    
    if (userType === 'manager' && !formData.storeCount) {
      setError('매장수는 필수입니다.');
      return;
    }
    
    if (userType === 'manager' && parseInt(formData.storeCount) <= 0) {
      setError('매장수는 0보다 커야 합니다.');
      return;
    }
    
    if (userType === 'manager' && !formData.brandDescription) {
      setError('브랜드 설명은 필수입니다.');
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
          initialCost: parseFloat(formData.initialCost),
          totalInvestment: parseFloat(formData.totalInvestment),
          avgMonthlyRevenue: parseFloat(formData.avgMonthlyRevenue),
          storeCount: parseInt(formData.storeCount),
          brandDescription: formData.brandDescription,
        });
      }
      
      // 회원가입 성공 후 로그인 페이지로 이동
      router.push('/login?message=회원가입이 완료되었습니다. 로그인해주세요.');
    } catch (err: any) {
      console.error('회원가입 실패:', err);
      
      // 서버에서 반환한 상세 오류 메시지 처리
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errorCode === 'REGISTRATION_FAILED' || errorData.message) {
          setError(errorData.message || errorData.errorCode);
        } else if (errorData.errorCode === 'INTERNAL_ERROR') {
          setError('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError(errorData.message || '회원가입에 실패했습니다.');
        }
      } else if (err.message) {
        setError(err.message);
      } else if (err.response?.status === 400) {
        setError('입력하신 정보를 다시 확인해주세요.');
      } else if (err.response?.status === 500) {
        setError('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (err.response?.status === 404) {
        setError('회원가입 서비스를 찾을 수 없습니다.');
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
          회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          또는{' '}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            로그인
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {/* 사용자 타입 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              회원 유형 선택
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {userType === 'manager' && (
              <>
                <div>
                  <label htmlFor="brandName" className="block text-sm font-medium text-gray-300">
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
                      className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300">
                    카테고리 *
                  </label>
                  <div className="mt-1">
                    <select
                      id="categoryId"
                      name="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">카테고리를 선택하세요</option>
                      {categories.map(category => (
                        <option key={category.categoryId} value={category.categoryId}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="brandDescription" className="block text-sm font-medium text-gray-300">
                    브랜드 설명 *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="brandDescription"
                      name="brandDescription"
                      rows={3}
                      required
                      value={formData.brandDescription}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="initialCost" className="block text-sm font-medium text-gray-300">
                    가맹비 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="initialCost"
                      name="initialCost"
                      type="number"
                      min="0"
                      step="1000000"
                      required
                      value={formData.initialCost}
                      onChange={handleChange}
                      placeholder="예: 5000000"
                      className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="totalInvestment" className="block text-sm font-medium text-gray-300">
                    총 창업비용 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="totalInvestment"
                      name="totalInvestment"
                      type="number"
                      min="0"
                      step="1000000"
                      required
                      value={formData.totalInvestment}
                      onChange={handleChange}
                      placeholder="예: 10000000"
                      className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="avgMonthlyRevenue" className="block text-sm font-medium text-gray-300">
                    평균 월매출 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="avgMonthlyRevenue"
                      name="avgMonthlyRevenue"
                      type="number"
                      min="0"
                      step="1000000"
                      required
                      value={formData.avgMonthlyRevenue}
                      onChange={handleChange}
                      placeholder="예: 8000000"
                      className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="storeCount" className="block text-sm font-medium text-gray-300">
                    매장수 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="storeCount"
                      name="storeCount"
                      type="number"
                      min="1"
                      required
                      value={formData.storeCount}
                      onChange={handleChange}
                      placeholder="예: 5"
                      className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">6자 이상 입력해주세요</p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
