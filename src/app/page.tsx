'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { publicBrandAPI, userBrandAPI } from '@/lib/api';
import { Brand } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import YouTubePlayer, { getYouTubeApiKey } from '@/components/YouTubePlayer';

export default function Home() {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStates, setSavingStates] = useState<{[key: number]: boolean}>({});


  // 브랜드 목록 조회
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await publicBrandAPI.getPublicBrands(0, 1000); // 모든 브랜드 조회
      
      // ApiResponse로 감싸진 응답에서 data 추출
      if (!response.data.success) {
        throw new Error(response.data.message || '브랜드 목록을 불러오는데 실패했습니다.');
      }
      
      const data: Brand[] = response.data.data;
      setBrands(data);
      
      // 로그인한 사용자의 경우 찜 상태도 조회
      if (user?.id && data.length > 0) {
        const brandIds = data.map(brand => brand.brandId);
        await fetchBrandSaveStatus(brandIds);
      }
      
      setError(null);
    } catch (err) {
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



  // 찜하기 토글 함수
  const handleToggleSave = async (brandId: number) => {
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    const currentIsSaved = savingStates[brandId] || false;
    const newIsSaved = !currentIsSaved;

    try {
      // 낙관적 업데이트
      setSavingStates(prev => ({ ...prev, [brandId]: newIsSaved }));
      
      const response = await userBrandAPI.toggleSavedBrand(brandId, user.id);
      
      if (!response.data.success) {
        // 실패 시 원래 상태로 되돌리기
        setSavingStates(prev => ({ ...prev, [brandId]: currentIsSaved }));
        alert('찜하기 처리에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('찜하기 토글 실패:', err);
      // 실패 시 원래 상태로 되돌리기
      setSavingStates(prev => ({ ...prev, [brandId]: currentIsSaved }));
      alert('찜하기 처리에 실패했습니다.');
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchBrands();
  }, [user?.id]); // user가 변경될 때마다 다시 로드



  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* IPTV 헤더 */}
      <div className="bg-slate-900/95 backdrop-blur-sm text-white p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">프랜차이즈TV</h1>
            <p className="text-sm text-gray-300">성공 창업의 시작</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span>21:36</span>
            <span>Ch.887</span>
            <div className="w-6 h-6 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 - 남은 공간 전체 차지 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 영상 플레이어 영역 - 네비게이션 바 높이 고려 */}
        <div className="h-[calc(100vh-7rem)] relative group hover:cursor-pointer"
             onTouchStart={() => {}} // 모바일 터치 지원
        >
          <YouTubePlayer 
            videoId="DHDRltPtP4I" // 창업 관련 비디오 ID
            apiKey={getYouTubeApiKey()}
            className="w-full h-full"
          />
          
          {/* 최소화된 오버레이 (기본 상태) */}
          <div className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:translate-y-full pointer-events-none pb-10">
            <div className="bg-gradient-to-t from-black/60 to-transparent p-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white drop-shadow-lg">추천 브랜드</h2>
                <div className="flex items-center space-x-2 text-white/70 text-sm animate-pulse">
                  <span>브랜드 보기</span>
                  <div className="w-6 h-6 border-2 border-white/70 rounded-full flex items-center justify-center">
                    <span className="text-xs">⬆</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 전체 오버레이 (호버 상태) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8 pb-10 transition-all duration-500 ease-in-out opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white drop-shadow-lg">추천 브랜드</h2>
              <Link 
                href="/brands" 
                className="text-blue-400 hover:text-blue-300 text-sm font-medium drop-shadow-lg"
              >
                전체보기 →
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-400 mb-2 text-sm">{error}</p>
                <button
                  onClick={() => fetchBrands()}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  다시 시도
                </button>
              </div>
            ) : brands && brands.length > 0 ? (
              <div className="relative">
                {/* 가로 스크롤 컨테이너 */}
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex space-x-4 pb-2">
                    {brands.map((brand, index) => {
                      const isSaved = savingStates[brand.brandId] || false;
                      return (
                        <div
                          key={brand.brandId}
                          className="flex-shrink-0 w-64 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md rounded-lg overflow-hidden shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 border border-gray-700/20"
                        >
                          {/* 브랜드 정보 */}
                          <div className="p-3">
                            {/* 헤더 영역 */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-lg font-bold">
                                    {brand.brandName?.charAt(0) || 'B'}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs bg-blue-600/80 text-blue-100 px-2 py-1 rounded">
                                {brand.categoryName || '카테고리'}
                              </span>
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
                                <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                                평균매출액: {brand.avgMonthlyRevenue ? brand.avgMonthlyRevenue.toLocaleString() : '정보없음'}원
                              </div>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex space-x-2">
                              <Link
                                href={`/brands/${brand.brandId}`}
                                className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 text-gray-900 px-3 py-2 rounded-md text-xs font-medium text-center hover:from-white hover:to-slate-100 transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                상세보기
                              </Link>
                              {user && user.role !== 'MANAGER' && (
                                <button 
                                  onClick={() => handleToggleSave(brand.brandId)}
                                  className={`flex-shrink-0 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                                    isSaved 
                                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-lg transform hover:scale-105' 
                                      : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
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
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">등록된 브랜드가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
