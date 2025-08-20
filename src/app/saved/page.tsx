'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userBrandAPI } from '@/lib/api';
import { Brand, PageResponse } from '@/types';

export default function SavedBrandsPage() {
  const [savedBrands, setSavedBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 찜한 브랜드 목록 조회
  const fetchSavedBrands = async () => {
    try {
      setLoading(true);
      const response = await userBrandAPI.getSavedBrands(0, 100);
      const data = response.data as PageResponse<Brand>;
      setSavedBrands(data.content || []);
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
    try {
      await userBrandAPI.toggleSavedBrand(brandId);
      // 목록에서 제거
      setSavedBrands(prev => prev.filter(brand => brand.id !== brandId));
    } catch (err: any) {
      console.error('찜 해제 실패:', err);
      alert(err.response?.data?.message || '찜 해제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchSavedBrands();
  }, []);

  return (
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
                  key={brand.id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {/* 브랜드 아이콘 */}
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                    
                    {/* 브랜드 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {brand.name}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {brand.category.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {brand.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>찜한 날짜: {new Date(brand.createdAt).toLocaleDateString()}</span>
                        <span>👁️ {Math.floor(Math.random() * 10000) + 1000}</span>
                      </div>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="flex flex-col space-y-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2">
                        <span>💬</span>
                        <span>상담신청</span>
                      </button>
                      <button 
                        onClick={() => handleUnsaveBrand(brand.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center space-x-2"
                      >
                        <span>❤️</span>
                        <span>찜취소</span>
                      </button>
                      <Link
                        href={`/brands/${brand.id}`}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center space-x-2"
                      >
                        <span>👁️</span>
                        <span>상세보기</span>
                      </Link>
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
