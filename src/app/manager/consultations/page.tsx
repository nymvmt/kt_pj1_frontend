'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { managerBrandAPI } from '@/lib/api';
import { Consultation, ConsultationRescheduleRequest } from '@/types';
import AuthGuard from '@/components/AuthGuard';

export default function ManagerConsultationsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState<ConsultationRescheduleRequest>({
    adjustedDate: '',
    adjustedTime: '',
    adjustmentReason: '',
    managerNote: '',
  });

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00'
  ];

  // 상담 목록 조회
  const fetchConsultations = async (pageNum: number = 0, append: boolean = false) => {
    if (!user?.id) return;

    try {
      const response = await managerBrandAPI.getConsultations(user.id, pageNum, 10);
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

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchConsultations(0);
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

  // 상담 확정
  const handleConfirm = async (consultationId: number) => {
    if (!user?.id) return;

    try {
      await managerBrandAPI.confirmConsultation(consultationId, user.id);
      alert('상담이 확정되었습니다.');
      await fetchConsultations(0);
      setPage(0);
    } catch (error) {
      console.error('상담 확정 실패:', error);
      alert('상담 확정에 실패했습니다.');
    }
  };

  // 일정 조정 요청
  const handleReschedule = async () => {
    if (!user?.id || !selectedConsultation) return;

    if (!rescheduleForm.adjustedDate || !rescheduleForm.adjustedTime) {
      alert('조정할 날짜와 시간을 모두 선택해주세요.');
      return;
    }

    try {
      await managerBrandAPI.rescheduleConsultation(
        selectedConsultation.consultationId, 
        rescheduleForm, 
        user.id
      );
      
      alert('일정 조정 요청을 보냈습니다.');
      setShowRescheduleModal(false);
      setSelectedConsultation(null);
      setRescheduleForm({
        adjustedDate: '',
        adjustedTime: '',
        adjustmentReason: '',
        managerNote: '',
      });
      
      await fetchConsultations(0);
      setPage(0);
    } catch (error) {
      console.error('일정 조정 요청 실패:', error);
      alert('일정 조정 요청에 실패했습니다.');
    }
  };



  // 상담 취소
  const handleCancel = async (consultationId: number) => {
    if (!user?.id) return;

    if (!confirm('상담을 취소하시겠습니까?')) return;

    try {
      await managerBrandAPI.cancelConsultation(consultationId, user.id);
      alert('상담이 취소되었습니다.');
      await fetchConsultations(0);
      setPage(0);
    } catch (error) {
      console.error('상담 취소 실패:', error);
      alert('상담 취소에 실패했습니다.');
    }
  };

  // 일정 조정 모달 열기
  const openRescheduleModal = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowRescheduleModal(true);
    
    // 오늘 이후 날짜로 기본값 설정
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRescheduleForm({
      adjustedDate: tomorrow.toISOString().split('T')[0],
      adjustedTime: '',
      adjustmentReason: '',
      managerNote: '',
    });
  };

  // 상태별 스타일
  const getStatusStyle = (statusName: string) => {
    const styles = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'RESCHEDULE_REQUEST': 'bg-orange-100 text-orange-800 border-orange-200',
      'CONFIRMED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[statusName as keyof typeof styles] || 'bg-gray-100 text-gray-800';
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">상담 목록을 불러오는 중...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard user={user}>
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">상담 관리</h1>
            <p className="text-gray-600">브랜드에 신청된 상담을 관리하고 일정을 조정하세요.</p>
          </div>

          {/* 통계 - 2x2 그리드로 4개 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">신청 대기</p>
                  <p className="text-2xl font-semibold text-white">
                    {consultations.filter(c => c.status.statusName === 'PENDING').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">일정 조정 중</p>
                  <p className="text-2xl font-semibold text-white">
                    {consultations.filter(c => c.status.statusName === 'RESCHEDULE_REQUEST').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">확정</p>
                  <p className="text-2xl font-semibold text-white">
                    {consultations.filter(c => c.status.statusName === 'CONFIRMED').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">취소</p>
                  <p className="text-2xl font-semibold text-white">
                    {consultations.filter(c => c.status.statusName === 'CANCELLED').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 상담 목록 */}
          <div className="space-y-4">
            {consultations.length === 0 ? (
              <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.472L3 21l2.728-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">신청된 상담이 없습니다</h3>
                <p className="text-gray-500">브랜드에 상담 신청이 들어오면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <>
                {consultations.map((consultation) => (
                  <div key={consultation.consultationId} className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {consultation.user.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(consultation.status.statusName)}`}>
                            {getStatusText(consultation.status.statusName)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>브랜드: {consultation.brand.brandName}</p>
                          <p>이메일: {consultation.user.email}</p>
                          <p>연락처: {consultation.user.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">희망 상담일</p>
                        <p className="font-medium">
                          {formatDate(consultation.preferredDate)} {consultation.preferredTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">신청일</p>
                        <p className="font-medium">{formatDateTime(consultation.createdAt)}</p>
                      </div>
                      {consultation.confirmedAt && (
                        <div>
                          <p className="text-sm text-gray-500">확정일</p>
                          <p className="font-medium">{formatDateTime(consultation.confirmedAt)}</p>
                        </div>
                      )}
                    </div>

                    {consultation.status.statusName === 'RESCHEDULE_REQUEST' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-orange-800 font-medium">
                          일정 조정 제안: {consultation.adjustedDate && formatDate(consultation.adjustedDate)} {consultation.adjustedTime}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">사용자의 응답을 기다리고 있습니다.</p>
                      </div>
                    )}

                    {/* 취소된 상담에 대한 표시 */}
                    {consultation.status.statusName === 'CANCELLED' && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-red-800 font-medium">취소된 상담</p>
                        <p className="text-xs text-red-600 mt-1">상담이 취소되었습니다.</p>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 justify-end">
                      {consultation.status.statusName === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleConfirm(consultation.consultationId)}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            즉시 확정
                          </button>
                          <button
                            onClick={() => openRescheduleModal(consultation)}
                            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                          >
                            일정 조정
                          </button>
                        </>
                      )}
                      

                      {['PENDING', 'RESCHEDULE_REQUEST', 'CONFIRMED'].includes(consultation.status.statusName) && (
                        <button
                          onClick={() => handleCancel(consultation.consultationId)}
                          className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={loadMore}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      더 보기
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 일정 조정 모달 */}
        {showRescheduleModal && selectedConsultation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-white">일정 조정 요청</h2>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-950 p-4 rounded-md">
                  <p className="text-sm text-gray-600">고객: {selectedConsultation.user.name}</p>
                  <p className="text-sm text-gray-600">
                    기존 희망일: {formatDate(selectedConsultation.preferredDate)} {selectedConsultation.preferredTime}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">조정할 날짜 *</label>
                  <input
                    type="date"
                    value={rescheduleForm.adjustedDate}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, adjustedDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">조정할 시간 *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setRescheduleForm({ ...rescheduleForm, adjustedTime: time })}
                        className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                          rescheduleForm.adjustedTime === time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-slate-950'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">조정 사유</label>
                  <textarea
                    value={rescheduleForm.adjustmentReason}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, adjustmentReason: e.target.value })}
                    rows={3}
                    placeholder="일정 조정이 필요한 사유를 입력해주세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">매니저 메모</label>
                  <textarea
                    value={rescheduleForm.managerNote}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, managerNote: e.target.value })}
                    rows={2}
                    placeholder="추가 메모사항이 있다면 입력해주세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleReschedule}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                  >
                    일정 조정 요청
                  </button>
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}