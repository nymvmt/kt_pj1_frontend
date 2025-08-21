'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { publicBrandAPI, userBrandAPI, managerBrandAPI } from '@/lib/api';
import { Brand, BrandCategory } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

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
      
      setBrands(data);
      
      // 매니저가 아닌 로그인한 사용자인 경우만 찜 상태 조회
      if (user && user.role !== 'MANAGER' && user.id && data.length > 0) {
        await fetchBrandSaveStatus(data.map(brand => brand.brandId));
      } else {
        // 매니저이거나 로그인하지 않은 경우 모든 브랜드를 찜하지 않은 상태로 설정
        const savedStates: { [key: number]: boolean } = {};
        data.forEach(brand => {
          savedStates[brand.brandId] = false;
        });
        setSavingStates(savedStates);
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
      setSavingStates(prev => ({
        ...prev,
        [brandId]: !prev[brandId]
      }));
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
          {/* 매니저용 브랜드 추가 버튼 */}
          {user?.role === 'MANAGER' && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">브랜드 관리</h2>
                  <p className="text-sm text-gray-600">새로운 브랜드를 등록하여 관리하세요</p>
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
                  key={category.categoryId}
                  onClick={() => handleCategorySelect(category.categoryId)}
                  className={`p-4 rounded-lg text-center transition-colors ${
                    selectedCategory === category.categoryId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {category.categoryName === '외식' ? '🍽️' : 
                     category.categoryName === '뷰티' ? '💄' :
                     category.categoryName === '교육' ? '📚' :
                     category.categoryName === '편의점' ? '🏪' : '🏠'}
                  </div>
                  <div className="text-sm font-medium">{category.categoryName}</div>
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategory 
                    ? `${categories.find(c => c.categoryId === selectedCategory)?.categoryName} 브랜드`
                    : '전체 브랜드'
                  }
                </h2>
                {user?.role === 'MANAGER' && (
                  <p className="text-sm text-blue-600 mt-1">
                    💡 내 브랜드가 상단에 강조표시됩니다
                  </p>
                )}
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {brands.map((brand) => {
                  // 현재 로그인한 매니저가 관리하는 브랜드인지 확인 (managerName으로 비교)
                  const isMyBrand = user?.role === 'MANAGER' && user.name && brand.managerName === user.name;
                  
                  return (
                    <div
                      key={brand.brandId}
                      className={`rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${
                        isMyBrand
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg transform scale-[1.02]' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {brand.categoryName}
                          </span>
                          {isMyBrand && (
                            <span className="inline-block px-3 py-1 text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full shadow-md animate-pulse">
                              ⭐ 내 브랜드
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>👁️ {brand.viewCount || 0}</span>
                          <span>❤️ {brand.saveCount || 0}</span>
                        </div>
                      </div>
                      
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isMyBrand
                          ? 'text-blue-800 text-xl font-bold' 
                          : 'text-gray-900'
                      }`}>
                        {isMyBrand && '🔥 '}{brand.brandName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        매니저: {brand.managerName} | 초기비용: {brand.initialCost ? brand.initialCost.toLocaleString() : '정보없음'}원
                      </p>
                    
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          월 평균 매출: {brand.avgMonthlyRevenue ? brand.avgMonthlyRevenue.toLocaleString() : '정보없음'}원
                        </span>
                        <div className="flex gap-2">
                          <Link
                            href={`/brands/${brand.brandId}`}
                            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            상세보기
                          </Link>
                          {/* 매니저가 아닌 경우에만 찜하기 버튼 표시 */}
                          {user?.role !== 'MANAGER' && (
                            <button 
                              onClick={() => handleToggleSave(brand.brandId)}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                savingStates[brand.brandId]
                                  ? 'bg-red-600 text-white hover:bg-red-700' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {savingStates[brand.brandId] ? '찜해제' : '찜하기'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 
