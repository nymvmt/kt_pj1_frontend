// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageInfo: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// 브랜드 관련 타입
export interface Brand {
  brandId: number;
  brandName: string;
  categoryName: string;
  category?: BrandCategory;
  brandDescription?: string;
  viewCount: number;
  saveCount: number;
  initialCost: number;
  avgMonthlyRevenue: number;
  storeCount?: number;
  managerName: string;
  isSaved: boolean;
  isManaged?: boolean; // 매니저가 관리하는 브랜드인지 여부
}

export interface BrandCategory {
  categoryId: number;
  categoryName: string;
  brandCount?: number;
  // 추가 속성
  name?: string; // categoryName과 동일한 값
}

export interface BrandDetail extends Brand {
  // 백엔드 응답 구조에 맞춤
  manager?: {
    managerId: number;
    name: string;
    email: string;
    phone?: string;
  };
  totalInvestment?: number;
  consultationCount?: number;
  // 추가 속성들
  imageUrl?: string;
  websiteUrl?: string;
  contactInfo?: string;
}

export interface BrandStats {
  viewCount: number;
  savedCount: number;
  consultationCount: number;
}

// 사용자 관련 타입
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role?: 'USER' | 'MANAGER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  name: string;
  phone: string; // required
}

export interface ManagerCreateRequest {
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
}

// 상담 관련 타입
export interface Consultation {
  id: number;
  brand: Brand;
  user: User;
  message: string;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationStatus {
  id: number;
  name: string;
  description?: string;
}

// 알림 관련 타입
export interface Notification {
  id: number;
  user: User;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// 브랜드 생성/수정 요청 타입
export interface BrandCreateRequest {
  name: string;
  description: string;
  categoryId: number;
  imageUrl?: string;
  websiteUrl?: string;
  contactInfo?: string;
}

export interface BrandUpdateRequest extends Partial<BrandCreateRequest> {
  id: number;
}

// 상담 생성 요청 타입
export interface ConsultationCreateRequest {
  brandId: number;
  message: string;
}

// 상담 상태 업데이트 요청 타입
export interface ConsultationStatusUpdateRequest {
  status: string;
}
