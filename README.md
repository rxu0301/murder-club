# murder-club
🕵️‍♀️ Kiro로 구현한 "증거와 증언을 수집해 범인을 추리하는 웹 기반 인터랙티브 살인사건 게임"입니다.

# 동아리 살인사건: 범인은 AI다

## 프로젝트 개요
웹 기반 AI 인터랙티브 추리 게임입니다.  
플레이어는 5명의 등장인물 중 AI가 범인인 캐릭터를 제한된 질문을 통해 찾아내야 합니다.

## 주요 기능
- 등장인물 5명(이한결, 김소이, 박주현, 정세윤, 윤지호(피해자))  
- 매 플레이마다 랜덤으로 범인(AI) 지정  
- 10개 질문 후보 중 5개 선택 가능  
- 캐릭터별 Hugging Face API 기반 자연스러운 대화 생성  
- 대화형 메신저 UI 및 선택형 질문 버튼 제공  
- 추리 후 범인 지목 및 결과 피드백  

## 기술 스택
- 백엔드: Python Flask, SQLite (간단한 데이터 저장)  
- 프론트엔드: HTML, CSS, JavaScript (Vanilla)  
- AI: Hugging Face API 연동  

## 프로젝트 구조
```
game/
├── backend/           # Flask 서버 코드
│   ├── app.py         # 메인 Flask 애플리케이션
│   └── ai_service.py  # AI 응답 생성 서비스
├── frontend/          # HTML, CSS, JS 코드
│   ├── index.html     # 메인 HTML 파일
│   ├── style.css      # CSS 스타일시트
│   └── script.js      # JavaScript 코드
├── database/          # SQLite DB 파일 및 스키마
│   └── init_db.py     # 데이터베이스 초기화 스크립트
├── .env               # 환경 변수 설정 파일
└── README.md          # 프로젝트 설명 및 실행법
```

## 설치 및 실행 방법

### 1. 필요 패키지 설치
```bash
pip install flask flask-cors python-dotenv requests
```

### 2. 환경 변수 설정
`.env` 파일에 Hugging Face API 토큰을 설정합니다.
```
HF_API_TOKEN=your_huggingface_token_here
```

### 3. 데이터베이스 초기화
```bash
python database/init_db.py
```

### 4. Flask 서버 실행
```bash
python backend/app.py
```

### 5. 웹 브라우저에서 접속
- 로컬 서버: http://localhost:5000
- 또는 frontend/index.html 파일을 직접 브라우저에서 열기

## API 엔드포인트

### 게임 시작
- **URL**: `/api/start`
- **Method**: `POST`
- **Response**: 세션 ID, 캐릭터 목록, 질문 목록

### 질문 처리
- **URL**: `/api/question`
- **Method**: `POST`
- **Request Body**: 세션 ID, 캐릭터 ID, 질문 ID
- **Response**: 캐릭터 응답, 남은 질문 수

### 범인 추리
- **URL**: `/api/guess`
- **Method**: `POST`
- **Request Body**: 세션 ID, 캐릭터 ID
- **Response**: 정답 여부, 실제 범인 정보

### 게임 상태 조회
- **URL**: `/api/status`
- **Method**: `GET`
- **Query Parameters**: 세션 ID
- **Response**: 현재 게임 상태, 질문 내역, 대화 내용

## 캐릭터 정보
- **이한결**: 논리적이고 책임감 있는 회장
- **김소이**: 수다스럽고 감정이 풍부
- **박주현**: 말수가 적고 단답형, 핵심만 말함
- **정세윤**: 유머러스하고 위트 있는 농담 구사
- **윤지호**: 피해자 (질문 대상 아님)

## 질문 목록
1. 사건 당일 네 행적을 말해줘.
2. 피해자와 마지막으로 대화한 게 뭐였어?
3. 감정이란 게 무엇이라고 생각해?
4. 범인이 너라면 이유가 뭐야?
5. 그날 무슨 기분이었어?
6. 넌 왜 동아리에 가입했어?
7. 사건 이후 밤에 잠은 잘 잤어?
8. 친구의 죽음을 어떻게 받아들이고 있어?
9. 자신을 한 단어로 표현한다면?
10. 진실을 밝히는 게 중요하다고 생각해?

## 주의사항
- Hugging Face API 토큰이 필요합니다.
- 무료 추론 가능한 모델을 사용하도록 설정되어 있습니다.
- 응답 생성에 시간이 걸릴 수 있습니다.

## 추가 개발 가능 기능
- 더 다양한 질문 및 캐릭터 추가
- 난이도 조절 기능
- 게임 결과 통계 기능
- 더 복잡한 스토리라인 추가
