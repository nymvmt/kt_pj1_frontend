'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userBrandAPI, managerBrandAPI } from '@/lib/api';
import { Notification } from '@/types';
import AuthGuard from '@/components/AuthGuard';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 알림 목록 조회
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const isManager = user.role === 'MANAGER';
      const response = isManager 
        ? await managerBrandAPI.getNotifications(user.id)
        : await userBrandAPI.getNotifications(user.id);
      
      setNotifications(response.data.data.content);
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
    }
  };

  // 읽지 않은 알림 개수 조회
  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const isManager = user.role === 'MANAGER';
      const response = isManager 
        ? await managerBrandAPI.getUnreadNotificationCount(user.id)
        : await userBrandAPI.getUnreadNotificationCount(user.id);
      
      setUnreadCount(response.data.data);
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (notificationId: number) => {
    try {
      await userBrandAPI.markNotificationAsRead(notificationId);
      
      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(notification => 
          notification.notificationId === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // 읽지 않은 개수 업데이트
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchNotifications(),
        fetchUnreadCount()
      ]);
      setLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // 날짜 포맷팅
  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 상태별 스타일
  const getStatusStyle = (statusName: string) => {
    const styles = {
      'PENDING': 'bg-yellow-900/30 text-yellow-200',
      'RESCHEDULE_REQUEST': 'bg-orange-900/30 text-orange-200',
      'CONFIRMED': 'bg-green-900/30 text-green-200',
      'CANCELLED': 'bg-red-900/30 text-red-200',
    };
    return styles[statusName as keyof typeof styles] || 'bg-gray-800/60 backdrop-blur-sm text-gray-300';
  };

  if (loading) {
    return (
      <AuthGuard user={user}>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">알림을 불러오는 중...</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">알림</h1>
                <p className="text-gray-300">상담 관련 알림을 확인하세요.</p>
              </div>
              {unreadCount > 0 && (
                <div className="bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                  {unreadCount}개의 새 알림
                </div>
              )}
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v12h6V3a3 3 0 00-3-3H9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">알림이 없습니다</h3>
                <p className="text-gray-400">새로운 알림이 있으면 여기에 표시됩니다.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.notificationId} 
                  className={`rounded-lg border p-6 cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' 
                      : 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/40'
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.notificationId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                        <span className="text-sm text-gray-400">
                          {notification.brandName || notification.userName || '알림'}
                        </span>
                        {notification.statusName && (
                          <span className={`text-xs px-2 py-1 rounded ${getStatusStyle(notification.statusName)}`}>
                            {notification.statusName === 'PENDING' ? '신청 중' :
                             notification.statusName === 'RESCHEDULE_REQUEST' ? '일정 조정 중' :
                             notification.statusName === 'CONFIRMED' ? '확정' :
                             notification.statusName === 'CANCELLED' ? '취소' :
                             notification.statusName}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm ${notification.isRead ? 'text-gray-300' : 'text-white font-medium'}`}>
                        {notification.message}
                      </p>
                    </div>
                    
                    <span className="text-xs text-gray-500 ml-4">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}