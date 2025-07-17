# 동아리 살인사건: 범인은 AI다

## 프로젝트 개요
웹 기반 AI 인터랙티브 추리 게임입니다.  
플레이어는 5명의 등장인물 중 AI가 범인인 캐릭터를 제한된 질문을 통해 찾아내야 합니다.

## 주요 기능
- 등장인물 5명(이한결, 김소이, 박주현, 정세윤, 윤지호(피해자))  
- 매 플레이마다 랜덤으로 범인(AI) 지정  
- 10개 질문 후보 중 5개 선택 가능  
- 캐릭터별 GPT 기반 자연스러운 대화 생성  
- 대화형 메신저 UI 및 선택형 질문 버튼 제공  
- 추리 후 범인 지목 및 결과 피드백  

## 기술 스택
- 백엔드: Python Flask, SQLite (간단한 데이터 저장)  
- 프론트엔드: HTML, CSS, JavaScript (Vanilla)  
- AI: OpenAI GPT API 연동  

## 프로젝트 구조
game/
├── backend/ # Flask 서버 코드
├── frontend/ # HTML, CSS, JS 코드
├── database/ # SQLite DB 파일 및 스키마
└── README.md # 프로젝트 설명 및 실행법


## 개발 및 실행 방법
1. Python 가상환경 설정 및 패키지 설치  
2. Flask 서버 실행 (game/backend/app.py)  
3. 브라우저에서 프론트엔드 파일 열기 또는 서버를 통해 접속  
4. OpenAI API 키 환경변수 설정 필수  

## 주요 API
- `/api/question` : 플레이어 질문을 받고 캐릭터별 답변 반환  
- `/api/guess` : 플레이어가 추리한 범인 제출 및 결과 반환  

## 참고
- 캐릭터별 인간/AI 프롬프트는 backend/prompt_templates.py 참고  
- 질문 후보 목록과 선택 로직은 frontend/scripts.js 내 구현  

---

필요시 더 상세한 실행법, 개발 가이드, 기여 방법 등 추가 작성 가능합니다.