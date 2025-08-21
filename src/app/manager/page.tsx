'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { managerBrandAPI } from '@/lib/api';
import { Brand } from '@/types';
import Link from 'next/link';

export default function ManagerPage() {
  const { user } = useAuth();
  const [managedBrands, setManagedBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'MANAGER') {
      fetchManagedBrands();
    }
  }, [user]);

  const fetchManagedBrands = async () => {
    try {
      setLoading(true);
      // 매니저가 관리하는 브랜드 목록 조회
      const response = await managerBrandAPI.getManagerBrands(user!.id);
      const responseData = response.data as any;
      if (responseData.success) {
        setManagedBrands(responseData.data);
      } else {
        setError('브랜드 목록 조회에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('브랜드 목록 조회 실패:', err);
      setError('브랜드 목록 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 브랜드 삭제
  const handleDeleteBrand = async (brandId: number, brandName: string) => {
    if (!confirm(`정말로 "${brandName}" 브랜드를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await managerBrandAPI.deleteBrand(brandId, user!.id);
      const responseData = response.data as any;
      
      if (responseData.success) {
        alert('브랜드가 성공적으로 삭제되었습니다.');
        // 브랜드 목록 새로고침
        fetchManagedBrands();
      } else {
        setError('브랜드 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('브랜드 삭제 실패:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('브랜드 삭제에 실패했습니다.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            내 브랜드 관리
          </h1>
          <p className="text-gray-600">
            {user.name}님이 관리하는 브랜드 목록입니다.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                관리 브랜드 ({managedBrands.length}개)
              </h2>
              <Link
                href="/manager/brands/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                브랜드 추가
              </Link>
            </div>
          </div>

          {managedBrands.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 관리하는 브랜드가 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                새로운 브랜드를 등록하여 관리해보세요.
              </p>
              <Link
                href="/brands"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                첫 번째 브랜드 등록하기
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {managedBrands.map((brand) => (
                <div key={brand.brandId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {brand.brandName}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {brand.categoryName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        가맹비: {brand.initialCost?.toLocaleString()}원 | 
                        월매출: {brand.avgMonthlyRevenue?.toLocaleString()}원 | 
                        매장수: {brand.storeCount ? `${brand.storeCount}개` : '정보없음'}
                      </p>
                      {brand.brandDescription && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {brand.brandDescription}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        조회수: {brand.viewCount} | 찜수: {brand.saveCount}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/brands/${brand.brandId}`}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        상세보기
                      </Link>
                      <Link
                        href={`/manager/brands/${brand.brandId}/edit`}
                        className="text-green-600 hover:text-green-500 text-sm font-medium"
                      >
                        수정
                      </Link>
                      <button 
                        onClick={() => handleDeleteBrand(brand.brandId, brand.brandName)}
                        className="text-red-600 hover:text-red-500 text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
