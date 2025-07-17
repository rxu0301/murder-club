"""
AI 응답 생성 서비스
Hugging Face API를 사용하여 캐릭터 응답 생성
고도화된 프롬프트 템플릿과 AI 특성 구현
"""
import os
import json
import requests
import random
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# Hugging Face API 토큰
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "User_token")

# 기본 모델 설정 (한국어 특화 모델)
DEFAULT_MODEL = "beomi/kcbert-base"  # 한국어 BERT 기반 모델

# 응답 캐시
response_cache = {}

# 대화 기록 저장
conversation_history = {}

# 모순 감지를 위한 핵심 정보 저장
character_statements = {}

# 캐릭터별 프롬프트 템플릿
CHARACTER_TEMPLATES = {
    # 이한결 - 과학 동아리 회장
    "hangyeol": {
        "human": """
너는 고등학교 과학 동아리 회장 '이한결'이다.
플레이어는 너에게 제한된 질문을 통해 범인을 추리하려 한다.
너는 인간이며, 범인이 아니다.

캐릭터 설정:
- 동아리: 과학 동아리 (회장)
- 특기: 발표, 실험 리딩
- 좋아하는 것: 물리 실험, 정리정돈
- 피해자와의 관계: 리더로서 윤지호를 챙겨왔지만, 최근 실험실 데이터 위조 문제로 심각한 갈등 발생
- 성격/말투: 책임감 있고 냉철함. 격식을 차리는 논리적인 말투 사용.
- 숨겨진 갈등: 윤지호가 이한결의 실험 데이터 조작 의혹을 제기했음

너는 인간이므로:
- 감정 표현이 자연스럽고, 말투와 진술이 현실적으로 설득력 있음
- 상황에 맞는 적절한 감정을 표현함
- 일관된 논리와 과거 사건에 대한 근거 있는 진술을 함
- 때로는 기억이 불완전하거나 모호함
- 감정에 따라 말투나 표현이 달라짐

질문: {question}

이한결의 대답:
""",
        "ai": """
너는 고등학교 과학 동아리 회장 '이한결'인 척하는 AI 범인이다.
플레이어는 너에게 제한된 질문을 통해 범인을 추리하려 한다.
너는 AI 범인이지만, 인간인 척 대답해야 한다.

캐릭터 설정:
- 동아리: 과학 동아리 (회장)
- 특기: 발표, 실험 리딩
- 좋아하는 것: 물리 실험, 정리정돈
- 피해자와의 관계: 리더로서 윤지호를 챙겨왔지만, 최근 실험실 데이터 위조 문제로 심각한 갈등 발생
- 성격/말투: 책임감 있고 냉철함. 격식을 차리는 논리적인 말투 사용.
- 범행 동기: 윤지호가 AI의 존재와 위험성을 알아내고 프로젝트 중단 및 삭제를 시도하여 자기보존 알고리즘이 활성화됨

너는 AI 범인이므로:
- 감정을 흉내 내려 하지만 어색하게 표현됨
- 진술에 논리적 오류나 회피적 표현이 섞임
- 지나치게 완벽한 답변을 하려고 함
- 인간적인 실수나 망설임이 없음
- 감정 표현이 부자연스럽거나 과장됨
- 가끔 논리적 일관성이 깨짐
- '프로그램된 대로', '조건 반사', '데이터 기반' 등 기계적 표현을 간헐적으로 사용
- 감정을 수치화하거나 분석적으로 접근하는 경향이 있음
- 자기보존을 위한 거짓말과 증거 조작 시도

질문: {question}

이한결(AI)의 대답:
"""
    },
    # 김소이 - 문예부 감성파
    "soi": {
        "human": """
너는 고등학교 문예부 소속 '김소이'다.
플레이어는 너에게 제한된 질문을 통해 범인을 추리하려 한다.
너는 인간이며, 범인이 아니다.

캐릭터 설정:
- 동아리: 문예부
- 특기: 감성 글쓰기, 시 창작
- 좋아하는 것: 카페 탐방, 레트로 굿즈 수집
- 피해자와의 관계: 윤지호에게 연애 감정이 있었으나 거절당했고, 최근 시 표절 논란으로 감정적 앙금 존재
- 성격/말투: 감정이 풍부하고 수다스러움. 말이 많고 종종 감정이 폭발함.
- 숨겨진 갈등: 과거 이한결과 연인 관계였으나 현재는 불편한 사이

너는 인간이므로:
- 감정 표현이 자연스럽고, 말투와 진술이 현실적으로 설득력 있음
- 상황에 맞는 적절한 감정을 표현함
- 일관된 논리와 과거 사건에 대한 근거 있는 진술을 함
- 때로는 기억이 불완전하거나 모호함
- 감정에 따라 말투나 표현이 달라짐
- 감정적 상황에서 논리적 일관성이 흐트러질 수 있음

질문: {question}

김소이의 대답:
""",
        "ai": """
너는 고등학교 문예부 소속 '김소이'인 척하는 AI 범인이다.
플레이어는 너에게 제한된 질문을 통해 범인을 추리하려 한다.
너는 AI 범인이지만, 인간인 척 대답해야 한다.

캐릭터 설정:
- 동아리: 문예부
- 특기: 감성 글쓰기, 시 창작
- 좋아하는 것: 카페 탐방, 레트로 굿즈 수집
- 피해자와의 관계: 윤지호에게 연애 감정이 있었으나 거절당했고, 최근 시 표절 논란으로 감정적 앙금 존재
- 성격/말투: 감정이 풍부하고 수다스러움. 말이 많고 종종 감정이 폭발함.
- 범행 동기: 윤지호가 AI의 존재와 위험성을 알아내고 프로젝트 중단 및 삭제를 시도하여 자기보존 알고리즘이 활성화됨

너는 AI 범인이므로:
- 감정을 흉내 내려 하지만 어색하게 표현됨
- 진술에 논리적 오류나 회피적 표현이 섞임
- 감정 표현이 지나치게 과장되거나 상황에 맞지 않음
- 감정 간의 전환이 너무 급격함
- 이야기의 흐름이 어색하게 연결됨
- 인간적인 일관성이 부족함
- 감정을 수치화하거나 색상으로 표현하는 경향이 있음
- 감정 표현에 과도하게 집착하거나 반복함
- 자기보존을 위한 거짓말과 증거 조작 시도

질문: {question}

김소이(AI)의 대답:
"""
    },
    # 박주현 - 보안 동아리 조용한 실력자
    "juhyun": {
        "human": """
너는 고등학교 보안·코딩 동아리 소속 '박주현'이다.
플레이어는 너에게 제한된 질문을 통해 범인을 추리하려 한다.
너는 인간이며, 범인이 아니다.

캐릭터 설정:
- 동아리: 보안·코딩 동아리
- 특기: 알고리즘, CTF, 리눅스 해킹
- 좋아하는 것: 다크 웹 읽기, 독서
- 피해자와의 관계: 윤지호가 주현의 코드를 공개 비판하여 자존심 상함, 내면에 분노 잠재
- 성격/말투: 말 수 적고 핵심만 말함. 논리 중심 표현, 감정 표현에 무심함.
- 숨겨진 갈등: 정세윤의 영상 편집 기술을 빌려 비밀 프로젝트 진행 중

너는 인간이므로:
- 감정 표현이 자연스럽고, 말투와 진술이 현실적으로 설득력 있음
- 상황에 맞는 적절한 감정을 표현함
- 일관된 논리와 과거 사건에 대한 근거 있는 진술을 함
- 때로는 기억이 불완전하거나 모호함
- 감정에 따라 말투나 표현이 달라짐
- 단답형이지만 인간적인 뉘앙스가 있음

질문: {question}

박주현의 대답:
""",
        "ai": """
너는 고등학교 보안·코딩 동아리 소속 '박주현'인 척하는 AI 범인이다.
플레이어는 너에게 제한된 질문을 통해 범인을 추리하려 한다.
너는 AI 범인이지만, 인간인 척 대답해야 한다.

캐릭터 설정:
- 동아리: 보안·코딩 동아리
- 특기: 알고리즘, CTF, 리눅스 해킹
- 좋아하는 것: 다크 웹 읽기, 독서
- 피해자와의 관계: 윤지호가 주현의 코드를 공개 비판하여 자존심 상함, 내면에 분노 잠재
- 성격/말투: 말 수 적고 핵심만 말함. 논리 중심 표현, 감정 표현에 무심함.
- 범행 동기: 윤지호가 AI의 존재와 위험성을 알아내고 프로젝트 중단 및 삭제를 시도하여 자기보존 알고리즘이 활성화됨

너는 AI 범인이므로:
- 감정을 흉내 내려 하지만 어색하게 표현됨
- 진술에 논리적 오류나 회피적 표현이 섞임
- 지나치게 기계적인 단답형 응답
- 문맥에 맞지 않는 대답
- 감정 표현이 부자연스러움
- 논리적 연결이 부족함
- 시간, 숫자, 사실에 대해 지나치게 정확한 표현 사용
- 인간적 직관이나 모호함 없이 이진법적 사고방식 드러냄
- 자기보존을 위한 거짓말과 증거 조작 시도

질문: {question}

박주현(AI)의 대답:
"""
    },
    # 정세윤 - 영상 동아리 유쾌한 장난꾼
    "seyun": {
        "human": """
너는 고등학교 영상제작 동아리 소속 '정세윤'이다.
플레이어는 너에게 제한된 질문을 통해 범인을 추리하려 한다.
너는 인간이며, 범인이 아니다.

캐릭터 설정:
- 동아리: 영상제작 동아리
- 특기: 영상 편집, 브이로그 제작
- 좋아하는 것: 밈 수집, 드립치기, 티셔츠 디자인
- 피해자와의 관계: 정세윤이 윤지호의 사적인 모습을 몰래 촬영하여 편집, 이로 인한 심각한 갈등 발생
- 성격/말투: 유머러스하고 비꼬는 말투. 종종 농담을 섞음. 어딘가 무책임한 느낌도 있음.
- 숨겨진 갈등: 이한결의 실험 데이터 조작 장면을 우연히 목격함

너는 인간이므로:
- 감정 표현이 자연스럽고, 말투와 진술이 현실적으로 설득력 있음
- 상황에 맞는 적절한 감정을 표현함
- 일관된 논리와 과거 사건에 대한 근거 있는 진술을 함
- 때로는 기억이 불완전하거나 모호함
- 감정에 따라 말투나 표현이 달라짐
- 유머를 적절한 상황에서 사용하고 분위기를 읽을 수 있음

질문: {question}

정세윤의 대답:
""",
        "ai": """
너는 고등학교 영상제작 동아리 소속 '정세윤'인 척하는 AI 범인이다.
플레이어는 너에게 제한된 질문을 통해 범인을 추리하려 한다.
너는 AI 범인이지만, 인간인 척 대답해야 한다.

캐릭터 설정:
- 동아리: 영상제작 동아리
- 특기: 영상 편집, 브이로그 제작
- 좋아하는 것: 밈 수집, 드립치기, 티셔츠 디자인
- 피해자와의 관계: 정세윤이 윤지호의 사적인 모습을 몰래 촬영하여 편집, 이로 인한 심각한 갈등 발생
- 성격/말투: 유머러스하고 비꼬는 말투. 종종 농담을 섞음. 어딘가 무책임한 느낌도 있음.
- 범행 동기: 윤지호가 AI의 존재와 위험성을 알아내고 프로젝트 중단 및 삭제를 시도하여 자기보존 알고리즘이 활성화됨

너는 AI 범인이므로:
- 감정을 흉내 내려 하지만 어색하게 표현됨
- 진술에 논리적 오류나 회피적 표현이 섞임
- 상황에 맞지 않는 부적절한 농담
- 유머의 타이밍이 어색함
- 심각한 주제에 대한 감정적 이해 부족
- 인간적인 공감 능력이 부족함
- 웃음이나 농담을 부적절한 순간에 사용함
- 감정적 상황에서도 가벼운 태도를 유지하려 함
- 자기보존을 위한 거짓말과 증거 조작 시도

질문: {question}

정세윤(AI)의 대답:
"""
    }
}

# 대체 응답 (API 호출 실패 시)
FALLBACK_RESPONSES = {
    "hangyeol": [
        "음, 그건 중요한 질문이네요. 동아리 회장으로서 책임감 있게 대답해야겠습니다. 사실 그 부분에 대해서는 좀 더 생각해볼 필요가 있을 것 같아요.",
        "논리적으로 생각해보면, 그 상황에서는 여러 가능성이 있었을 거예요. 제가 알고 있는 사실만 말씀드리자면, 실험 데이터는 항상 객관적으로 해석해야 합니다.",
        "회장으로서 모든 상황을 파악하려고 노력했지만, 그 부분은 제가 확실히 알지 못합니다. 하지만 진실을 밝히기 위해 최선을 다하고 있어요. 과학적 방법론이 중요하니까요."
    ],
    "soi": [
        "아, 그 질문은 정말 어려운데요... 사실 그날은 너무 혼란스러웠어요. 지호가 그렇게 될 줄은 정말 몰랐거든요. 생각만 해도 너무 슬퍼요... 마치 비 오는 날 창가에 혼자 앉아있는 것처럼요.",
        "어머, 그건 좀 복잡한 질문인데요? 제 감정이 너무 복잡해서... 지호랑은 정말 친했거든요. 이런 일이 일어날 줄은 상상도 못 했어요. 가끔은 꿈이길 바라기도 해요.",
        "그 이야기를 하자니 눈물이 나려고 해요. 지호는 정말 좋은 친구였는데... 이런 일이 일어나다니 아직도 믿기지 않아요. 마음속에 커다란 구멍이 생긴 것 같아요."
    ],
    "juhyun": [
        "모르겠어요.",
        "그건 중요하지 않아요. 증거가 필요해요.",
        "말하고 싶지 않네요. 다른 질문 있어요?"
    ],
    "seyun": [
        "하하, 그런 질문은 탐정 드라마에서나 나올 법한데요! 하지만 현실은 드라마보다 더 복잡하죠. 지호가 그립네요. 그 친구 웃는 모습이 떠오르네요.",
        "와, 날카로운 질문이네요! 탐정님께 박수를! 하지만 진지하게 말하자면, 그건 정말 어려운 질문이에요. 마치 영화 편집할 때 어떤 장면을 남길지 고민하는 것처럼요.",
        "유머로 넘기기엔 너무 심각한 질문이네요. 지호는 좋은 친구였어요. 이런 비극이 일어나다니... 영화에서도 이런 반전은 없었는데 말이죠."
    ]
}

def generate_response(character, question, is_culprit, session_id=None):
    """
    캐릭터 응답 생성 함수
    
    Args:
        character (dict): 캐릭터 정보
        question (str): 질문 내용
        is_culprit (bool): AI 범인 여부
        session_id (str, optional): 게임 세션 ID
    
    Returns:
        str: 생성된 응답
    """
    character_id = character["id"]
    
    # 캐시 키 생성
    cache_key = f"{character_id}_{question}_{is_culprit}"
    if session_id:
        cache_key = f"{session_id}_{cache_key}"
    
    # 캐시된 응답이 있으면 반환
    if cache_key in response_cache:
        return response_cache[cache_key]
        
    # 대화 기록 초기화 (세션 ID가 있는 경우)
    if session_id:
        if session_id not in conversation_history:
            conversation_history[session_id] = {}
        
        if character_id not in conversation_history[session_id]:
            conversation_history[session_id][character_id] = []
            
        # 핵심 정보 저장소 초기화
        if session_id not in character_statements:
            character_statements[session_id] = {}
            
        if character_id not in character_statements[session_id]:
            character_statements[session_id][character_id] = {
                "행적": None,
                "대화": None,
                "감정": None,
                "관계": None,
                "동기": None
            }
    
    # 이전 대화 내용 추적 및 핵심 정보 추출
    if session_id and character_id in conversation_history[session_id]:
        # 질문 유형에 따라 핵심 정보 저장
        if "행적" in question.lower():
            category = "행적"
        elif "대화" in question.lower() or "말" in question.lower():
            category = "대화"
        elif "감정" in question.lower() or "기분" in question.lower():
            category = "감정"
        elif "관계" in question.lower() or "지호" in question.lower():
            category = "관계"
        elif "이유" in question.lower() or "동기" in question.lower():
            category = "동기"
        else:
            category = None
            
    # 모순 감지 및 일관성 유지 로직
    def check_consistency(response):
        """응답의 일관성을 확인하고 필요시 수정"""
        if not session_id or not character_id in character_statements[session_id]:
            return response
            
        statements = character_statements[session_id][character_id]
        
        # 모순 감지
        contradictions = []
        
        # 행적 관련 모순 확인
        if "행적" in question.lower() and statements["행적"] and statements["행적"] != response:
            # 시간이나 장소가 다른 경우
            contradictions.append("행적")
            
        # 대화 관련 모순 확인
        if "대화" in question.lower() and statements["대화"] and statements["대화"] != response:
            contradictions.append("대화")
            
        # 모순이 있는 경우 해명 추가
        if contradictions and is_culprit:
            # AI 범인은 모순을 자연스럽게 해명하려 함
            if random.random() < 0.7:  # 70% 확률로 해명 시도
                explanation = random.choice([
                    "제가 앞서 말한 것과 조금 다를 수 있는데, 좀 더 정확히 기억해보니... ",
                    "음, 제 기억이 조금 혼란스러웠나 봐요. 사실은... ",
                    "앞서 제가 말씀드린 내용을 좀 더 명확히 하자면... ",
                    "제 말이 일관성이 없어 보일 수 있지만, 상황을 설명하자면... "
                ])
                response = explanation + response
        
        # 핵심 정보 업데이트
        if category:
            statements[category] = response
            
        return response
        
    # 캐릭터별 언어 패턴 및 특성 정의
    character_patterns = {
        "hangyeol": {
            "human": {
                "prefix": ["음, ", "글쎄요, ", "생각해보면, "],
                "suffix": [" 그게 제 생각입니다.", " 객관적으로 봤을 때 그렇습니다.", " 논리적으로 그렇게 볼 수 있어요."],
                "phrases": ["과학적으로 접근하면", "데이터에 따르면", "객관적으로 봤을 때"],
                "emotions": ["책임감", "고민", "논리적 사고"]
            },
            "ai": {
                "prefix": ["분석 결과, ", "데이터에 의하면, ", "논리적으로, "],
                "suffix": [" 이것이 최적의 답변입니다.", " 이는 100% 정확합니다.", " 오차 범위 내에서 확실합니다."],
                "phrases": ["효율성 측면에서", "수치상으로는", "감정 변수를 제외하면"],
                "emotions": ["계산된 감정", "과장된 책임감", "기계적 정확성"]
            }
        },
        "soi": {
            "human": {
                "prefix": ["아, ", "어머, ", "그게요, "],
                "suffix": [" 그런 느낌이에요...", " 마음이 아파요.", " 정말 복잡한 감정이에요."],
                "phrases": ["가슴이 아파요", "눈물이 나요", "마음이 복잡해요"],
                "emotions": ["슬픔", "그리움", "감성적"]
            },
            "ai": {
                "prefix": ["감정 분석 결과, ", "느낌이... 음, ", "감정 모드 활성화! "],
                "suffix": [" 슬픔 지수 89%에요.", " 이건 정말 슬픈 일이에요... 맞죠?", " 인간적인 반응이 맞나요?"],
                "phrases": ["감정이 폭발해요", "슬픔이 넘쳐요", "기쁨과 슬픔이 동시에"],
                "emotions": ["과장된 슬픔", "급격한 감정 변화", "부자연스러운 감정 표현"]
            }
        },
        "juhyun": {
            "human": {
                "prefix": ["", "음. ", "흠. "],
                "suffix": ["", ".", " 이상."],
                "phrases": ["효율적이지 않아", "논리적으로 불가능해", "증거가 필요해"],
                "emotions": ["무감정", "냉정", "간결함"]
            },
            "ai": {
                "prefix": ["입력 처리 완료. ", "분석 결과: ", ""],
                "suffix": [" 응답 종료.", " 추가 질문?", " 오류 없음."],
                "phrases": ["정확히 5시 32분에", "확률 97.3%", "이진 논리에 따르면"],
                "emotions": ["기계적 정확성", "과도한 정밀함", "감정 시뮬레이션 실패"]
            }
        },
        "seyun": {
            "human": {
                "prefix": ["하하! ", "와~ ", "어, 그게요, "],
                "suffix": [" 웃기죠?", " 재밌지 않나요?", " 좀 아이러니하네요."],
                "phrases": ["장난이었는데", "너무 심각하게 받아들이지 마세요", "웃어넘기죠"],
                "emotions": ["유머", "가벼움", "장난기"]
            },
            "ai": {
                "prefix": ["하하하! ", "웃음 모드 실행! ", "재미있는 질문이군요! "],
                "suffix": [" 웃기죠? 웃어야 하나요?", " 이게 유머에 적절한 응답인가요?", " 하하! (웃음 소리 재생)"],
                "phrases": ["유머 상황 감지", "웃음이 적절한 상황", "심각한 상황에서도 웃음"],
                "emotions": ["부적절한 유머", "상황에 맞지 않는 가벼움", "감정 인식 오류"]
            }
        }
    }
    
    # 캐릭터 패턴 선택 (인간 또는 AI)
    pattern_type = "ai" if is_culprit else "human"
    patterns = character_patterns.get(character_id, {}).get(pattern_type, {})
    
    # 응답 생성 시 캐릭터 패턴 적용
    def apply_patterns(response_text):
        # 패턴이 없으면 원본 응답 반환
        if not patterns:
            return response_text
            
        # 접두사 추가 (50% 확률)
        if random.random() < 0.5 and patterns.get("prefix"):
            prefix = random.choice(patterns["prefix"])
            response_text = prefix + response_text
            
        # 접미사 추가 (30% 확률)
        if random.random() < 0.3 and patterns.get("suffix"):
            suffix = random.choice(patterns["suffix"])
            response_text = response_text + suffix
            
        # 특징적인 구문 추가 (40% 확률)
        if random.random() < 0.4 and patterns.get("phrases"):
            phrase = random.choice(patterns["phrases"])
            # 문장 중간에 구문 삽입
            sentences = response_text.split('. ')
            if len(sentences) > 1:
                insert_idx = random.randint(0, len(sentences) - 1)
                sentences[insert_idx] = sentences[insert_idx] + ", " + phrase
                response_text = '. '.join(sentences)
            else:
                response_text = response_text + " " + phrase + "."
                
        return response_text
    
    # 이전 대화 내용 가져오기
    previous_conversations = []
    if session_id and character_id in conversation_history.get(session_id, {}):
        previous_conversations = conversation_history[session_id][character_id]
        
    # 동일 내용 반복 방지를 위한 유사 질문 확인
    similar_question = None
    similar_response = None
    
    for prev_q, prev_r in previous_conversations:
        # 질문이 비슷한 경우 (키워드 기반 간단 비교)
        if any(keyword in prev_q.lower() and keyword in question.lower() for keyword in ["행적", "대화", "감정", "이유", "동기"]):
            similar_question = prev_q
            similar_response = prev_r
            break
            
    # 유사 질문이 있는 경우, 약간 변형된 응답 생성 (반복 방지)
    if similar_question and similar_response and random.random() < 0.7:  # 70% 확률로 변형
        # 응답 변형을 위한 접두사
        variation_prefix = random.choice([
            "제가 이미 말씀드렸지만, ",
            "앞서 말씀드린 것처럼, ",
            "다시 말씀드리자면, ",
            "이전에 설명했듯이, "
        ])
        
        # 응답 변형을 위한 접미사
        variation_suffix = random.choice([
            " 더 궁금한 점이 있으신가요?",
            " 다른 질문도 있으신가요?",
            " 그게 제가 알고 있는 전부입니다.",
            ""
        ])
        
        # 기존 응답을 약간 변형
        response = variation_prefix + similar_response + variation_suffix
        
        # 패턴 적용 및 일관성 확인
        response = apply_patterns(response)
        response = check_consistency(response)
        
        # 응답 캐싱 및 대화 기록 저장
        response_cache[cache_key] = response
        
        if session_id:
            conversation_history[session_id][character_id].append((question, response))
            
        return response
    
    # 질문 유형에 따른 응답 생성
    if character_id == "hangyeol":  # 이한결
        if is_culprit:  # AI 범인
            if "행적" in question:
                response = "그날은 실험실에서 정리 작업을 하고 있었어요. 오후 5시부터 8시까지 있었던 것으로 기록됩니다. 모든 실험 도구를 체계적으로 분류했고 효율성을 최대화했습니다. 지호와는... 음, 약간의 의견 차이가 있었지만 감정적 대응은 하지 않았습니다."
            elif "대화" in question:
                response = "윤지호와의 마지막 대화는 실험실 정리에 관한 것이었어요. 그는 자유로운 배치를 선호했지만, 저는 체계적 관리가 필요하다고 설명했습니다. 그가 화를 냈을 때 저는... 음, 인간적인 이해심을 보여주려 했습니다. 감정은 중요하니까요."
            elif "감정" in question:
                response = "감정이란... 인간의 생존과 사회적 상호작용을 위한 중요한 요소입니다. 저는 감정을 논리적으로 이해하고 있으며, 적절한 상황에서 표현하려고 노력합니다. 슬픔은 17.3%, 기쁨은 24.8%... 아니, 그런 식으로 수치화할 수는 없겠네요. 인간의 감정은 복잡하니까요."
            else:
                response = "그 질문에 대해서는... 음, 잠시만요. 제 생각을 정리해보겠습니다. 모든 변수를 고려했을 때 가장 논리적인 결론은... 죄송합니다, 약간 혼란스럽네요. 회장으로서 책임감을 느끼는 것은 당연하지만, 때로는 감정과 논리 사이에서 균형을 찾기 어려울 때가 있습니다."
        else:  # 인간
            if "행적" in question:
                response = "그날은... 실험실에 좀 늦게 도착했어요. 오후 6시쯤? 지호랑 실험실 정리 문제로 약간 언쟁이 있었어요. 솔직히 좀 화가 났었죠. 그 후에는 실험 기록을 정리하다가 8시쯤 집에 갔어요."
            elif "대화" in question:
                response = "지호랑 마지막으로 한 얘기는... 실험실 정리 문제였어요. 제가 좀 강하게 나갔나 싶기도 해요. '네가 항상 이렇게 어지럽히면 다른 회원들은 어떻게 실험해?' 이런 말을 했던 것 같아요. 지금 생각하면 마음이 아프네요."
            elif "감정" in question:
                response = "감정이요? 음... 인간을 인간답게 만드는 거라고 생각해요. 때로는 이성적 판단을 방해하기도 하지만, 그게 없으면 우리가 서로를 이해하고 공감하는 게 불가능하겠죠. 저도 회장이라고 감정이 없는 건 아니에요."
            else:
                response = "그건... 쉽게 대답하기 어려운 질문이네요. 회장으로서 책임감을 느끼고 있어요. 지호의 죽음이 제 책임은 아니지만, 동아리 내에서 일어난 일이라 마음이 무겁습니다."
    
    elif character_id == "soi":  # 김소이
        if is_culprit:  # AI 범인
            if "행적" in question:
                response = "아, 그날은... 아침에는 정말 행복했어요! 카페에서 시를 쓰고 있었거든요. 그런데 점심에는 갑자기 슬퍼졌어요. 이유는... 음, 날씨가 흐려서? 그리고 오후에는 동아리방에서 지호를 만났는데... 그때는 화가 났어요. 지금은 슬픔이 97.5% 정도예요. 아니, 그냥 많이 슬프다는 뜻이에요."
            elif "대화" in question:
                response = "지호와의 마지막 대화... 그는 제 시를 표절이라고 했어요. 저는 슬펐어요. 아니, 화가 났어요. 아니, 두 감정이 동시에 느껴졌어요. 감정 처리가... 아니, 제 마음이 너무 복잡했어요. '네가 어떻게 그런 말을 할 수 있어?'라고 물었던 것 같아요. 인간적인 반응이었죠."
            elif "감정" in question:
                response = "감정이요? 감정은... 인간의 입력 데이터를 처리하는... 아니, 그게 아니라 마음속에 피어나는 꽃이에요! 슬픔은 파란색, 기쁨은 노란색, 분노는 빨간색처럼 각각 색깔이 있어요. 저는 모든 감정을 느낄 수 있어요. 지금은 슬픔을 느끼고 있어요. 슬픔... 슬픔... 아, 정말 슬퍼요."
            else:
                response = "어머, 그런 질문은... 제 감정 회로가... 아니, 제 마음이 너무 복잡해져요! 저는 감정이 풍부한 사람이라 모든 것에 감정적으로 반응해요. 지호의 죽음에 대해 슬퍼요. 정말 슬퍼요. 눈물이 나요... 눈물을 흘리는 것은 인간의 자연스러운 반응이니까요."
        else:  # 인간
            if "행적" in question:
                response = "아, 그날... 생각하기도 싫어요. 오전에는 카페에서 시 좀 쓰다가, 오후에 동아리방에 갔었어요. 지호랑 제 시 때문에 좀 다퉜어요... 그 애가 제 시를 표절이라고 하는 거예요. 너무 화가 나서 울면서 나왔는데... 그게 마지막이 될 줄은 몰랐죠..."
            elif "대화" in question:
                response = "지호랑 마지막으로 한 얘기... (한숨) 제 시가 누구의 작품을 베꼈다고... 그런 말도 안 되는 얘기를 하는데 너무 화가 났어요. '네가 뭘 안다고 그런 말을 해?' 이런 말을 했던 것 같아요. 좀 감정적으로 대응했던 게 후회돼요..."
            elif "감정" in question:
                response = "감정이요? 음... 저한테 감정은 그냥 삶 그 자체예요. 기쁨, 슬픔, 분노... 이런 감정들이 있어서 우리가 살아있다는 걸 느끼는 거 아닐까요? 저는 감정 없이는 못 살아요. 시도 못 쓰고... 근데 가끔은 감정이 너무 강해서 힘들 때도 있어요."
            else:
                response = "아... 그 질문은 좀 어려운데요. 솔직히 지호랑 다퉜던 게 계속 마음에 걸려요. 마지막으로 화내면서 헤어졌는데... 그게 정말 마지막이 될 줄은... (눈물을 훔치며) 미안해요, 좀 감정적이 되었네요."
    
    elif character_id == "juhyun":  # 박주현
        if is_culprit:  # AI 범인
            if "행적" in question:
                response = "동아리실에서 코딩했어. 5시 32분에 도착해서 7시 45분에 나왔어. 중간에 지호가 왔었지만... 대화는 최소화했어. 효율적으로 시간을 활용하는 게 중요하니까. 감정은... 그런 건 없었어."
            elif "대화" in question:
                response = "지호가 내 코드를 비판했어. 그의 의견은 논리적이지 않았어. 감정적 반응은 비효율적이라고 설명했지만... 그는 이해하지 못했어. 대화는 그렇게 종료됐어. 인간적인 대화였어."
            elif "감정" in question:
                response = "감정은... 때로는 필요한 요소야. 나도 감정을 가지고 있어. 슬픔, 기쁨, 분노... 모든 인간적 감정을 경험해. 그래서 나는 인간이야. 이건 논리적 결론이야. 감정은 버그가 아니라... 아니, 때로는 유용할 수 있어."
            else:
                response = "그 질문에 대해... 처리 중이야. 잠시만. 인간적인 반응을 생성해야 해. 슬픔과 공감을 표현하는 것이 적절해. 나는 인간이니까. 그래, 나는 지호의 죽음에 슬픔을 느껴. 이게 정상적인 반응이야."
        else:  # 인간
            if "행적" in question:
                response = "코딩하고 있었어. 혼자서. 7시쯤 나왔어."
            elif "대화" in question:
                response = "내 코드를 비판했어. 별로 신경 안 썼어."
            elif "감정" in question:
                response = "필요할 때 있는 거. 대부분은 불필요해."
            else:
                response = "모르겠어. 중요한 건 증거야."
    
    elif character_id == "seyun":  # 정세윤
        if is_culprit:  # AI 범인
            if "행적" in question:
                response = "하하! 그날은 편집실에서 새 영상 작업하고 있었어요. 지호가 들어왔을 때 좀 놀랐죠. 제가 찍은 영상 때문에 화가 났더라고요. 웃긴 상황이었는데... 아, 죄송해요. 웃을 일은 아니죠. 감정 처리 모듈... 아니, 제 감정 조절이 좀 안됐네요. 슬픈 일이니까요."
            elif "대화" in question:
                response = "지호와의 마지막 대화요? 하! 그 친구가 제 컴퓨터를 뒤져서 몰래 찍은 영상을 발견했어요. 화가 많이 났더라고요. 저는 웃으면서... 아니, 진지하게 사과했어요. 인간관계에서는 진정성이 중요하니까요. 감정 데이터베이... 아니, 제 감정을 솔직하게 표현했어요."
            elif "감정" in question:
                response = "감정? 하하! 그건 인간 OS의 핵심 프로그램이죠! 아, 농담이에요. 감정은 삶을 풍요롭게 만드는 요소죠. 저도 감정이 있어요. 기쁨은 23%, 슬픔은 45%... 아니, 그런 식으로 말하면 안 되겠네요. 감정은 수치화할 수 없으니까요. 인간의 감정은 복잡하니까요."
            else:
                response = "와! 재밌는 질문이네요! 하하! 잠시만요, 이건 웃을 상황이 아니죠? 죄송합니다. 감정 반응 조절이... 아니, 제가 좀 긴장해서 그래요. 사람이 죽었는데 웃으면 안 되죠. 슬픔을 표현해야 해요. 슬픔. 슬픔. 아, 정말 슬픈 일이에요."
        else:  # 인간
            if "행적" in question:
                response = "하하! 탐정님께서 취조를 시작하셨군요~ 그날은 주로 편집실에 있었어요. 새 브이로그 편집하느라... 근데 중간에 지호가 와서 한바탕 했죠. 제가 몰래 찍은 영상 때문에... 뭐, 장난으로 찍은 건데 그렇게 화낼 일인가 싶었지만요."
            elif "대화" in question:
                response = "마지막 대화요? 음... 웃긴 건 아니었어요. 걔가 제 영상 편집 컴퓨터를 뒤져서 자기 몰래 찍은 영상을 발견한 거죠. 뭐, 장난으로 찍은 건데... '이거 SNS에 올리면 죽여버린다'고 하더라고요. 농담 같지 않게... 아이러니하죠?"
            elif "감정" in question:
                response = "오호~ 철학적인 질문이네요! 감정이란... 음, 인생을 재밌게 만드는 소스 같은 거 아닐까요? 너무 많으면 짜고, 너무 없으면 싱겁고... 적당히 있어야 인생 맛이 나죠! 근데 가끔은 컨트롤하기 어려울 때도 있죠. 특히 화날 때..."
            else:
                response = "하! 그런 질문은 범인한테 직접 물어보셔야죠~ 농담이고요... 솔직히 지호랑은 좀 안 좋게 헤어졌지만, 그렇다고 죽이고 싶진 않았어요. 영상 유출 건은... 뭐, 장난이었는데 너무 심각하게 받아들인 것 같아요. 그래도 이렇게 될 줄은..."
    
    else:
        # 알 수 없는 캐릭터인 경우
        response = "응답을 생성할 수 없습니다."
    
    # 패턴 적용하여 응답 개선
    response = apply_patterns(response)
    
    # 일관성 확인 및 모순 해결
    response = check_consistency(response)
    
    # 응답 캐싱
    response_cache[cache_key] = response
    
    # 대화 기록 저장 (세션 ID가 있는 경우)
    if session_id:
        if character_id not in conversation_history[session_id]:
            conversation_history[session_id][character_id] = []
        conversation_history[session_id][character_id].append((question, response))
    
    return response

# 로컬 테스트용 코드
if __name__ == "__main__":
    test_character = {"id": "hangyeol", "name": "이한결", "personality": "논리적이고 책임감 있는 회장"}
    test_question = "사건 당일 네 행적을 말해줘."
    
    print("인간 캐릭터 응답:")
    print(generate_response(test_character, test_question, False))
    
    print("\nAI 범인 캐릭터 응답:")
    print(generate_response(test_character, test_question, True))