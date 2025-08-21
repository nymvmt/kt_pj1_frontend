'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userBrandAPI } from '@/lib/api';
import { Consultation } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inProgress' | 'completed' | 'cancelled'>('inProgress');

  // 상담 이력 조회 (임시 데이터)
  const fetchConsultations = () => {
    // 실제 API 연동 시에는 userBrandAPI.getConsultations 사용
    const tempConsultations: Consultation[] = [
      {
        id: 1,
        brand: {
          id: 1,
          name: '맥도날드',
          description: '전 세계적으로 인정받는 패스트푸드 프랜차이즈',
          category: { id: 1, name: '외식' },
          createdAt: '2025-01-15',
          updatedAt: '2025-01-15'
        },
        user: { id: 1, email: 'user@example.com', name: '사용자', role: 'USER', createdAt: '2025-01-01' },
        message: '창업 비용과 수익성에 대해 자세히 알고 싶습니다.',
        status: { id: 1, name: '예약 확정' },
        createdAt: '2025-01-15',
        updatedAt: '2025-01-20'
      },
      {
        id: 2,
        brand: {
          id: 2,
          name: '스타벅스',
          description: '프리미엄 커피 브랜드',
          category: { id: 1, name: '외식' },
          createdAt: '2025-01-10',
          updatedAt: '2025-01-10'
        },
        user: { id: 1, email: 'user@example.com', name: '사용자', role: 'USER', createdAt: '2025-01-01' },
        message: '매장 위치 선정 관련 상담 희망',
        status: { id: 2, name: '조정 요청 중' },
        createdAt: '2025-01-10',
        updatedAt: '2025-01-18'
      }
    ];
    
    setConsultations(tempConsultations);
    setLoading(false);
  };

  // 상담 취소
  const handleCancelConsultation = (consultationId: number) => {
    if (confirm('정말로 이 상담을 취소하시겠습니까?')) {
      setConsultations(prev => prev.filter(c => c.id !== consultationId));
    }
  };

  // 상담 응답
  const handleRespondConsultation = (consultationId: number) => {
    // 상담 응답 로직 구현
    alert('상담 응답 기능이 구현되었습니다.');
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '예약 확정': return 'text-green-600';
      case '조정 요청 중': return 'text-orange-600';
      case '완료': return 'text-blue-600';
      case '취소': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '예약 확정': return '🟢';
      case '조정 요청 중': return '🟠';
      case '완료': return '🔵';
      case '취소': return '🔴';
      default: return '⚪';
    }
  };

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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">상담 이력</h2>
            
            {/* 상태별 탭 */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('inProgress')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'inProgress'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                진행중: 3건
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                완료: 2건
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'cancelled'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                취소: 1건
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">상담 이력을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchConsultations()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <p className="text-gray-600 mb-4">아직 상담 이력이 없습니다.</p>
              <Link
                href="/brands"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                브랜드 둘러보기
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 브랜드 정보 */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {consultation.brand.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            브랜드명: {consultation.brand.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            신청일: {new Date(consultation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* 상담 정보 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            상담일시: {new Date(consultation.updatedAt).toLocaleDateString()} {consultation.status.name === '예약 확정' ? '14:00' : '16:00'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getStatusColor(consultation.status.name)}`}>
                            {getStatusIcon(consultation.status.name)} 상태: {consultation.status.name}
                          </span>
                        </div>
                      </div>

                      {/* 매니저 노트 */}
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">👤 매니저 노트</span>
                        </div>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          {consultation.status.name === '예약 확정' 
                            ? '가능한 시간대 확인 필요'
                            : '다른 시간대 제안'
                          }
                        </p>
                      </div>

                      {/* 문의사항 */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">📄 문의사항</span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">
                          {consultation.message}
                        </p>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {consultation.status.name === '예약 확정' ? (
                        <>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            상세보기
                          </button>
                          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                            일정변경
                          </button>
                        </>
                      ) : consultation.status.name === '조정 요청 중' ? (
                        <>
                          <button 
                            onClick={() => handleRespondConsultation(consultation.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            응답하기
                          </button>
                          <button 
                            onClick={() => handleCancelConsultation(consultation.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            취소하기
                          </button>
                        </>
                      ) : (
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                          상세보기
                        </button>
                      )}
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
