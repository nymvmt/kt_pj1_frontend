import axios from 'axios';

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

// 브랜드 관련 API
export const brandAPI = {
  // 공개 브랜드 목록 조회
  getPublicBrands: (page: number = 0, size: number = 10) =>
    api.get(`/api/public/brands?page=${page}&size=${size}`),
  
  // 브랜드 상세 조회
  getBrandDetail: (brandId: number) =>
    api.get(`/api/public/brands/${brandId}`),
  
  // 카테고리별 브랜드 조회
  getBrandsByCategory: (categoryId: number, page: number = 0, size: number = 10) =>
    api.get(`/api/public/brands/category/${categoryId}?page=${page}&size=${size}`),
  
  // 브랜드 검색
  searchBrands: (keyword: string, page: number = 0, size: number = 10) =>
    api.get(`/api/public/brands/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),
};

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/user/login', credentials),
  
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
    initialCost?: number;
    totalInvestment?: number;
    avgMonthlyRevenue?: number;
    storeCount?: number;
    brandDescription?: string;
  }) =>
    api.post('/api/auth/manager/register', userData),
};

// 사용자 브랜드 관련 API
export const userBrandAPI = {
  // 저장된 브랜드 목록
  getSavedBrands: (page: number = 0, size: number = 10) =>
    api.get(`/api/user/brands/saved?page=${page}&size=${size}`),
  
  // 브랜드 저장/해제
  toggleSavedBrand: (brandId: number) =>
    api.post(`/api/user/brands/${brandId}/save`),
  
  // 상담 신청
  createConsultation: (consultationData: { brandId: number; message: string }) =>
    api.post('/api/user/consultations', consultationData),
};

// 매니저 브랜드 관련 API
export const managerBrandAPI = {
  // 브랜드 생성
  createBrand: (brandData: any) =>
    api.post('/api/manager/brands', brandData),
  
  // 브랜드 수정
  updateBrand: (brandId: number, brandData: any) =>
    api.put(`/api/manager/brands/${brandId}`, brandData),
  
  // 브랜드 삭제
  deleteBrand: (brandId: number) =>
    api.delete(`/api/manager/brands/${brandId}`),
  
  // 상담 목록 조회
  getConsultations: (page: number = 0, size: number = 10) =>
    api.get(`/api/manager/consultations?page=${page}&size=${size}`),
  
  // 상담 상태 업데이트
  updateConsultationStatus: (consultationId: number, status: string) =>
    api.put(`/api/manager/consultations/${consultationId}/status`, { status }),
};
