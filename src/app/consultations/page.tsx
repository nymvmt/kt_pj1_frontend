'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userBrandAPI } from '@/lib/api';
import { Consultation, UserResponseType } from '@/types';
import AuthGuard from '@/components/AuthGuard';

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'reschedule'>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 전체 상담 목록 조회
  const fetchConsultations = async (pageNum: number = 0, append: boolean = false) => {
    if (!user?.id) return;

    try {
      const response = await userBrandAPI.getConsultations(user.id, pageNum, 10);
      const newConsultations = response.data.data.content;
      
      if (append) {
        setConsultations(prev => [...prev, ...newConsultations]);
      } else {
        setConsultations(newConsultations);
      }
      
      setHasMore(!response.data.data.pageInfo.last);
    } catch (error) {
      console.error('상담 목록 조회 실패:', error);
    }
  };

  // 일정 조정 요청 목록 조회
  const fetchRescheduleRequests = async () => {
    if (!user?.id) return;

    try {
      const response = await userBrandAPI.getRescheduleRequests(user.id);
      setRescheduleRequests(response.data.data);
    } catch (error) {
      console.error('일정 조정 요청 목록 조회 실패:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchConsultations(0),
        fetchRescheduleRequests()
      ]);
      setLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // 더 보기
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchConsultations(nextPage, true);
  };

  // 일정 조정 응답
  const handleRescheduleResponse = async (consultationId: number, response: UserResponseType) => {
    if (!user?.id) return;

    try {
      await userBrandAPI.respondToReschedule(consultationId, { userResponse: response }, user.id);
      
      const action = response === 'ACCEPT' ? '수락' : '거절';
      alert(`일정 조정을 ${action}했습니다.`);
      
      // 데이터 새로고침
      await Promise.all([
        fetchConsultations(0),
        fetchRescheduleRequests()
      ]);
      setPage(0);
      
    } catch (error) {
      console.error('일정 조정 응답 실패:', error);
      alert('응답 처리에 실패했습니다.');
    }
  };

  // 상담 취소
  const handleCancelConsultation = async (consultationId: number) => {
    if (!user?.id) return;
    
    if (!confirm('상담을 취소하시겠습니까?')) return;

    try {
      await userBrandAPI.cancelConsultation(consultationId, user.id);
      alert('상담이 취소되었습니다.');
      
      // 데이터 새로고침
      await Promise.all([
        fetchConsultations(0),
        fetchRescheduleRequests()
      ]);
      setPage(0);
      
    } catch (error) {
      console.error('상담 취소 실패:', error);
      alert('상담 취소에 실패했습니다.');
    }
  };

  // 상태별 스타일
  const getStatusStyle = (statusName: string) => {
    const styles = {
      'PENDING': 'bg-yellow-900/30 text-yellow-200 border-yellow-700',
      'RESCHEDULE_REQUEST': 'bg-orange-900/30 text-orange-200 border-orange-700',
      'CONFIRMED': 'bg-green-900/30 text-green-200 border-green-700',
      'CANCELLED': 'bg-gray-800 text-gray-300 border-gray-600',
    };
    return styles[statusName as keyof typeof styles] || 'bg-gray-800 text-gray-300';
  };

  // 상태별 표시 텍스트
  const getStatusText = (statusName: string) => {
    const texts = {
      'PENDING': '신청 중',
      'RESCHEDULE_REQUEST': '일정 조정 중',
      'CONFIRMED': '확정',
      'CANCELLED': '취소',
    };
    return texts[statusName as keyof typeof texts] || statusName;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 날짜 시간 포맷팅
  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AuthGuard user={user}>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">상담 내역을 불러오는 중...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard user={user}>
      <div className="min-h-screen bg-slate-950 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">상담 관리</h1>
            <p className="text-gray-300">창업 상담 신청 내역과 일정을 확인하고 관리하세요.</p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 mb-6 bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              전체 상담 ({consultations.length})
            </button>
            <button
              onClick={() => setActiveTab('reschedule')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
                activeTab === 'reschedule'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              일정 조정 요청 ({rescheduleRequests.length})
              {rescheduleRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {rescheduleRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* 전체 상담 목록 */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.472L3 21l2.728-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">아직 신청한 상담이 없습니다</h3>
                  <p className="text-gray-400 mb-4">관심 있는 브랜드에 상담을 신청해보세요.</p>
                  <a
                    href="/brands"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    브랜드 둘러보기
                  </a>
                </div>
              ) : (
                <>
                  {consultations.map((consultation) => (
                    <div key={consultation.consultationId} className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {consultation.brand.brandName}
                          </h3>
                          <span className="text-sm text-gray-400">{consultation.brand.categoryName}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(consultation.status.statusName)}`}>
                          {getStatusText(consultation.status.statusName)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">희망 상담일</p>
                          <p className="font-medium text-white">
                            {formatDate(consultation.preferredDate)} {consultation.preferredTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">신청일</p>
                          <p className="font-medium text-white">{formatDateTime(consultation.createdAt)}</p>
                        </div>
                      </div>

                      {consultation.status.statusName === 'CONFIRMED' && consultation.confirmedAt && (
                        <div className="bg-green-900/20 border border-green-700 rounded-md p-3 mb-4">
                          <p className="text-sm text-green-200">
                            ✅ 상담이 확정되었습니다. 확정일: {formatDateTime(consultation.confirmedAt)}
                          </p>
                        </div>
                      )}

                      {/* 일정 조정 정보 */}
                      {consultation.adjustedDate && consultation.adjustedTime && (
                        <div className="bg-orange-900/20 border border-orange-700 rounded-md p-3 mb-4">
                          <p className="text-sm text-orange-200 font-medium mb-2">일정 조정 내역</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-orange-300">기존 희망 일정</p>
                              <p className="text-sm text-orange-100">
                                {formatDate(consultation.preferredDate)} {consultation.preferredTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-orange-300">조정된 일정</p>
                              <p className="text-sm text-orange-100">
                                {formatDate(consultation.adjustedDate)} {consultation.adjustedTime}
                              </p>
                            </div>
                          </div>
                          {consultation.adjustmentReason && (
                            <div className="mt-2">
                              <p className="text-xs text-orange-300">조정 사유</p>
                              <p className="text-sm text-orange-100">{consultation.adjustmentReason}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {consultation.managerNote && (
                        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 shadow-lg rounded-md p-3 mb-4">
                          <p className="text-sm text-gray-400 mb-1">매니저 메모</p>
                          <p className="text-sm text-gray-200">{consultation.managerNote}</p>
                        </div>
                      )}

                      {consultation.status.statusName === 'PENDING' && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleCancelConsultation(consultation.consultationId)}
                            className="px-4 py-2 text-sm text-red-400 border border-red-600 rounded-md hover:bg-red-900/20"
                          >
                            상담 취소
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {hasMore && (
                    <div className="text-center">
                      <button
                        onClick={loadMore}
                        className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                      >
                        더 보기
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 일정 조정 요청 목록 */}
          {activeTab === 'reschedule' && (
            <div className="space-y-4">
              {rescheduleRequests.length === 0 ? (
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">일정 조정 요청이 없습니다</h3>
                  <p className="text-gray-400">매니저로부터 일정 조정 요청이 오면 여기에 표시됩니다.</p>
                </div>
              ) : (
                rescheduleRequests.map((consultation) => (
                  <div key={consultation.consultationId} className="bg-gray-900 border border-orange-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {consultation.brand.brandName}
                        </h3>
                        <span className="text-sm text-gray-400">{consultation.brand.categoryName}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-900/30 text-orange-200 border border-orange-700">
                        일정 조정 요청
                      </span>
                    </div>

                    <div className="bg-orange-900/20 border border-orange-700 rounded-md p-4 mb-4">
                      <h4 className="font-medium text-orange-200 mb-2">매니저가 다음 일정을 제안했습니다:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-orange-300">기존 희망 일정</p>
                          <p className="font-medium text-orange-100">
                            {formatDate(consultation.preferredDate)} {consultation.preferredTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-300">조정 제안 일정</p>
                          <p className="font-medium text-orange-100">
                            {consultation.adjustedDate && formatDate(consultation.adjustedDate)} {consultation.adjustedTime}
                          </p>
                        </div>
                      </div>
                      
                      {consultation.adjustmentReason && (
                        <div className="mt-3">
                          <p className="text-sm text-orange-300">조정 사유</p>
                          <p className="text-sm text-orange-100 mt-1">{consultation.adjustmentReason}</p>
                        </div>
                      )}
                    </div>

                    {consultation.managerNote && (
                      <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 shadow-lg rounded-md p-3 mb-4">
                        <p className="text-sm text-gray-400 mb-1">매니저 메모</p>
                        <p className="text-sm text-gray-200">{consultation.managerNote}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRescheduleResponse(consultation.consultationId, 'ACCEPT')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        제안된 일정으로 확정
                      </button>
                      <button
                        onClick={() => handleRescheduleResponse(consultation.consultationId, 'REJECT')}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        거절 (상담 취소)
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}