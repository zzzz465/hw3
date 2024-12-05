# 프로젝트 명세서: 구인구직 백엔드 서버 개발

## 구현 기능

### 1. 웹 크롤러
- 사람인 사이트에서 채용 공고 데이터를 크롤링합니다.
- 크롤링한 데이터를 최소 100개 이상 수집하며, 구조화 및 정제된 형태로 준비합니다.
- 중복 데이터 처리 로직은 단순 비교로 구현하며, 실패 시 재시도 메커니즘은 포함하지 않습니다.

### 2. 데이터베이스 스키마 설계
- **Database**: PostgreSQL (로컬 환경에서는 SQLite 사용).
- 데이터는 **TypeORM**으로 관리하며, auto-migrate를 지원합니다.
- **데이터 무결성**은 고려하지 않으며, 데이터가 날아가도 무방한 방식으로 설계.
- 주요 스키마:
  - `jobs`: 채용 공고 데이터를 저장.
  - `users`: 사용자 정보를 저장.
  - `applications`: 사용자의 지원 내역을 저장.

### 3. REST API 구현
- **Framework**: Express.js 기반으로 개발.
- **Controller**와 **Service Layer**만 사용하며, 레이어 간에 엔티티를 직접 전달합니다.
- 구현 API:
  - `/auth`: 사용자 인증 및 권한 부여.
    - POST `/auth/register`: 회원가입.
    - POST `/auth/login`: 로그인 및 JWT 토큰 발급.
  - `/jobs`: 채용 공고 관리.
    - GET `/jobs`: 공고 목록 조회.
    - GET `/jobs/:id`: 공고 상세 조회.
    - POST `/jobs`: 공고 등록.
  - `/applications`: 사용자 지원 관리.
    - POST `/applications`: 공고 지원하기.
    - GET `/applications`: 사용자 지원 내역 조회.
    - DELETE `/applications/:id`: 지원 취소.

### 4. 인증 및 권한 부여
- **JWT 기반 인증 시스템**:
  - Access Token 발급 및 검증.
  - Refresh Token은 포함하지 않음.
- 인증과 권한 검증은 **미들웨어**를 사용해 간단히 처리.

### 5. API 명세 (Swagger)
- **Swagger Documentation**:
  - 작성된 코드에서 API 명세를 자동으로 생성.
  - OpenAPI 3.0 표준을 준수.
  - `swagger-ui-express` 패키지로 UI 제공.

### 6. 에러 로깅
- **전역 에러 핸들러**:
  - 간단한 HTTP 상태 코드 매핑.
  - JSON 형식의 응답 통일:
    ```json
    {
      "status": "error",
      "message": "에러 메시지",
      "code": "ERROR_CODE"
    }
    ```
- 요청/응답과 에러 로깅을 지원.

---

## 참고 사항

1. **코드 품질**
   - 과제 통과를 목표로 하며, 코드 퀄리티는 고려하지 않음.
   - 하드코딩 허용, 최소한의 구현으로 처리.

2. **언어 및 라이브러리**
   - **TypeScript**를 사용.
   - **라이브러리**를 적극 활용해 코드량 최소화.

3. **데이터베이스**
   - 로컬 개발은 **SQLite**를 사용하고, 프로덕션 환경에서는 **PostgreSQL**로 전환.
   - 데이터베이스 설정은 소스코드 직접 변경 방식으로 처리.

4. **구조**
   - Controller와 Service Layer만 사용.
   - Repository Layer는 생략, **TypeORM**을 직접 사용.

5. **비최적화**
   - 성능 최적화, 테스트, 모니터링 관련 사항은 무시.
   - 단순한 비즈니스 로직 구현에만 집중.

---

## 사용 기술 스택
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (SQLite for local)
- **ORM**: TypeORM
- **Documentation**: Swagger
- **Authentication**: JWT
