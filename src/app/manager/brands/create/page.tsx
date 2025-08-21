'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { managerBrandAPI } from '@/lib/api';
import { BrandCategory } from '@/types';

export default function CreateBrandPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<BrandCategory[]>([]);
  const [formData, setFormData] = useState({
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
          setError('카테고리 목록 조회에 실패했습니다.');
        }
      } catch (err: any) {
        console.error('카테고리 목록 조회 실패:', err);
        if (err.response) {
          console.error('응답 상태:', err.response.status);
          console.error('응답 데이터:', err.response.data);
        }
        setError('카테고리 목록 조회에 실패했습니다.');
      }
    };

    fetchCategories();
  }, []);

  // 권한 확인
  useEffect(() => {
    if (!user || user.role !== 'MANAGER') {
      router.push('/login');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 클라이언트 사이드 유효성 검사
    if (!formData.brandName.trim()) {
      setError('브랜드명은 필수입니다.');
      return;
    }
    
    if (!formData.categoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }
    
    if (!formData.initialCost || parseFloat(formData.initialCost) <= 0) {
      setError('가맹비는 0보다 커야 합니다.');
      return;
    }
    
    if (!formData.totalInvestment || parseFloat(formData.totalInvestment) <= 0) {
      setError('총 창업비용은 0보다 커야 합니다.');
      return;
    }
    
    if (!formData.avgMonthlyRevenue || parseFloat(formData.avgMonthlyRevenue) <= 0) {
      setError('평균 월매출은 0보다 커야 합니다.');
      return;
    }
    
    if (!formData.storeCount || parseInt(formData.storeCount) <= 0) {
      setError('매장수는 0보다 커야 합니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const brandData = {
        brandName: formData.brandName.trim(),
        categoryId: formData.categoryId,
        initialCost: parseFloat(formData.initialCost),
        totalInvestment: parseFloat(formData.totalInvestment),
        avgMonthlyRevenue: parseFloat(formData.avgMonthlyRevenue),
        storeCount: parseInt(formData.storeCount),
        brandDescription: formData.brandDescription.trim(),
      };
      
      const response = await managerBrandAPI.createBrand(brandData, user!.id);
      
      if (response.data.success) {
        alert('브랜드가 성공적으로 등록되었습니다.');
        router.push('/manager');
              } else {
          setError('브랜드 등록에 실패했습니다.');
        }
    } catch (err: any) {
      console.error('브랜드 등록 실패:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('브랜드 등록에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'MANAGER') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600 mb-4">
            브랜드 매니저만 접근할 수 있는 페이지입니다.
          </p>
          <Link 
            href="/login" 
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                브랜드 추가
              </h1>
              <p className="text-gray-600">
                새로운 브랜드를 등록합니다.
              </p>
            </div>
            <Link
              href="/manager"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← 돌아가기
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 브랜드명 */}
              <div>
                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
                  브랜드명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="브랜드명을 입력하세요"
                  maxLength={200}
                  required
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={0}>카테고리를 선택하세요</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 가맹비 */}
              <div>
                <label htmlFor="initialCost" className="block text-sm font-medium text-gray-700 mb-2">
                  가맹비 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="initialCost"
                  name="initialCost"
                  value={formData.initialCost}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1,000,000"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">숫자만 입력하세요 (예: 1000000)</p>
              </div>

              {/* 총 창업비용 */}
              <div>
                <label htmlFor="totalInvestment" className="block text-sm font-medium text-gray-700 mb-2">
                  총 창업비용 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="totalInvestment"
                  name="totalInvestment"
                  value={formData.totalInvestment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5,000,000"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">숫자만 입력하세요 (예: 5000000)</p>
              </div>

              {/* 평균 월매출 */}
              <div>
                <label htmlFor="avgMonthlyRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                  평균 월매출 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="avgMonthlyRevenue"
                  name="avgMonthlyRevenue"
                  value={formData.avgMonthlyRevenue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2,000,000"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">숫자만 입력하세요 (예: 2000000)</p>
              </div>

              {/* 매장수 */}
              <div>
                <label htmlFor="storeCount" className="block text-sm font-medium text-gray-700 mb-2">
                  매장수 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="storeCount"
                  name="storeCount"
                  value={formData.storeCount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="1"
                  required
                />
              </div>

              {/* 브랜드 설명 */}
              <div>
                <label htmlFor="brandDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  브랜드 설명
                </label>
                <textarea
                  id="brandDescription"
                  name="brandDescription"
                  value={formData.brandDescription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="브랜드에 대한 설명을 입력하세요"
                  maxLength={200}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.brandDescription.length}/200
                </p>
              </div>

              {/* 제출 버튼 */}
              <div className="flex justify-end space-x-3 pt-4">
                <Link
                  href="/manager"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '등록 중...' : '브랜드 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
