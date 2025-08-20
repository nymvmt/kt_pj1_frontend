# 프랜차이즈TV 프론트엔드

IPTV 플랫폼 스타일의 프랜차이즈 브랜드 관리 웹 애플리케이션입니다.

## 주요 기능

- **IPTV 스타일 홈화면**: 영상 플레이어 영역과 하단 브랜드 캐러셀
- **브랜드 카테고리별 탐색**: 외식, 뷰티, 교육, 편의점 등 카테고리별 브랜드 목록
- **브랜드 상세 정보**: 브랜드별 상세 정보, 통계, 창업 정보 및 경쟁력 분석
- **상담 신청 시스템**: 날짜/시간 선택이 가능한 상담 신청 모달
- **찜한 브랜드 관리**: 관심 있는 브랜드를 저장/해제하고 관리
- **상담 이력 관리**: 진행중, 완료, 취소 상태별 상담 이력 조회
- **실시간 알림 시스템**: 상담 관련 알림 및 상태 업데이트
- **사용자 인증**: 일반 사용자/브랜드 매니저 분리 회원가입, 간단한 로그인

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인할 수 있습니다.

### 3. 빌드

```bash
npm run build
```

### 4. 프로덕션 실행

```bash
npm start
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── brands/            # 브랜드 관련 페이지
│   │   └── [id]/          # 브랜드 상세 페이지
│   ├── saved/             # 찜한 브랜드 페이지
│   ├── consultations/     # 상담 이력 페이지
│   ├── notifications/     # 알림 페이지
│   ├── login/             # 로그인 페이지
│   ├── register/          # 회원가입 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지 (IPTV 홈)
├── components/             # 재사용 가능한 컴포넌트
│   ├── Navigation.tsx     # 하단 네비게이션 바
│   └── ConsultationModal.tsx # 상담 신청 모달
├── contexts/               # React Context
│   └── AuthContext.tsx    # 인증 상태 관리
├── lib/                    # 유틸리티 및 설정
│   └── api.ts             # API 클라이언트
└── types/                  # TypeScript 타입 정의
    └── index.ts           # 공통 타입
```

## API 연동

이 프론트엔드는 백엔드 API와 연동되어 있습니다:

- **기본 URL**: `http://localhost:8080`
- **인증**: JWT 토큰 기반
- **주요 엔드포인트**:
  - `/api/public/brands` - 공개 브랜드 목록
  - `/api/auth/login` - 로그인
  - `/api/auth/register` - 회원가입
  - `/api/user/brands/saved` - 저장된 브랜드
  - `/api/manager/brands` - 매니저 브랜드 관리

## 환경 설정

백엔드 서버가 실행 중이어야 하며, `src/lib/api.ts`에서 API 기본 URL을 확인하세요.

## 주요 페이지

### 홈 페이지 (`/`)
- IPTV 스타일 영상 플레이어 영역
- 하단 브랜드 캐러셀 (자동 슬라이드)
- 추천 브랜드 정보 표시

### 브랜드 목록 (`/brands`)
- 카테고리별 브랜드 탐색
- 검색 및 필터링 기능
- 그리드 형태의 브랜드 카드

### 브랜드 상세 (`/brands/[id]`)
- 브랜드 상세 정보 및 통계
- 창업 정보 (가맹비, 창업비용, 월매출 등)
- 경쟁력 분석 차트
- 상담 신청 및 찜하기 기능

### 찜한 브랜드 (`/saved`)
- 저장된 브랜드 목록
- 브랜드별 찜한 날짜 표시
- 상담 신청 및 상세보기

### 상담 이력 (`/consultations`)
- 진행중/완료/취소 상태별 상담 관리
- 상담 일정 및 매니저 노트
- 일정 변경 및 응답 기능

### 알림 (`/notifications`)
- 상담 관련 실시간 알림
- 읽음/읽지 않음 상태 관리
- 알림 타입별 아이콘 표시

### 로그인/회원가입 (`/login`, `/register`)
- 일반 사용자/브랜드 매니저 분리 회원가입
- 간단한 이메일/비밀번호 로그인
- 로컬 스토리지 기반 인증 상태 관리

### 내 정보 (`/profile`)
- 사용자 프로필 정보 표시
- 로그아웃 기능

## 개발 가이드

### 새 컴포넌트 추가
1. `src/components/` 폴더에 컴포넌트 파일 생성
2. TypeScript와 Tailwind CSS 사용
3. 필요한 경우 props 타입 정의

### 새 페이지 추가
1. `src/app/` 폴더에 폴더 및 `page.tsx` 파일 생성
2. App Router 규칙에 따라 라우팅 설정
3. 네비게이션에 링크 추가

### API 연동
1. `src/lib/api.ts`에 새 API 함수 추가
2. `src/types/index.ts`에 관련 타입 정의
3. 컴포넌트에서 API 호출 및 상태 관리

## 문제 해결

### 백엔드 연결 실패
- 백엔드 서버가 실행 중인지 확인
- `src/lib/api.ts`의 API_BASE_URL 확인
- CORS 설정 확인

### 빌드 오류
- TypeScript 타입 오류 확인
- 의존성 설치 상태 확인
- Next.js 버전 호환성 확인

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
