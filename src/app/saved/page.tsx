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
      <div className="h-screen bg-slate-950 flex flex-col">
        {/* IPTV 헤더 */}
        <div className="bg-slate-900/95 backdrop-blur-sm text-white p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white">
                ← 홈으로 돌아가기
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-blue-400">프랜차이즈TV</h1>
                <p className="text-sm text-gray-300">성공 창업의 시작</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span>21:36</span>
              <span>Ch.887</span>
              <div className="w-6 h-6 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto bg-slate-950">
          <div className="p-6">
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-transparent flex items-center justify-center">
                <span className="text-red-500 text-lg">❤️</span>
              </div>
              <h2 className="text-2xl font-bold text-white">찜한 브랜드</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">총 {savedBrands.length}개 브랜드</span>
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-400">찜한 브랜드 목록을 불러오는 중...</p>
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
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💔</span>
              </div>
              <p className="text-gray-400 mb-4">아직 찜한 브랜드가 없습니다.</p>
              <Link
                href="/brands"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                브랜드 둘러보기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {savedBrands.map((brand) => (
                <div
                  key={brand.brandId}
                  className="flex-shrink-0 w-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 border border-gray-700/30"
                >
                  {/* 브랜드 정보 */}
                  <div className="p-3">
                    {/* 헤더 영역 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {brand.brandName?.charAt(0) || 'B'}
                          </span>
                        </div>
                        <div className="w-6 h-6 bg-transparent flex items-center justify-center">
                          <span className="text-red-500 text-sm">♥</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">
                      {brand.brandName || '브랜드명'}
                    </h3>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center text-gray-300 text-xs">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                        {brand.managerName || '매니저'}
                      </div>
                      <div className="flex items-center text-gray-300 text-xs">
                        <span className="w-1 h-1 bg-purple-500 rounded-full mr-2"></span>
                        {brand.categoryName || '카테고리'}
                      </div>
                      <div className="flex items-center text-gray-400 text-xs">
                        <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                        조회: {brand.viewCount || 0} | 찜: {brand.saveCount || 0}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/brands/${brand.brandId}`}
                        className="flex-1 bg-white/90 text-gray-900 px-3 py-2 rounded-md text-xs font-medium text-center hover:bg-white transition-colors"
                      >
                        상세보기
                      </Link>
                      <button
                        onClick={() => handleUnsaveBrand(brand.brandId)}
                        className="flex-shrink-0 px-3 py-2 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        ♥
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
      </div>
    </AuthGuard>
  );
}
