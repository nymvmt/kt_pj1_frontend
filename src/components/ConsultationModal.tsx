'use client';

import { useState } from 'react';
import { userBrandAPI } from '@/lib/api';
import { ConsultationCreateRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: number;
  brandName: string;
}

export default function ConsultationModal({ isOpen, onClose, brandId, brandName }: ConsultationModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ConsultationCreateRequest>({
    userId: 0, // 초기값, handleSubmit에서 실제 값으로 설정
    brandId,
    preferredDate: '',
    preferredTime: '',
  });
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00'
  ];

  // 오늘 이후 날짜만 선택 가능하도록 최소 날짜 설정 (여유있게 2일 후부터)
  const today = new Date();
  today.setDate(today.getDate() + 2); // 모레부터 선택 가능 (시간대 문제 방지)
  const minDate = today.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!formData.preferredDate || !formData.preferredTime) {
      alert('희망 날짜와 시간을 모두 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      // userId를 실제 사용자 ID로 설정하고 시간 형식 수정
      const requestData = {
        ...formData,
        userId: user.id,
        preferredTime: formData.preferredTime + ':00' // HH:MM:SS 형식으로 변경
      };
      
      console.log('상담 신청 요청 데이터:', requestData);
      
      await userBrandAPI.createConsultation(requestData, user.id);
      
      alert('상담 신청이 완료되었습니다. 매니저가 검토 후 연락드리겠습니다.');
      onClose();
      
      // 폼 초기화
      setFormData({
        userId: 0,
        brandId,
        preferredDate: '',
        preferredTime: '',
      });
    } catch (err: any) {
      console.error('상담 신청 실패:', err);
      console.error('응답 데이터:', err.response?.data);
      
      let errorMessage = '상담 신청에 실패했습니다.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // 중복 신청 등의 비즈니스 로직 오류
        if (errorData.errorCode === 'CONSULTATION_DUPLICATE') {
          errorMessage = errorData.message || '이미 해당 브랜드에 진행 중인 상담이 있습니다.';
        } 
        // 파라미터 오류
        else if (errorData.errorCode === 'INVALID_PARAMETER') {
          errorMessage = errorData.message || '입력 정보를 확인해주세요.';
        }
        // validation 에러인 경우 필드별 에러 메시지 표시
        else if (errorData.data && typeof errorData.data === 'object') {
          const validationErrors = errorData.data;
          const errorMessages = Object.entries(validationErrors).map(([field, message]) => `${field}: ${message}`);
          errorMessage = `입력 데이터 검증 실패:\n${errorMessages.join('\n')}`;
        } 
        // 일반 오류 메시지
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // 서버 오류
        else if (errorData.errorCode === 'INTERNAL_ERROR') {
          errorMessage = '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      } 
      // HTTP 상태 코드별 처리
      else if (err.response?.status === 400) {
        errorMessage = '입력하신 정보를 다시 확인해주세요.';
      } else if (err.response?.status === 401) {
        errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
      } else if (err.response?.status === 403) {
        errorMessage = '권한이 없습니다.';
      } else if (err.response?.status === 500) {
        errorMessage = '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (!err.response) {
        errorMessage = '네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({
        userId: 0,
        brandId,
        preferredDate: '',
        preferredTime: '',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/40 shadow-2xl rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">창업 상담 신청</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 선택한 브랜드 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              선택한 브랜드
            </label>
            <div className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white font-medium">
              {brandName}
            </div>
          </div>

          {/* 희망 상담일 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              희망 상담일 *
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              min={minDate}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">모레부터 선택 가능합니다.</p>
          </div>

          {/* 희망 시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              희망 시간 *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFormData({ ...formData, preferredTime: time })}
                  className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                    formData.preferredTime === time
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              선택하신 시간으로 상담 일정을 조율해드립니다.
            </p>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-sm border border-indigo-700/60 rounded-md p-4">
            <div className="flex">
              <div className="text-indigo-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-indigo-200">
                  <strong>상담 진행 과정</strong>
                </p>
                <ul className="mt-2 text-xs text-indigo-300 space-y-1">
                  <li>• 신청 후 브랜드 매니저가 검토</li>
                  <li>• 일정 확정 또는 조정 요청</li>
                  <li>• 최종 상담 일정 확정</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              {loading ? '신청 중...' : '상담 신청'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}