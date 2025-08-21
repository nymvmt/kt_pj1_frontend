'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { publicBrandAPI, userBrandAPI, managerBrandAPI } from '@/lib/api';
import { BrandDetail } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ConsultationModal from '@/components/ConsultationModal';

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = Number(params.id);
  const { user } = useAuth();
  
  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});

  // 브랜드 상세 정보 조회
  const fetchBrandDetail = async () => {
    try {
      setLoading(true);
      const response = await publicBrandAPI.getBrandDetail(brandId);
      
      if (!response.data.success) {
        throw new Error(response.data.message || '브랜드 정보를 불러오는데 실패했습니다.');
      }
      
      setBrand(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('브랜드 상세 조회 실패:', err);
      setError(err.response?.data?.message || '브랜드 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 찜 상태 조회
  const fetchBrandSaveStatus = async () => {
    if (!user || !user.id) {
      return;
    }
    
    try {
      const response = await userBrandAPI.getBrandSaveStatus([brandId], user.id);
      
      if (response.data.success) {
        const saveStatus = response.data.data;
        setSavingStates(saveStatus);
        
        // 브랜드 정보의 찜 상태도 업데이트
        setBrand(prev => prev ? {
          ...prev,
          isSaved: saveStatus[brandId] || false
        } : null);
      }
    } catch (err) {
      console.error('찜 상태 조회 실패:', err);
    }
  };

  // 상담 신청 모달 열기
  const handleOpenConsultationModal = () => {
    setShowConsultationModal(true);
  };

  // 찜하기 토글
  const handleToggleSave = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 함수 시작 부분에서 상태 캡처
    const currentIsSaved = brand?.isSaved || false;
    const newIsSaved = !currentIsSaved;

    console.log('찜하기 토글:', { brandId, currentIsSaved, newIsSaved, userId: user.id });

    try {
      // 낙관적 업데이트
      setSavingStates(prev => ({ ...prev, [brandId]: newIsSaved }));
      
      const response = await userBrandAPI.toggleSavedBrand(brandId, user.id);
      
      if (response.data.success) {
        // 성공 시 브랜드 정보 업데이트
        setBrand(prev => prev ? {
          ...prev,
          isSaved: newIsSaved,
          saveCount: newIsSaved ? (prev.saveCount || 0) + 1 : Math.max((prev.saveCount || 0) - 1, 0)
        } : null);
      } else {
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

  // 브랜드 삭제 (매니저용)
  const handleDeleteBrand = async (brandId: number, brandName: string) => {
    if (!confirm(`정말로 "${brandName}" 브랜드를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await managerBrandAPI.deleteBrand(brandId, user!.id);
      
      const responseData = response.data as any;
      if (responseData.success) {
        alert('브랜드가 성공적으로 삭제되었습니다.');
        // 매니저 페이지로 리다이렉트
        window.location.href = '/manager';
      } else {
        alert('브랜드 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('브랜드 삭제 실패:', err);
      alert('브랜드 삭제에 실패했습니다.');
    }
  };



  useEffect(() => {
    if (brandId) {
      fetchBrandDetail();
    }
  }, [brandId]);

  useEffect(() => {
    if (brand && user) {
      fetchBrandSaveStatus();
    }
  }, [brand, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">브랜드 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '브랜드를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-4">
          <Link
            href={user?.role === 'MANAGER' ? '/manager' : '/brands'}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {user?.role === 'MANAGER' ? '브랜드 관리' : '브랜드 목록'}으로 돌아가기
          </Link>
        </div>
        
        {/* 브랜드 헤더 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {brand.imageUrl && (
            <div className="h-64 bg-gray-200">
              <img
                src={brand.imageUrl}
                alt={brand.brandName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {brand.category?.name || brand.categoryName}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{brand.brandName}</h1>
                <p className="text-lg text-gray-600">{brand.brandDescription || '설명이 없습니다.'}</p>
              </div>
              {/* 일반 사용자만 찜하기와 상담신청 버튼 표시 */}
              {user && user.role !== 'MANAGER' && (
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleSave}
                    disabled={false}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      brand.isSaved
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {brand.isSaved ? '찜해제' : '찜하기'}
                  </button>
                  <button
                    onClick={handleOpenConsultationModal}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    상담 신청
                  </button>
                </div>
              )}
              
              {/* 매니저인 경우 수정/삭제 버튼 표시 */}
              {user && user.role === 'MANAGER' && (
                <div className="flex gap-3">
                  <Link
                    href={`/manager/brands/${brandId}/edit`}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDeleteBrand(brandId, brand.brandName)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {/* 브랜드 상세 정보 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">브랜드 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">가맹비</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {brand.initialCost ? brand.initialCost.toLocaleString() : '정보없음'}원
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">총 창업비용</div>
                  <div className="text-lg font-semibold text-green-600">
                    {brand.totalInvestment ? brand.totalInvestment.toLocaleString() : '정보없음'}원
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">월 평균 매출</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {brand.avgMonthlyRevenue ? brand.avgMonthlyRevenue.toLocaleString() : '정보없음'}원
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">매장수</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {brand.storeCount ? `${brand.storeCount}개` : '정보없음'}
                  </div>
                </div>
              </div>
            </div>

            {/* 브랜드 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{brand.viewCount || 0}</div>
                <div className="text-sm text-gray-600">조회수</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{brand.saveCount || 0}</div>
                <div className="text-sm text-gray-600">저장수</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{brand.consultationCount || 0}</div>
                <div className="text-sm text-gray-600">상담수</div>
              </div>
            </div>

            {/* 추가 정보 */}
            {(brand.websiteUrl || brand.contactInfo) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">연락처 정보</h3>
                <div className="space-y-2">
                  {brand.websiteUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">웹사이트:</span>
                      <a
                        href={brand.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {brand.websiteUrl}
                      </a>
                    </div>
                  )}
                  {brand.contactInfo && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">연락처:</span>
                      <span>{brand.contactInfo}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 상담 신청 모달 */}
        <ConsultationModal
          isOpen={showConsultationModal}
          onClose={() => setShowConsultationModal(false)}
          brandId={brandId}
          brandName={brand?.brandName || ''}
        />


      </div>
    </div>
  );
}
