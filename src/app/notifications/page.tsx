'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
  brandName?: string;
  brandIcon?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 알림 목록 조회 (임시 데이터)
  const fetchNotifications = () => {
    const tempNotifications: Notification[] = [
      {
        id: 1,
        title: '맥도날드 상담 일정이 확정되었습니다',
        message: '상담 일정이 확정되었습니다',
        type: 'success',
        isRead: false,
        createdAt: '2025-01-20 14:00',
        timeAgo: '5분 전',
        brandName: '맥도날드',
        brandIcon: '🍔'
      },
      {
        id: 2,
        title: '스타벅스 상담 일정 조정 요청',
        message: '매니저가 다른 시간을 제안했습니다',
        type: 'warning',
        isRead: false,
        createdAt: '2025-01-18 16:00',
        timeAgo: '1시간 전',
        brandName: '스타벅스',
        brandIcon: '☕'
      },
      {
        id: 3,
        title: '네일샵 상담이 완료되었습니다',
        message: '만족도 평가를 부탁드립니다',
        type: 'info',
        isRead: true,
        createdAt: '2025-01-16 15:00',
        timeAgo: '2일 전',
        brandName: '네일샵',
        brandIcon: '💅'
      },
      {
        id: 4,
        title: '치킨집 상담 일정이 확정되었습니다',
        message: '상담 일정이 확정되었습니다',
        type: 'success',
        isRead: true,
        createdAt: '2025-01-22 10:00',
        timeAgo: '3일 전',
        brandName: '치킨집',
        brandIcon: '🍗'
      }
    ];
    
    setNotifications(tempNotifications);
    setLoading(false);
  };

  // 알림 읽음 처리
  const handleMarkAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '📅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">알림</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-red-600 font-medium">읽지 않음: {unreadCount}건</span>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-600 font-medium">전체: {notifications.length}건</span>
                <button 
                  onClick={handleMarkAllAsRead}
                  className="w-4 h-4 text-blue-600 hover:text-blue-700"
                >
                  🔄
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">알림 목록을 불러오는 중...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔔</span>
              </div>
              <p className="text-gray-600 mb-4">새로운 알림이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg p-4 transition-colors ${
                    notification.isRead 
                      ? 'bg-gray-50' 
                      : 'bg-blue-50 border-l-4 border-blue-500'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* 상태 아이콘 */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.isRead ? 'bg-gray-200' : 'bg-blue-100'
                      }`}>
                        <span className="text-lg">{getTypeIcon(notification.type)}</span>
                      </div>
                    </div>

                    {/* 브랜드 아이콘 */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">{notification.brandIcon}</span>
                      </div>
                    </div>

                    {/* 알림 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          {notification.message && (
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{notification.createdAt}</span>
                            <span className={getTypeColor(notification.type)}>
                              {notification.timeAgo}
                            </span>
                          </div>
                        </div>

                        {/* 읽지 않음 표시 */}
                        {!notification.isRead && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          읽음
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
  );
}
