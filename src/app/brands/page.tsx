'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { publicBrandAPI, userBrandAPI, managerBrandAPI } from '@/lib/api';
import { Brand, BrandCategory } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import BrandCategoryChart from '@/components/BrandCategoryChart';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<BrandCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});
  
  const { user } = useAuth();

  // 브랜드 목록 조회
  const fetchBrands = async (page: number = 0, categoryId?: number, keyword?: string) => {
    try {
      setLoading(true);
      let response;
      
      try {
        if (keyword) {
          response = await publicBrandAPI.searchBrands(keyword, page, 12);
        } else if (categoryId) {
          // 매니저인 경우 전체 브랜드에서 카테고리 필터링
          if (user?.role === 'MANAGER' && user.id) {
            response = await managerBrandAPI.getAllBrands(user.id);
          } else {
            response = await publicBrandAPI.getBrandsByCategory(categoryId, page, 12);
          }
        } else {
          // 매니저인 경우 managerBrandAPI.getAllBrands 사용 (isManaged 필드 + 자동 정렬)
          if (user?.role === 'MANAGER' && user.id) {
            response = await managerBrandAPI.getAllBrands(user.id);
          } else {
            response = await publicBrandAPI.getPublicBrands(page, 12);
          }
        }
      } catch (error) {
        console.error('API 호출 실패:', error);
        throw error;
      }
      
      if (!response.data.success) {
        throw new Error(response.data.message || '브랜드 목록을 불러오는데 실패했습니다.');
      }
      
      let data: Brand[] = response.data.data;
      
      // 매니저가 카테고리별 조회시 클라이언트 사이드 필터링
      if (user?.role === 'MANAGER' && categoryId && data.length > 0) {
        // 전체 브랜드에서 해당 카테고리만 필터링 (정렬은 백엔드에서 이미 완료됨)
        data = data.filter(brand => 
          brand.category?.categoryId === categoryId || 
          brand.categoryName === categories.find(cat => cat.categoryId === categoryId)?.categoryName
        );
      }
      
      // 매니저가 아닌 로그인한 사용자인 경우만 찜 상태 조회 후 정렬
      if (user && user.role !== 'MANAGER' && user.id && data.length > 0) {
        const sortedData = await fetchBrandSaveStatusAndSort(data);
        setBrands(sortedData);
      } else {
        // 매니저이거나 로그인하지 않은 경우 모든 브랜드를 찜하지 않은 상태로 설정
        const savedStates: { [key: number]: boolean } = {};
        data.forEach(brand => {
          savedStates[brand.brandId] = false;
        });
        setSavingStates(savedStates);
        setBrands(data);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('브랜드 조회 실패:', err);
      setError('브랜드 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 브랜드 찜 상태 조회
  const fetchBrandSaveStatus = async (brandIds: number[]) => {
    if (!user || !user.id || brandIds.length === 0) return;
    
    try {
      const response = await userBrandAPI.getBrandSaveStatus(brandIds, user.id);
      if (response.data.success) {
        const saveStatus = response.data.data;
        setSavingStates(saveStatus);
      }
    } catch (err) {
      console.error('찜 상태 조회 실패:', err);
    }
  };

  // 브랜드 찜 상태 조회 후 정렬
  const fetchBrandSaveStatusAndSort = async (brands: Brand[]): Promise<Brand[]> => {
    if (!user || !user.id || brands.length === 0) return brands;
    
    try {
      const brandIds = brands.map(brand => brand.brandId);
      const response = await userBrandAPI.getBrandSaveStatus(brandIds, user.id);
      
      if (response.data.success) {
        const saveStatus = response.data.data;
        setSavingStates(saveStatus);
        
        // 찜한 브랜드가 상단에 오도록 정렬
        const sortedBrands = brands.sort((a, b) => {
          const aSaved = saveStatus[a.brandId] || false;
          const bSaved = saveStatus[b.brandId] || false;
          
          // 찜한 브랜드를 상단으로
          if (aSaved && !bSaved) return -1;
          if (!aSaved && bSaved) return 1;
          return 0; // 찜 상태가 같으면 기존 순서 유지
        });
        
        return sortedBrands;
      }
    } catch (err) {
      console.error('찜 상태 조회 실패:', err);
    }
    
    return brands;
  };

  // 카테고리 목록 조회
  const fetchCategories = async () => {
    try {
      const response = await publicBrandAPI.getCategories();
      if (response.data.data) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('카테고리 조회 실패:', err);
    }
  };

  // 검색 실행
  const handleSearch = () => {
    setSelectedCategory(null);
    fetchBrands(0, undefined, searchKeyword);
  };

  // 카테고리 선택
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchKeyword('');
    fetchBrands(0, categoryId || undefined);
  };

  // 찜하기/해제
  const handleToggleSave = async (brandId: number) => {
    if (!user || !user.id) return;
    
    try {
      await userBrandAPI.toggleSavedBrand(brandId, user.id);
      
      // 백엔드에서 saveCount가 업데이트되므로 전체 브랜드 목록을 다시 조회
      await fetchBrands(0, selectedCategory || undefined, searchKeyword);
    } catch (err) {
      console.error('찜하기/해제 실패:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBrands();
    }
    fetchCategories();
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
          {/* 매니저용 브랜드 추가 버튼 */}
          {user?.role === 'MANAGER' && (
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-white">브랜드 관리</h2>
                  <p className="text-sm text-gray-300">새로운 브랜드를 등록하여 관리하세요</p>
                </div>
                <Link
                  href="/manager"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  브랜드 추가
                </Link>
              </div>
            </div>
          )}

          {/* 카테고리별 브랜드 통계 차트 */}
          <BrandCategoryChart />

          {/* 카테고리 선택 */}
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">카테고리 선택</h2>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-3 pb-2">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`flex-shrink-0 px-6 py-3 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🏠</span>
                    <span className="text-sm font-medium">전체</span>
                  </div>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.categoryId}
                    onClick={() => handleCategorySelect(category.categoryId)}
                    className={`flex-shrink-0 px-6 py-3 rounded-lg transition-colors ${
                      selectedCategory === category.categoryId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {category.categoryName === '외식' ? '🍽️' : 
                         category.categoryName === '뷰티' ? '💄' :
                         category.categoryName === '교육' ? '📚' :
                         category.categoryName === '편의점' ? '🏪' : '🏠'}
                      </span>
                      <span className="text-sm font-medium whitespace-nowrap">{category.categoryName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 검색 바 */}
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-6 mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="브랜드명을 검색하세요..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                검색
              </button>
            </div>
          </div>

          {/* Netflix 스타일 카테고리별 브랜드 목록 */}
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-400">브랜드 목록을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => fetchBrands()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  다시 시도
                </button>
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  {searchKeyword ? '검색 결과가 없습니다.' : '등록된 브랜드가 없습니다.'}
                </p>
              </div>
            ) : (
              <>
                {/* 매니저 브랜드 섹션 (매니저인 경우) */}
                {user?.role === 'MANAGER' && brands.filter(brand => user.name && brand.managerName === user.name).length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h2 className="text-xl font-bold text-white">내 브랜드</h2>
                      <span className="text-sm text-gray-400">
                        {brands.filter(brand => user.name && brand.managerName === user.name).length}개
                      </span>
                    </div>
                    <div className="relative">
                      <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex space-x-4 pb-2">
                          {brands.filter(brand => user.name && brand.managerName === user.name).map((brand) => {
                            const isSaved = savingStates[brand.brandId];
                            return (
                              <div
                                key={brand.brandId}
                                className="flex-shrink-0 w-64 bg-gradient-to-br from-blue-800/50 to-indigo-800/50 backdrop-blur-md rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 border border-blue-500/50"
                              >
                                <div className="p-3">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg font-bold">
                                          {brand.brandName?.charAt(0) || 'B'}
                                        </span>
                                      </div>
                                      <span className="inline-block px-2 py-1 text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full shadow-md animate-pulse">
                                        ⭐ 내 브랜드
                                      </span>
                                    </div>
                                  </div>
                                  <h3 className="text-sm font-bold text-blue-200 mb-2 line-clamp-1">
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
                                  <div className="flex space-x-2">
                                    <Link
                                      href={`/brands/${brand.brandId}`}
                                      className="flex-1 bg-white/90 text-gray-900 px-3 py-2 rounded-md text-xs font-medium text-center hover:bg-white transition-colors"
                                    >
                                      상세보기
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 카테고리별 브랜드 섹션 */}
                {categories.map((category) => {
                  const categoryBrands = brands.filter(brand => brand.categoryName === category.categoryName);
                  if (categoryBrands.length === 0) return null;

                  return (
                    <div key={category.categoryId} className="mb-8">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-xl font-bold text-white">{category.categoryName}</h2>
                        <span className="text-sm text-gray-400">{categoryBrands.length}개</span>
                      </div>
                      <div className="relative">
                        <div className="overflow-x-auto scrollbar-hide">
                          <div className="flex space-x-4 pb-2">
                            {categoryBrands.map((brand) => {
                              const isMyBrand = user?.role === 'MANAGER' && user.name && brand.managerName === user.name;
                              const isSaved = savingStates[brand.brandId];
                              
                              return (
                                <div
                                  key={brand.brandId}
                                  className="flex-shrink-0 w-64 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 border border-gray-700/30"
                                >
                                  <div className="p-3">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                          <span className="text-white text-lg font-bold">
                                            {brand.brandName?.charAt(0) || 'B'}
                                          </span>
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
                                      <div className="flex items-center text-gray-400 text-xs">
                                        <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                                        조회: {brand.viewCount || 0} | 찜: {brand.saveCount || 0}
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Link
                                        href={`/brands/${brand.brandId}`}
                                        className="flex-1 bg-white/90 text-gray-900 px-3 py-2 rounded-md text-xs font-medium text-center hover:bg-white transition-colors"
                                      >
                                        상세보기
                                      </Link>
                                      {user?.role !== 'MANAGER' && (
                                        <button 
                                          onClick={() => handleToggleSave(brand.brandId)}
                                          className={`flex-shrink-0 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                            isSaved 
                                              ? 'bg-red-600 text-white hover:bg-red-700' 
                                              : 'bg-gray-600/80 text-gray-300 hover:bg-gray-500'
                                          }`}
                                        >
                                          {isSaved ? '♥' : '♡'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </AuthGuard>
  );
} 
