'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { brandAPI, userBrandAPI } from '@/lib/api';
import { BrandDetail, ConsultationCreateRequest } from '@/types';
import ConsultationModal from '@/components/ConsultationModal';

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = parseInt(params.id as string);
  
  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showConsultationModal, setShowConsultationModal] = useState(false);

  // 브랜드 상세 정보 조회
  const fetchBrandDetail = async () => {
    try {
      setLoading(true);
      const response = await brandAPI.getBrandDetail(brandId);
      setBrand(response.data);
      setError(null);
    } catch (err) {
      console.error('브랜드 상세 조회 실패:', err);
      setError('브랜드 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상담 신청 모달 열기
  const handleOpenConsultationModal = () => {
    setShowConsultationModal(true);
  };

  // 브랜드 저장/해제
  const handleToggleSaved = async () => {
    try {
      await userBrandAPI.toggleSavedBrand(brandId);
      // 브랜드 정보 새로고침
      fetchBrandDetail();
    } catch (err: any) {
      console.error('브랜드 저장/해제 실패:', err);
      alert(err.response?.data?.message || '작업에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (brandId) {
      fetchBrandDetail();
    }
  }, [brandId]);

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
        {/* 브랜드 헤더 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {brand.imageUrl && (
            <div className="h-64 bg-gray-200">
              <img
                src={brand.imageUrl}
                alt={brand.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {brand.category.name}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{brand.name}</h1>
                <p className="text-lg text-gray-600">{brand.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleSaved}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    brand.savedCount > 0
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {brand.savedCount > 0 ? '저장 해제' : '저장'}
                </button>
                                        <button
                          onClick={handleOpenConsultationModal}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                          상담 신청
                        </button>
              </div>
            </div>

            {/* 브랜드 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{brand.stats.viewCount}</div>
                <div className="text-sm text-gray-600">조회수</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{brand.stats.savedCount}</div>
                <div className="text-sm text-gray-600">저장수</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{brand.stats.consultationCount}</div>
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
          brandName={brand?.name || ''}
        />

        {/* 생성일 정보 */}
        <div className="text-center text-sm text-gray-500">
          생성일: {new Date(brand.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
