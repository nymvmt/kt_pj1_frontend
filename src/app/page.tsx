'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brandAPI } from '@/lib/api';
import { Brand, PageResponse } from '@/types';

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);

  // 브랜드 목록 조회
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await brandAPI.getPublicBrands(0, 20);
      const data: PageResponse<Brand> = response.data;
      setBrands(data.content);
      setError(null);
    } catch (err) {
      console.error('브랜드 조회 실패:', err);
      setError('브랜드 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 브랜드 캐러셀 자동 슬라이드
  useEffect(() => {
    if (brands && brands.length > 0) {
      const interval = setInterval(() => {
        setCurrentBrandIndex((prev) => (prev + 1) % brands.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [brands]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchBrands();
  }, []);

  // 이전/다음 브랜드
  const goToPreviousBrand = () => {
    if (brands && brands.length > 0) {
      setCurrentBrandIndex((prev) => (prev - 1 + brands.length) % brands.length);
    }
  };

  const goToNextBrand = () => {
    if (brands && brands.length > 0) {
      setCurrentBrandIndex((prev) => (prev + 1) % brands.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* IPTV 헤더 */}
      <div className="bg-blue-900 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">프랜차이즈TV</h1>
            <p className="text-sm text-blue-200">성공 창업의 시작</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span>21:36</span>
            <span>Ch.887</span>
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 p-6">
        {/* 영상 플레이어 영역 */}
        <div className="bg-black rounded-lg mb-8 aspect-video flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg font-medium">영상 플레이어</p>
            <p className="text-sm text-gray-400">현재 재생 중인 콘텐츠가 표시됩니다</p>
          </div>
        </div>

        {/* 브랜드 캐러셀 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">추천 브랜드</h2>
            <Link 
              href="/brands" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              전체보기 →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">브랜드 목록을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchBrands()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          ) : brands && brands.length > 0 ? (
            <div className="relative">
              {/* 브랜드 카드 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {brands[currentBrandIndex]?.name?.charAt(0) || 'B'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {brands[currentBrandIndex]?.name || '브랜드명'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {brands[currentBrandIndex]?.description || '브랜드 설명'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>카테고리: {brands[currentBrandIndex]?.category?.name || '카테고리'}</span>
                      <span>조회수: {Math.floor(Math.random() * 10000) + 1000}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link
                      href={`/brands/${brands[currentBrandIndex]?.id || 1}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      상세보기
                    </Link>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                      찜하기
                    </button>
                  </div>
                </div>
              </div>

              {/* 네비게이션 버튼 */}
              <button
                onClick={goToPreviousBrand}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={goToNextBrand}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* 인디케이터 */}
              <div className="flex justify-center mt-4 space-x-2">
                {brands && brands.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBrandIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentBrandIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">등록된 브랜드가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
