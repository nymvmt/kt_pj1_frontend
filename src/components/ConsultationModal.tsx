'use client';

import { useState } from 'react';
import { userBrandAPI } from '@/lib/api';
import { ConsultationCreateRequest } from '@/types';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: number;
  brandName: string;
}

export default function ConsultationModal({ isOpen, onClose, brandId, brandName }: ConsultationModalProps) {
  const [formData, setFormData] = useState<ConsultationCreateRequest>({
    brandId,
    message: '',
  });
  const [desiredDate, setDesiredDate] = useState('');
  const [desiredTime, setDesiredTime] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desiredDate || !desiredTime || !formData.message.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await userBrandAPI.createConsultation({
        ...formData,
        message: `${formData.message}\n\n희망 상담일: ${desiredDate}\n희망 시간: ${desiredTime}`
      });
      
      alert('상담 신청이 완료되었습니다.');
      onClose();
      setFormData({ brandId, message: '' });
      setDesiredDate('');
      setDesiredTime('');
    } catch (err: any) {
      console.error('상담 신청 실패:', err);
      alert(err.response?.data?.message || '상담 신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({ brandId, message: '' });
      setDesiredDate('');
      setDesiredTime('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">창업 상담 신청</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 선택한 브랜드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선택한 브랜드
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {brandName}
            </div>
          </div>

          {/* 희망 상담일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 희망 상담일
            </label>
            <div className="relative">
              <input
                type="date"
                value={desiredDate}
                onChange={(e) => setDesiredDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 희망 시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🕐 희망 시간
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setDesiredTime(time)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                    desiredTime === time
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* 상담 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상담 내용
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              placeholder="상담하고 싶은 내용을 자세히 작성해주세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '신청 중...' : '상담 신청'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
