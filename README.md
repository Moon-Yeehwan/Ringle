## 실행 방법

### backend
cd ringle-backend
bundle install
rails db:setup   # 시드 포함 (Basic 30d, Premium 60d)
rails s

### frontend
cd ringle-frontend
pnpm install
pnpm dev  # VITE_API_BASE=/api




### 주요 API

GET /api/v1/me/can_chat?email=... → 활성 여부 반환

GET /api/v1/memberships → 전체 멤버십 조회

GET /api/v1/users/memberships?email=... → 특정 유저 멤버십 조회

POST /api/v1/users/grant → 멤버십 지급

POST /api/v1/users/purchase → 멤버십 구매

DELETE /api/v1/users/revoke → 멤버십 회수




### 설계 및 기술 스택 선정 배경
- **Backend**: Ruby on Rails (API 서버, 빠른 개발 속도와 RESTful 구조 제공)
- **Frontend**: React (Vite 기반, 빠른 빌드/핫리로드)
- **DB**: SQLite (과제 환경에 맞춘 간단한 로컬 DB)
- **UI Framework**: TailwindCSS (빠른 스타일링)
- **State 관리**: React Hooks + 간단한 Context API




### 검증 시나리오 (스크린샷 첨부)

## 1. Ping 확인
<img src="./ringle-frontend/ping.png" width="500"/>

## 2. Backend 실행
<img src="./ringle-frontend/backend.png" width="500"/>

## 3. 멤버십 조회 & 구매/지급/회수
<img src="./ringle-frontend/memberships.png" width="500"/>

## 4. Notes 생성/조회
<img src="./ringle-frontend/chat note.png" width="500"/>

## 5. AI 대화
<img src="./ringle-frontend/ai_chat.png" width="500"/>

## 6. 권한 오류 (만료 후 차단)
<img src="./ringle-frontend/chat_block.png" width="500"/>

## 7. Frontend 실행
<img src="./ringle-frontend/frontend.png" width="500"/>






