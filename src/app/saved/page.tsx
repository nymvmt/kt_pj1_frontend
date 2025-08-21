'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userBrandAPI } from '@/lib/api';
import { Brand } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export default function SavedBrandsPage() {
  const { user } = useAuth();
  const [savedBrands, setSavedBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 찜한 브랜드 목록 조회
  const fetchSavedBrands = async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await userBrandAPI.getSavedBrands(0, 100, user.id);
      
      // ApiResponse로 감싸진 응답에서 data 추출
      if (!response.data.success) {
        throw new Error(response.data.message || '저장된 브랜드를 불러오는데 실패했습니다.');
      }
      
      const data = response.data.data as Brand[];
      setSavedBrands(data || []);
      setError(null);
    } catch (err) {
      console.error('찜한 브랜드 조회 실패:', err);
      setError('찜한 브랜드 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 찜 해제
  const handleUnsaveBrand = async (brandId: number) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    try {
      await userBrandAPI.toggleSavedBrand(brandId, user.id);
      // 목록에서 제거
      setSavedBrands(prev => prev.filter(brand => brand.brandId !== brandId));
    } catch (err: any) {
      console.error('찜 해제 실패:', err);
      alert(err.response?.data?.message || '작업에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedBrands();
    }
  }, [user]);

  return (
    <AuthGuard user={user}>
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* IPTV 헤더 */}
      <div className="bg-blue-900 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-200 hover:text-white">
              ← 홈으로 돌아가기
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-blue-400">프랜차이즈TV</h1>
              <p className="text-sm text-blue-200">성공 창업의 시작</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span>21:36</span>
            <span>Ch.887</span>
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-6">
        <div className="bg-white rounded-lg p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">❤️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">찜한 브랜드</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">총 {savedBrands.length}개 브랜드</span>
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">찜한 브랜드 목록을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchSavedBrands()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          ) : savedBrands.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💔</span>
              </div>
              <p className="text-gray-600 mb-4">아직 찜한 브랜드가 없습니다.</p>
              <Link
                href="/brands"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                브랜드 둘러보기
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedBrands.map((brand) => (
                <div
                  key={brand.brandId}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {/* 브랜드 아이콘 */}
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {brand.brandName.charAt(0)}
                      </span>
                    </div>
                    
                    {/* 브랜드 정보 */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {brand.brandName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        카테고리: {brand.categoryName}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        매니저: {brand.managerName}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>조회수: {brand.viewCount}</span>
                        <span>찜수: {brand.saveCount}</span>
                      </div>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="flex flex-col space-y-2">
                      <Link
                        href={`/brands/${brand.brandId}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        상세보기
                      </Link>
                      <button
                        onClick={() => handleUnsaveBrand(brand.brandId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        찜해제
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
    </AuthGuard>
  );
}
