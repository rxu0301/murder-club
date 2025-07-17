# Design Document

## Overview

"동아리 살인사건: 범인은 AI다"는 웹 기반 AI 인터랙티브 추리 게임으로, 플레이어가 제한된 질문을 통해 5명의 등장인물 중 AI 범인을 찾아내는 게임입니다. 이 디자인 문서는 게임의 아키텍처, 컴포넌트, 데이터 모델, 에러 처리 및 테스트 전략을 상세히 설명합니다.

## Architecture

게임은 클라이언트-서버 아키텍처를 기반으로 하며, 다음과 같은 주요 컴포넌트로 구성됩니다:

```
+-------------------+        +-------------------+        +-------------------+
|                   |        |                   |        |                   |
|  Frontend (UI)    |<------>|  Backend (API)    |<------>|  AI Model (HF)    |
|                   |        |                   |        |                   |
+-------------------+        +-------------------+        +-------------------+
         ^                            ^
         |                            |
         v                            v
+-------------------+        +-------------------+
|                   |        |                   |
|  Session Storage  |        |  Database (SQLite)|
|  (Browser)        |        |                   |
+-------------------+        +-------------------+
```

### 주요 아키텍처 결정:

1. **프론트엔드**: HTML, CSS, JavaScript를 사용한 SPA(Single Page Application) 구조
   - 모바일 및 데스크톱 환경을 위한 반응형 디자인
   - 상태 관리를 위한 모듈 패턴 적용
   - 메신저 스타일 UI를 위한 컴포넌트 기반 설계

2. **백엔드**: Python Flask 기반 RESTful API
   - 세션 관리 및 게임 상태 유지
   - Hugging Face API와의 통신 중계
   - 데이터 저장 및 검색을 위한 SQLite 연동

3. **AI 연동**: Hugging Face Inference API 활용
   - 캐릭터별 프롬프트 템플릿 관리
   - 응답 생성 및 캐싱 메커니즘
   - 에러 처리 및 재시도 로직

## Components and Interfaces

### 1. 프론트엔드 컴포넌트

#### 1.1 UI 컴포넌트
- **GameContainer**: 전체 게임 UI를 관리하는 최상위 컴포넌트
- **IntroScreen**: 게임 시작 화면
- **QuestionSelector**: 질문 선택 UI
- **ChatInterface**: 메신저 스타일 대화 UI
- **CharacterSelector**: 범인 선택 UI
- **ResultScreen**: 게임 결과 화면

#### 1.2 상태 관리
- **GameState**: 현재 게임 상태 관리 (선택한 질문, 대화 내용, 범인 정보 등)
- **UIState**: UI 상태 관리 (현재 화면, 로딩 상태 등)
- **SessionManager**: 브라우저 세션 관리 및 상태 유지

#### 1.3 API 클라이언트
- **ApiService**: 백엔드 API와의 통신 담당
- **ErrorHandler**: API 오류 처리 및 사용자 피드백

### 2. 백엔드 컴포넌트

#### 2.1 API 엔드포인트
- **/api/start**: 새 게임 세션 생성
- **/api/question**: 질문 처리 및 응답 생성
- **/api/guess**: 범인 추리 결과 처리
- **/api/status**: 현재 게임 상태 조회

#### 2.2 서비스 레이어
- **GameService**: 게임 로직 및 상태 관리
- **CharacterService**: 캐릭터 정보 및 응답 생성 관리
- **AIService**: Hugging Face API 연동 및 응답 처리

#### 2.3 데이터 액세스 레이어
- **SessionRepository**: 게임 세션 데이터 관리
- **GameRepository**: 게임 결과 및 통계 저장

### 3. 인터페이스 정의

#### 3.1 API 인터페이스

```
POST /api/start
Request: {}
Response: {
  "session_id": "string",
  "characters": ["이한결", "김소이", "박주현", "정세윤", "윤지호"],
  "questions": ["질문1", "질문2", ...]
}

POST /api/question
Request: {
  "session_id": "string",
  "character_id": "string",
  "question_id": "number"
}
Response: {
  "character_id": "string",
  "response": "string",
  "remaining_questions": "number"
}

POST /api/guess
Request: {
  "session_id": "string",
  "character_id": "string"
}
Response: {
  "correct": "boolean",
  "actual_culprit": "string",
  "feedback": "string"
}

GET /api/status
Request: {
  "session_id": "string"
}
Response: {
  "game_state": "string",
  "asked_questions": ["question_id1", ...],
  "conversations": [{...}]
}
```

## Data Models

### 1. 게임 세션 모델

```python
class GameSession:
    session_id: str  # 세션 식별자
    culprit_id: str  # AI 범인 캐릭터 ID
    start_time: datetime  # 게임 시작 시간
    end_time: Optional[datetime]  # 게임 종료 시간
    game_state: str  # 현재 게임 상태 (INTRO, QUESTIONING, GUESSING, RESULT)
    asked_questions: List[int]  # 이미 질문한 질문 ID 목록
    conversations: Dict[str, List[Dict]]  # 캐릭터별 대화 내용
    result: Optional[Dict]  # 게임 결과 정보
```

### 2. 캐릭터 모델

```python
class Character:
    id: str  # 캐릭터 식별자
    name: str  # 캐릭터 이름
    is_culprit: bool  # AI 범인 여부
    personality: str  # 캐릭터 성격 설명
    prompt_template: str  # AI 응답 생성을 위한 프롬프트 템플릿
```

### 3. 질문 모델

```python
class Question:
    id: int  # 질문 식별자
    text: str  # 질문 내용
    category: str  # 질문 카테고리 (선택적)
```

### 4. 대화 모델

```python
class Conversation:
    character_id: str  # 캐릭터 식별자
    question_id: int  # 질문 식별자
    question_text: str  # 질문 내용
    response: str  # 캐릭터 응답
    timestamp: datetime  # 대화 시간
```

### 5. 데이터베이스 스키마

```sql
CREATE TABLE game_sessions (
    session_id TEXT PRIMARY KEY,
    culprit_id TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    game_state TEXT NOT NULL,
    result_correct BOOLEAN,
    guessed_character_id TEXT
);

CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    response TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id)
);

CREATE TABLE asked_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id)
);
```

## Error Handling

### 1. 프론트엔드 에러 처리

- **네트워크 오류**: 연결 재시도 및 사용자 알림
- **API 응답 오류**: 오류 메시지 표시 및 대체 UI 제공
- **상태 불일치**: 게임 상태 복구 및 세션 재설정

### 2. 백엔드 에러 처리

- **API 요청 검증**: 요청 데이터 유효성 검사 및 적절한 HTTP 상태 코드 반환
- **세션 관리 오류**: 세션 복구 및 일관성 유지
- **데이터베이스 오류**: 트랜잭션 관리 및 롤백

### 3. AI 연동 에러 처리

- **API 호출 실패**: 재시도 로직 및 대체 응답 제공
- **응답 시간 초과**: 타임아웃 처리 및 사용자 피드백
- **콘텐츠 필터링**: 부적절한 응답 필터링 및 대체 응답 생성

## Testing Strategy

### 1. 단위 테스트

- **프론트엔드**: UI 컴포넌트 및 상태 관리 로직 테스트
- **백엔드**: 서비스 레이어 및 데이터 액세스 로직 테스트
- **AI 연동**: 프롬프트 생성 및 응답 처리 로직 테스트

### 2. 통합 테스트

- **API 엔드포인트**: 엔드-투-엔드 API 호출 테스트
- **데이터 흐름**: 프론트엔드-백엔드-데이터베이스 통합 테스트
- **세션 관리**: 세션 생성, 유지, 복구 테스트

### 3. 사용자 경험 테스트

- **반응형 디자인**: 다양한 화면 크기 및 기기에서의 UI 테스트
- **접근성**: 웹 접근성 표준 준수 여부 테스트
- **성능**: 로딩 시간 및 응답성 테스트

### 4. AI 응답 품질 테스트

- **응답 적절성**: 캐릭터별 응답 품질 및 일관성 테스트
- **AI 특성 구현**: AI 범인의 특성이 적절히 드러나는지 테스트
- **프롬프트 최적화**: 다양한 프롬프트 변형에 대한 응답 품질 비교

## Security Considerations

1. **API 보안**: CSRF 보호 및 입력 검증
2. **세션 관리**: 안전한 세션 ID 생성 및 관리
3. **환경 변수**: API 키 등 민감 정보의 안전한 관리
4. **콘텐츠 필터링**: 부적절한 콘텐츠 필터링 및 방지