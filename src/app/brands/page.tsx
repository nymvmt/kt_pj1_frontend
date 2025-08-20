'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brandAPI } from '@/lib/api';
import { Brand, BrandCategory, PageResponse } from '@/types';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<BrandCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 브랜드 목록 조회
  const fetchBrands = async (page: number = 0, categoryId?: number, keyword?: string) => {
    try {
      setLoading(true);
      let response;
      
      if (keyword) {
        response = await brandAPI.searchBrands(keyword, page, 12);
      } else if (categoryId) {
        response = await brandAPI.getBrandsByCategory(categoryId, page, 12);
      } else {
        response = await brandAPI.getPublicBrands(page, 12);
      }
      
      const data: PageResponse<Brand> = response.data;
      setBrands(data.content);
      setTotalPages(data.pageInfo.totalPages);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('브랜드 조회 실패:', err);
      setError('브랜드 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 목록 조회 (임시 데이터)
  const fetchCategories = () => {
    const tempCategories: BrandCategory[] = [
      { id: 1, name: '외식', description: '음식점, 카페 등' },
      { id: 2, name: '뷰티', description: '미용실, 네일샵 등' },
      { id: 3, name: '교육', description: '학원, 교육기관 등' },
      { id: 4, name: '편의점', description: '편의점, 마트 등' },
      { id: 5, name: '서비스', description: '기타 서비스업' },
    ];
    setCategories(tempCategories);
  };

  // 검색 실행
  const handleSearch = () => {
    setCurrentPage(0);
    setSelectedCategory(null);
    fetchBrands(0, undefined, searchKeyword);
  };

  // 카테고리 선택
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
    setSearchKeyword('');
    fetchBrands(0, categoryId || undefined);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    fetchBrands(page, selectedCategory || undefined, searchKeyword);
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
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
        {/* 카테고리 선택 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">카테고리 선택</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="text-sm font-medium">전체</div>
              <div className="text-xs">브랜드 탐색</div>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`p-4 rounded-lg text-center transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">
                  {category.id === 1 ? '🍔' : 
                   category.id === 2 ? '💄' : 
                   category.id === 3 ? '📚' : 
                   category.id === 4 ? '🏪' : '🔧'}
                </div>
                <div className="text-sm font-medium">{category.name}</div>
                <div className="text-xs">브랜드 탐색</div>
              </button>
            ))}
          </div>
        </div>

        {/* 검색 바 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="브랜드명을 검색하세요..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              검색
            </button>
          </div>
        </div>

        {/* 브랜드 목록 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name} 브랜드`
                : '전체 브랜드'
              }
            </h2>
            <span className="text-sm text-gray-600">
              총 {brands.length}개 브랜드
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">브랜드 목록을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchBrands()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchKeyword ? '검색 결과가 없습니다.' : '등록된 브랜드가 없습니다.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {brand.category.name}
                      </span>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>👁️ {Math.floor(Math.random() * 10000) + 1000}</span>
                        <span>❤️ {Math.floor(Math.random() * 100) + 10}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {brand.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {brand.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(brand.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/brands/${brand.id}`}
                          className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          상세보기
                        </Link>
                        <button className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                          찜하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      이전
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(0, Math.min(totalPages - 1, currentPage - 2 + i));
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border rounded-lg ${
                            page === currentPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page + 1}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
