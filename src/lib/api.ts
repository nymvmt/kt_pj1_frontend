import axios from 'axios';
import { 
  User, 
  Brand, 
  BrandDetail, 
  BrandCategory, 
  ApiResponse, 
  PageResponse,
  Consultation,
  ConsultationCreateRequest,
  ConsultationRescheduleRequest,
  ConsultationUserResponseRequest,
  Notification
} from '@/types';

// 백엔드 API 기본 URL
const API_BASE_URL = 'http://localhost:8080';

// axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 공개 브랜드 관련 API (인증 불필요)
export const publicBrandAPI = {
  // 공개 브랜드 목록 조회
  getPublicBrands: (page: number = 0, size: number = 10) =>
    api.get<ApiResponse<Brand[]>>(`/api/public/brands?page=${page}&size=${size}`),
  
  // 브랜드 상세 조회
  getBrandDetail: (brandId: number) =>
    api.get<ApiResponse<BrandDetail>>(`/api/public/brands/${brandId}`),
  
  // 카테고리별 브랜드 조회
  getBrandsByCategory: (categoryId: number, page: number = 0, size: number = 10) =>
    api.get<ApiResponse<Brand[]>>(`/api/public/brands/category/${categoryId}?page=${page}&size=${size}`),
  
  // 브랜드 검색
  searchBrands: (keyword: string, page: number = 0, size: number = 10) =>
    api.get<ApiResponse<Brand[]>>(`/api/public/brands/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),
    
  // 카테고리 목록 조회
  getCategories: () =>
    api.get<ApiResponse<BrandCategory[]>>('/api/public/categories'),
};

// 사용자 브랜드 관련 API (User-Id 헤더 필요)
export const userBrandAPI = {
  // 저장된 브랜드 목록
  getSavedBrands: (page: number = 0, size: number = 10, userId: number) =>
    api.get<ApiResponse<Brand[]>>(`/api/user/brands/saved?page=${page}&size=${size}`, {
      headers: { 'User-Id': userId }
    }),
  
  // 브랜드 저장/해제
  toggleSavedBrand: (brandId: number, userId: number) =>
    api.post<ApiResponse<any>>(`/api/user/brands/${brandId}/save`, {}, {
      headers: { 'User-Id': userId }
    }),
  
  // 상담 신청
  createConsultation: (consultationData: ConsultationCreateRequest, userId: number) =>
    api.post<ApiResponse<Consultation>>('/api/user/consultations', consultationData, {
      headers: { 'User-Id': userId }
    }),
  
  // 사용자 상담 목록 조회
  getConsultations: (userId: number, page: number = 0, size: number = 10) =>
    api.get<ApiResponse<PageResponse<Consultation>>>(`/api/user/consultations?page=${page}&size=${size}`, {
      headers: { 'User-Id': userId }
    }),
  
  // 일정 조정 요청 목록 조회
  getRescheduleRequests: (userId: number) =>
    api.get<ApiResponse<Consultation[]>>('/api/user/consultations/reschedule-requests', {
      headers: { 'User-Id': userId }
    }),
  
  // 일정 조정 응답 (수락/거절)
  respondToReschedule: (consultationId: number, response: ConsultationUserResponseRequest, userId: number) =>
    api.put<ApiResponse<Consultation>>(`/api/user/consultations/${consultationId}/respond`, response, {
      headers: { 'User-Id': userId }
    }),
  
  // 상담 취소
  cancelConsultation: (consultationId: number, userId: number) =>
    api.delete<ApiResponse<void>>(`/api/user/consultations/${consultationId}`, {
      headers: { 'User-Id': userId }
    }),
    
  // 사용자별 브랜드 찜 상태 조회
  getBrandSaveStatus: (brandIds: number[], userId: number) =>
    api.post<ApiResponse<{ [key: number]: boolean }>>('/api/user/brands/save-status', brandIds, {
      headers: { 'User-Id': userId }
    }),
  
  // 사용자 알림 목록 조회
  getNotifications: (userId: number, page: number = 0, size: number = 10) =>
    api.get<ApiResponse<PageResponse<Notification>>>(`/api/user/notifications?page=${page}&size=${size}`, {
      headers: { 'User-Id': userId }
    }),
  
  // 사용자 알림 읽음 처리
  markNotificationAsRead: (notificationId: number) =>
    api.put<ApiResponse<void>>(`/api/notifications/${notificationId}/read`),
  
  // 사용자 읽지 않은 알림 개수
  getUnreadNotificationCount: (userId: number) =>
    api.get<ApiResponse<number>>('/api/user/notifications/unread-count', {
      headers: { 'User-Id': userId }
    }),
};

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: (credentials: { email: string; password: string }) =>
    api.post<ApiResponse<any>>('/api/auth/user/login', credentials),
  
  // 매니저 로그인
  managerLogin: (credentials: { email: string; password: string }) =>
    api.post<ApiResponse<any>>('/api/auth/manager/login', credentials),
  
  // 유저 회원가입
  registerUser: (userData: { email: string; password: string; name: string; phone: string }) =>
    api.post('/api/auth/user/register', userData),
  
  // 매니저 회원가입
  registerManager: (userData: { 
    name: string; 
    email: string; 
    password: string; 
    phone?: string;
    brandName: string;
    categoryId: number;
    initialCost: number;
    totalInvestment: number;
    avgMonthlyRevenue: number;
    storeCount: number;
    brandDescription: string;
  }) =>
    api.post<ApiResponse<any>>('/api/auth/manager/register', userData),
};


// 브랜드매니저 관련 API
export const managerBrandAPI = {
  // 카테고리 목록 조회
  getCategories: () =>
    api.get<ApiResponse<BrandCategory[]>>('/api/manager/categories'),
    
  // 전체 브랜드 목록 조회 (매니저용 - 브랜드 추가 가능)
  getAllBrands: (managerId: number) => {
    console.log('getAllBrands API 호출:', { managerId, headers: { 'Manager-Id': managerId } });
    return api.get<ApiResponse<Brand[]>>('/api/manager/brands/public', {
      headers: { 'Manager-Id': managerId }
    });
  },
    
  // 매니저가 관리하는 브랜드 목록 조회
  getManagerBrands: (managerId: number) =>
    api.get<ApiResponse<Brand[]>>('/api/manager/brands', {
      headers: { 'Manager-Id': managerId }
    }),
    
  // 매니저가 관리하는 브랜드 상세 조회
  getManagerBrandDetail: (brandId: number, managerId: number) =>
    api.get<ApiResponse<BrandDetail>>(`/api/manager/brands/${brandId}`, {
      headers: { 'Manager-Id': managerId }
    }),
    
  // 브랜드 생성
  createBrand: (brandData: any, managerId: number) =>
    api.post('/api/manager/brands', brandData, {
      headers: { 'Manager-Id': managerId }
    }),
  
  // 브랜드 수정
  updateBrand: (brandId: number, brandData: any, managerId: number) =>
    api.put(`/api/manager/brands/${brandId}`, brandData, {
      headers: { 'Manager-Id': managerId }
    }),
  
  // 브랜드 삭제
  deleteBrand: (brandId: number, managerId: number) =>
    api.delete(`/api/manager/brands/${brandId}`, {
      headers: { 'Manager-Id': managerId }
    }),
  
  // 매니저 상담 목록 조회
  getConsultations: (managerId: number, page: number = 0, size: number = 10) =>
    api.get<ApiResponse<PageResponse<Consultation>>>(`/api/manager/consultations?page=${page}&size=${size}`, {
      headers: { 'Manager-Id': managerId }
    }),
  
  // 상담 일정 조정 요청
  rescheduleConsultation: (consultationId: number, request: ConsultationRescheduleRequest, managerId: number) =>
    api.put<ApiResponse<Consultation>>(`/api/manager/consultations/${consultationId}/reschedule`, request, {
      headers: { 'Manager-Id': managerId }
    }),
  
  // 상담 확정 (PENDING → CONFIRMED)
  confirmConsultation: (consultationId: number, managerId: number) =>
    api.put<ApiResponse<Consultation>>(`/api/manager/consultations/${consultationId}/confirm`, {}, {
      headers: { 'Manager-Id': managerId }
    }),
  

  
  // 상담 취소
  cancelConsultation: (consultationId: number, managerId: number) =>
    api.delete<ApiResponse<void>>(`/api/manager/consultations/${consultationId}`, {
      headers: { 'Manager-Id': managerId }
    }),
  
  // 매니저 알림 목록 조회
  getNotifications: (managerId: number, page: number = 0, size: number = 10) =>
    api.get<ApiResponse<PageResponse<Notification>>>(`/api/manager/notifications?page=${page}&size=${size}`, {
      headers: { 'Manager-Id': managerId }
    }),
  
  // 매니저 읽지 않은 알림 개수
  getUnreadNotificationCount: (managerId: number) =>
    api.get<ApiResponse<number>>('/api/manager/notifications/unread-count', {
      headers: { 'Manager-Id': managerId }
    }),
};
