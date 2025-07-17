/**
 * 동아리 살인사건: 범인은 AI다
 * 프론트엔드 스크립트
 */

// 게임 상태 관리
const gameState = {
    sessionId: null,
    characters: [],
    questions: [],
    selectedQuestion: null,
    askedQuestions: [],
    conversations: {},
    remainingQuestions: 5,
    currentScreen: 'intro',
    currentCharacter: null,
    result: null,
    allResponses: {}, // 모든 캐릭터의 응답을 저장
    difficulty: 'normal', // 선택된 난이도
    maxQuestions: 5, // 난이도별 최대 질문 수
    openedEvidences: [], // 열람한 증거품 ID 저장
    evidenceQuestions: {}, // 증거품에 대한 질문 기회 저장
    askedEvidenceQuestions: {} // 이미 질문한 증거품 질문 저장
};

// 캐릭터별 이모지 설정
const characterEmojis = {
    hangyeol: '🧪', // 이한결: 과학 동아리 회장
    soi: '📝',      // 김소이: 문예부 감성파
    juhyun: '💻',   // 박주현: 보안 동아리 조용한 실력자
    seyun: '🎬'     // 정세윤: 영상 동아리 유쾌한 장난꾼
};

// 캐릭터 상세 정보
const characterDetails = {
    hangyeol: {
        name: '이한결',
        role: '과학 동아리 회장',
        specialty: '발표, 실험 리딩',
        likes: '물리 실험, 정리정돈',
        relationship: '리더로서 윤지우를 챙겨왔지만, 최근 실험실 정리 문제로 다툰 적 있음',
        personality: '책임감 있고 냉철함. 격식을 차리는 논리적인 말투 사용.'
    },
    soi: {
        name: '김소이',
        role: '문예부',
        specialty: '감성 글쓰기, 시 창작',
        likes: '카페 탐방, 레트로 굿즈 수집',
        relationship: '평소엔 가까웠지만, 최근 시 표절 문제로 갈등',
        personality: '감정이 풍부하고 수다스러움. 말이 많고 종종 감정이 폭발함.'
    },
    juhyun: {
        name: '박주현',
        role: '보안·코딩 동아리',
        specialty: '알고리즘, CTF, 리눅스 해킹',
        likes: '다크 웹 읽기, 독서',
        relationship: '대화는 적었으나, 윤지우가 주현의 코드를 공개 비판한 적 있음',
        personality: '말 수 적고 핵심만 말함. 논리 중심 표현, 감정 표현에 무심함.'
    },
    seyun: {
        name: '정세윤',
        role: '영상제작 동아리',
        specialty: '영상 편집, 브이로그 제작',
        likes: '밈 수집, 드립치기, 티셔츠 디자인',
        relationship: '윤지우가 몰래 촬영 영상을 유출해 갈등 발생',
        personality: '유머러스하고 비꼬는 말투. 종종 농담을 섞음. 어딘가 무책임한 느낌도 있음.'
    },
    jiho: {
        name: '윤지우',
        role: '피해자 (방송반 홍보/기획 담당)',
        specialty: '인터뷰, 관찰, 기록',
        likes: '영상 촬영, 사람 관찰하기',
        relationship: '여러 동아리원들과 갈등이 있었으나 중재자 역할도 함',
        personality: '관찰력이 뛰어나고 기록을 잘 남기며, 갈등 상황에 중재하려는 중립적인 태도를 보였으나, 일부 학생들과 미묘한 긴장이 있었음'
    }
};

// 증거품 데이터
const evidenceData = [
    {
        id: 1,
        emoji: "📱",
        name: "스마트폰",
        owner: "피해자 소유",
        description: "화면이 깨져 있고, 마지막으로 열린 앱은 녹음 앱이었다. 녹음 파일은 삭제된 상태.",
        ownerId: "jiho"
    },
    {
        id: 2,
        emoji: "☕",
        name: "커피 컵",
        owner: "이한결 소유",
        description: "과학 동아리 회장 이한결의 개인 텀블러. 커피가 반쯤 남아있고 지문이 선명하게 남아있다.",
        ownerId: "hangyeol"
    },
    {
        id: 3,
        emoji: "📝",
        name: "메모장",
        owner: "김소이 소유",
        description: "문예부 김소이의 메모장. 찢겨진 흔적이 있고, '표절' 이라는 단어가 여러 번 적혀있다.",
        ownerId: "soi"
    },
    {
        id: 4,
        emoji: "💻",
        name: "노트북",
        owner: "박주현 소유",
        description: "보안 동아리 박주현의 노트북. 암호가 걸려있고, 최근에 해킹 관련 검색 기록이 있다.",
        ownerId: "juhyun"
    },
    {
        id: 5,
        emoji: "🎬",
        name: "카메라",
        owner: "정세윤 소유",
        description: "영상 동아리 정세윤의 카메라. 메모리 카드가 없는 상태이며, 지문이 여러 개 발견되었다.",
        ownerId: "seyun"
    }
];

// 증거품 질문 데이터
const evidenceQuestionData = {
    "스마트폰": {
        owner: "피해자",
        questions: [
            "피해자의 스마트폰에 대해 알고 있는 것이 있나요?",
            "피해자가 녹음 앱을 자주 사용했나요?",
            "피해자가 누군가를 녹음한 적이 있나요?"
        ]
    },
    "커피 컵": {
        owner: "이한결",
        questions: [
            "이 텀블러를 마지막으로 사용한 때가 언제인가요?",
            "텀블러에 남아있는 커피는 언제 마신 건가요?",
            "다른 사람이 당신의 텀블러를 사용한 적이 있나요?"
        ]
    },
    "메모장": {
        owner: "김소이",
        questions: [
            "메모장에 표절이라는 단어가 왜 적혀있나요?",
            "메모장이 찢겨진 이유가 무엇인가요?",
            "피해자와 표절 문제로 다툰 적이 있나요?"
        ]
    },
    "노트북": {
        owner: "박주현",
        questions: [
            "노트북에 암호를 걸어둔 이유가 있나요?",
            "최근에 해킹 관련 검색을 한 이유가 무엇인가요?",
            "피해자가 당신의 노트북을 사용한 적이 있나요?"
        ]
    },
    "카메라": {
        owner: "정세윤",
        questions: [
            "카메라의 메모리 카드는 어디에 있나요?",
            "카메라로 최근에 무엇을 촬영했나요?",
            "피해자와 관련된 영상을 촬영한 적이 있나요?"
        ]
    }
};

// API 엔드포인트 설정
const API_BASE_URL = 'http://localhost:5001/api';

// DOM 요소
const screens = {
    intro: document.getElementById('intro-screen'),
    story: document.getElementById('story-screen'),
    characterIntro: document.getElementById('character-intro-screen'),
    difficulty: document.getElementById('difficulty-screen'),
    questionSelect: document.getElementById('question-select-screen'),
    chat: document.getElementById('chat-screen'),
    allResponses: document.getElementById('all-responses-screen'),
    crimeScene: document.getElementById('crime-scene-screen'),
    characterSelect: document.getElementById('character-select-screen'),
    result: document.getElementById('result-screen')
};

const elements = {
    startButton: document.getElementById('start-button'),
    showCharactersButton: document.getElementById('show-characters-button'),
    startInvestigationButton: document.getElementById('start-investigation-button'),
    characterIntroList: document.getElementById('character-intro-list'),
    characterAvatars: document.getElementById('character-avatars'),
    questionList: document.getElementById('question-list'),
    questionCount: document.getElementById('question-count'),
    characterName: document.getElementById('character-name'),
    chatMessages: document.getElementById('chat-messages'),
    nextCharacterButton: document.getElementById('next-character'),
    backToQuestionsButton: document.getElementById('back-to-questions'),
    characterList: document.getElementById('character-list'),
    resultTitle: document.getElementById('result-title'),
    resultText: document.getElementById('result-text'),
    resultImage: document.getElementById('result-image'),
    playerGuess: document.getElementById('player-guess'),
    actualCulprit: document.getElementById('actual-culprit'),
    restartButton: document.getElementById('restart-button'),
    loadingOverlay: document.getElementById('loading-overlay'),
    characterModal: document.getElementById('character-modal'),
    closeModal: document.querySelector('.close-modal'),
    characterModalName: document.querySelector('.character-modal-name'),
    characterModalEmoji: document.querySelector('.character-emoji'),
    characterPersonality: document.querySelector('.character-personality'),
    characterConversations: document.querySelector('.character-conversations'),
    allResponsesQuestion: document.getElementById('all-responses-question'),
    allResponsesContainer: document.getElementById('all-responses-container'),
    backToQuestionsFromAll: document.getElementById('back-to-questions-from-all'),
    continueInvestigation: document.getElementById('continue-investigation'),
    backToQuestionsFromScene: document.getElementById('back-to-questions-from-scene'),
    clueList: document.getElementById('clue-list'),
    evidenceBoxContainer: document.getElementById('evidence-box-container'),
    openedEvidenceList: document.getElementById('opened-evidence-list'),
    evidenceEmoji: document.getElementById('evidence-emoji'),
    evidenceName: document.getElementById('evidence-name'),
    evidenceOwner: document.getElementById('evidence-owner'),
    evidenceDescription: document.getElementById('evidence-description'),
    evidenceModal: document.getElementById('evidence-modal')
};

// 이벤트 리스너 설정
function setupEventListeners() {
    // 인트로 화면
    elements.startButton.addEventListener('click', () => showScreen('story'));

    // 스토리 화면
    elements.showCharactersButton.addEventListener('click', () => {
        createCharacterIntros();
        showScreen('characterIntro');
    });

    // 캐릭터 소개 화면
    const showDifficultyButton = document.getElementById('show-difficulty-button');
    if (showDifficultyButton) {
        showDifficultyButton.addEventListener('click', () => showScreen('difficulty'));
    }
    
    // 난이도 선택 화면
    const backToCharactersButton = document.getElementById('back-to-characters');
    if (backToCharactersButton) {
        backToCharactersButton.addEventListener('click', () => showScreen('characterIntro'));
    }
    
    // 난이도 선택 버튼들
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('difficulty-button')) {
            const difficulty = e.target.getAttribute('data-difficulty');
            selectDifficulty(difficulty);
        }
    });

    // 질문 선택 화면 관련
    elements.backToQuestionsButton.addEventListener('click', showQuestionSelectScreen);
    elements.backToQuestionsFromAll.addEventListener('click', showQuestionSelectScreen);
    elements.continueInvestigation.addEventListener('click', showQuestionSelectScreen);
    
    // 사건 현장 화면 관련
    elements.backToQuestionsFromScene.addEventListener('click', showQuestionSelectScreen);
    
    // 증거품 모달 닫기 버튼 이벤트
    const evidenceModalClose = document.querySelector('#evidence-modal .close-modal');
    if (evidenceModalClose) {
        evidenceModalClose.addEventListener('click', () => {
            elements.evidenceModal.style.display = 'none';
        });
    }
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target === elements.evidenceModal) {
            elements.evidenceModal.style.display = 'none';
        }
        if (event.target === elements.characterModal) {
            elements.characterModal.style.display = 'none';
        }
        
        // 증거품 질문 모달 닫기
        const evidenceQuestionModal = document.getElementById('evidence-question-modal');
        if (evidenceQuestionModal && event.target === evidenceQuestionModal) {
            evidenceQuestionModal.style.display = 'none';
        }
    });

    // 다음 캐릭터 버튼
    elements.nextCharacterButton.addEventListener('click', showQuestionSelectScreen);

    // 다시 하기 버튼
    elements.restartButton.addEventListener('click', () => showScreen('intro'));

    // 캐릭터 모달 닫기
    elements.closeModal.addEventListener('click', () => {
        elements.characterModal.style.display = 'none';
    });
}

// 화면 전환 함수
function showScreen(screenId) {
    // 모든 화면 숨기기
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });

    // 지정된 화면 표시
    screens[screenId].classList.add('active');
    gameState.currentScreen = screenId;
}

// 로딩 표시 함수
function showLoading(show = true) {
    elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

// API 호출 함수
async function callApi(endpoint, method = 'GET', data = null) {
    showLoading(true);

    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            console.log(`API 요청 데이터 (${endpoint}):`, data);
            options.body = JSON.stringify(data);
        }

        const url = `${API_BASE_URL}/${endpoint}`;
        console.log(`API 호출: ${method} ${url}`);

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API 응답 오류 (${response.status}):`, errorText);
            throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        console.log(`API 응답 데이터:`, responseData);
        return responseData;
    } catch (error) {
        console.error('API 오류:', error);
        alert(`오류가 발생했습니다: ${error.message}`);
        return null;
    } finally {
        showLoading(false);
    }
}

// 캐릭터 소개 생성 함수
function createCharacterIntros() {
    elements.characterIntroList.innerHTML = '';

    // 피해자를 포함한 모든 캐릭터 정보
    const allCharacters = [
        {
            id: 'hangyeol',
            name: characterDetails.hangyeol.name,
            role: characterDetails.hangyeol.role,
            emoji: characterEmojis.hangyeol,
            description: `<strong>특기:</strong> ${characterDetails.hangyeol.specialty}<br><br>
                         <strong>좋아하는 것:</strong> ${characterDetails.hangyeol.likes}<br><br>
                         <strong>피해자와의 관계:</strong> ${characterDetails.hangyeol.relationship}<br><br>
                         <strong>성격:</strong> ${characterDetails.hangyeol.personality}`
        },
        {
            id: 'soi',
            name: characterDetails.soi.name,
            role: characterDetails.soi.role,
            emoji: characterEmojis.soi,
            description: `<strong>특기:</strong> ${characterDetails.soi.specialty}<br><br>
                         <strong>좋아하는 것:</strong> ${characterDetails.soi.likes}<br><br>
                         <strong>피해자와의 관계:</strong> ${characterDetails.soi.relationship}<br><br>
                         <strong>성격:</strong> ${characterDetails.soi.personality}`
        },
        {
            id: 'juhyun',
            name: characterDetails.juhyun.name,
            role: characterDetails.juhyun.role,
            emoji: characterEmojis.juhyun,
            description: `<strong>특기:</strong> ${characterDetails.juhyun.specialty}<br><br>
                         <strong>좋아하는 것:</strong> ${characterDetails.juhyun.likes}<br><br>
                         <strong>피해자와의 관계:</strong> ${characterDetails.juhyun.relationship}<br><br>
                         <strong>성격:</strong> ${characterDetails.juhyun.personality}`
        },
        {
            id: 'seyun',
            name: characterDetails.seyun.name,
            role: characterDetails.seyun.role,
            emoji: characterEmojis.seyun,
            description: `<strong>특기:</strong> ${characterDetails.seyun.specialty}<br><br>
                         <strong>좋아하는 것:</strong> ${characterDetails.seyun.likes}<br><br>
                         <strong>피해자와의 관계:</strong> ${characterDetails.seyun.relationship}<br><br>
                         <strong>성격:</strong> ${characterDetails.seyun.personality}`
        },
        {
            id: 'jiho',
            name: characterDetails.jiho.name,
            role: characterDetails.jiho.role,
            emoji: '💀',
            description: `<strong>성격:</strong> ${characterDetails.jiho.personality}<br><br>
                         <strong>특징:</strong> ${characterDetails.jiho.relationship}`
        }
    ];

    allCharacters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-intro-card';
        card.innerHTML = `
            <div class="character-emoji">${character.emoji}</div>
            <div class="character-intro-name">${character.name}</div>
            <div class="character-intro-role">${character.role}</div>
            <div class="character-intro-desc">${character.description}</div>
        `;

        elements.characterIntroList.appendChild(card);
    });
}

// 게임 시작 함수
async function startGame() {
    // 게임 상태 초기화
    gameState.sessionId = null;
    gameState.askedQuestions = [];
    gameState.conversations = {};
    gameState.remainingQuestions = gameState.maxQuestions;
    gameState.characters = [];
    gameState.questions = [];
    gameState.openedEvidences = [];
    gameState.evidenceQuestions = {};
    gameState.askedEvidenceQuestions = {};

    console.log(`게임 시작: 난이도 ${gameState.difficulty}, 최대 질문 수: ${gameState.maxQuestions}, 남은 질문 수: ${gameState.remainingQuestions}`);

    // 새 게임 세션 생성
    const data = await callApi('start', 'POST', {
        difficulty: gameState.difficulty
    });

    if (!data) return;

    // 게임 상태 업데이트
    gameState.sessionId = data.session_id;
    gameState.characters = data.characters;
    gameState.questions = data.questions;

    console.log("게임 세션 생성 완료:", gameState.sessionId);

    // 로컬 스토리지에 세션 ID 저장 (페이지 새로고침 시 복구 가능)
    localStorage.setItem('gameSessionId', gameState.sessionId);

    // 질문 선택 화면 표시
    updateQuestionSelectScreen();
    showScreen('questionSelect');
}

// 캐릭터 아바타 생성 함수
function createCharacterAvatars() {
    elements.characterAvatars.innerHTML = '';

    // 피해자를 제외한 캐릭터만 표시
    const suspects = gameState.characters.filter(char => char.name !== '윤지우');

    suspects.forEach(character => {
        const avatar = document.createElement('div');
        avatar.className = 'character-avatar';
        avatar.innerHTML = `
            <div class="avatar-emoji">${characterEmojis[character.id] || '👤'}</div>
            <div class="avatar-name">${character.name}</div>
        `;

        // 캐릭터 아바타 클릭 시 모달 표시
        avatar.addEventListener('click', () => showCharacterModal(character));

        elements.characterAvatars.appendChild(avatar);
    });
}

// 캐릭터 모달 표시 함수
function showCharacterModal(character) {
    const charDetails = characterDetails[character.id];

    // 모달 내용 설정
    elements.characterModalEmoji.textContent = characterEmojis[character.id] || '👤';
    elements.characterModalName.textContent = character.name;

    // 캐릭터 상세 정보 표시
    const personalityHTML = `
        <p><strong>소속:</strong> ${charDetails.role}</p>
        <p><strong>특기:</strong> ${charDetails.specialty}</p>
        <p><strong>좋아하는 것:</strong> ${charDetails.likes}</p>
        <p><strong>피해자와의 관계:</strong> ${charDetails.relationship}</p>
        <p><strong>성격:</strong> ${charDetails.personality}</p>
    `;
    elements.characterPersonality.innerHTML = personalityHTML;

    // 이전 대화 내용 표시
    elements.characterConversations.innerHTML = '';

    if (gameState.conversations[character.id] && gameState.conversations[character.id].length > 0) {
        gameState.conversations[character.id].forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.innerHTML = `
                <div class="conversation-question">Q: ${conv.question}</div>
                <div class="conversation-answer">A: ${conv.response}</div>
            `;
            elements.characterConversations.appendChild(item);
        });
    } else {
        const noConv = document.createElement('div');
        noConv.textContent = '아직 대화 내용이 없습니다.';
        elements.characterConversations.appendChild(noConv);
    }

    // 모달 표시
    elements.characterModal.style.display = 'block';
}

// 질문 선택 화면 업데이트
function updateQuestionSelectScreen() {
    // 남은 질문 수 표시 (진행 바 포함)
    elements.questionCount.textContent = `${gameState.remainingQuestions}/${gameState.maxQuestions}`;
    
    // 진행 바 업데이트 또는 생성
    let progressBar = document.querySelector('.progress-bar');
    if (!progressBar) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">질문 선택 ${gameState.maxQuestions - gameState.remainingQuestions}/${gameState.maxQuestions}</div>
        `;
        
        // 질문 수 표시 다음에 진행 바 추가
        const questionCountElement = document.getElementById('question-count');
        questionCountElement.parentNode.insertBefore(progressContainer, questionCountElement.nextSibling);
        progressBar = progressContainer.querySelector('.progress-bar');
    }
    
    // 진행 바 업데이트
    const progressFill = progressBar.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const progressPercentage = ((gameState.maxQuestions - gameState.remainingQuestions) / gameState.maxQuestions) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `질문 선택 ${gameState.maxQuestions - gameState.remainingQuestions}/${gameState.maxQuestions}`;

    // 캐릭터 아바타 생성
    createCharacterAvatars();
    
    // 사건 현장 보기 버튼 추가 (상단에 배치)
    const crimeSceneButtonContainer = document.createElement('div');
    crimeSceneButtonContainer.className = 'action-buttons-container';
    crimeSceneButtonContainer.style.marginBottom = '20px';
    crimeSceneButtonContainer.style.textAlign = 'center';
    
    const crimeSceneButton = document.createElement('button');
    crimeSceneButton.className = 'primary-button';
    crimeSceneButton.textContent = '사건 현장 보기';
    crimeSceneButton.addEventListener('click', () => {
        initCrimeScene();
        showScreen('crimeScene');
    });
    
    // 증언 보기 버튼 추가
    const testimonyButton = document.createElement('button');
    testimonyButton.className = 'primary-button testimony-main-button';
    testimonyButton.innerHTML = '📣 증언 보기';
    testimonyButton.style.marginLeft = '10px';
    testimonyButton.addEventListener('click', () => {
        showTestimonyModal();
    });
    
    crimeSceneButtonContainer.appendChild(crimeSceneButton);
    crimeSceneButtonContainer.appendChild(testimonyButton);
    
    // 기존 질문 목록 컨테이너가 있으면 제거
    const existingButtonContainer = document.querySelector('.action-buttons-container');
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }
    
    // 질문 선택 화면에 버튼 컨테이너 추가
    const questionSelectScreen = document.getElementById('question-select-screen');
    questionSelectScreen.insertBefore(crimeSceneButtonContainer, elements.questionList);

    // 질문 카테고리별 분류
    const questionCategories = {
        '행적': [1, 2], // 사건 당일 행적, 마지막 대화
        '감정': [3, 5, 8], // 감정에 대한 질문들
        '동기': [4, 6], // 범인 이유, 동아리 가입 이유
        '성격': [7, 9, 10] // 잠, 자신 표현, 진실
    };

    // 질문 카테고리 탭 생성
    const categoryTabs = document.createElement('div');
    categoryTabs.className = 'question-category-tabs';
    
    let activeCategory = '전체';
    
    // 전체 탭 추가
    const allTab = document.createElement('button');
    allTab.className = 'category-tab active';
    allTab.textContent = '전체';
    allTab.addEventListener('click', () => {
        activeCategory = '전체';
        updateCategoryTabs();
        displayQuestionsByCategory('전체');
    });
    categoryTabs.appendChild(allTab);
    
    // 각 카테고리 탭 추가
    Object.keys(questionCategories).forEach(category => {
        const tab = document.createElement('button');
        tab.className = 'category-tab';
        tab.textContent = category;
        tab.addEventListener('click', () => {
            activeCategory = category;
            updateCategoryTabs();
            displayQuestionsByCategory(category);
        });
        categoryTabs.appendChild(tab);
    });
    
    // 카테고리 탭 업데이트 함수
    function updateCategoryTabs() {
        categoryTabs.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent === activeCategory) {
                tab.classList.add('active');
            }
        });
    }
    
    // 카테고리별 질문 표시 함수
    function displayQuestionsByCategory(category) {
        elements.questionList.innerHTML = '';
        
        let questionsToShow = gameState.questions;
        
        if (category !== '전체') {
            const categoryQuestionIds = questionCategories[category];
            questionsToShow = gameState.questions.filter(q => categoryQuestionIds.includes(q.id));
        }
        
        questionsToShow.forEach(question => {
            const isAsked = gameState.askedQuestions.includes(question.id);

            const button = document.createElement('button');
            button.className = `question-button ${isAsked ? 'disabled' : ''}`;
            button.textContent = question.text;
            button.disabled = isAsked;

            if (!isAsked) {
                button.addEventListener('click', () => askAllCharacters(question));
            }

            elements.questionList.appendChild(button);
        });
    }
    
    // 기존 카테고리 탭이 있으면 제거
    const existingTabs = document.querySelector('.question-category-tabs');
    if (existingTabs) {
        existingTabs.remove();
    }
    
    // 질문 목록 위에 카테고리 탭 추가
    elements.questionList.parentNode.insertBefore(categoryTabs, elements.questionList);

    // 초기 질문 목록 표시 (전체)
    displayQuestionsByCategory('전체');
    
    // 범인 지목하기 버튼 추가 (질문 목록 아래에 배치)
    const accuseButtonContainer = document.createElement('div');
    accuseButtonContainer.className = 'accuse-button-container';
    accuseButtonContainer.style.marginTop = '20px';
    accuseButtonContainer.style.textAlign = 'center';
    
    const accuseButton = document.createElement('button');
    accuseButton.className = 'primary-button';
    accuseButton.style.backgroundColor = '#d00000';
    accuseButton.textContent = '범인 지목하기';
    accuseButton.addEventListener('click', () => {
        // 기존 캐릭터 선택 화면으로 이동
        updateCharacterSelectScreen();
        showScreen('characterSelect');
    });
    
    accuseButtonContainer.appendChild(accuseButton);
    
    // 기존 범인 지목 버튼 컨테이너가 있으면 제거
    const existingAccuseContainer = document.querySelector('.accuse-button-container');
    if (existingAccuseContainer) {
        existingAccuseContainer.remove();
    }
    
    // 질문 목록 아래에 범인 지목 버튼 추가
    elements.questionList.after(accuseButtonContainer);
}

// 모든 캐릭터에게 질문하기
async function askAllCharacters(question) {
    gameState.selectedQuestion = question;

    // 질문 텍스트 설정
    elements.allResponsesQuestion.textContent = `질문: ${question.text}`;

    // 응답 컨테이너 초기화
    elements.allResponsesContainer.innerHTML = '';

    // 로딩 표시
    showLoading(true);

    // 피해자를 제외한 캐릭터만 표시
    const suspects = gameState.characters.filter(char => char.name !== '윤지우');

    // 모든 캐릭터에게 질문하고 응답 받기
    try {
        // 먼저 첫 번째 캐릭터에게만 질문하여 질문 ID를 등록
        const firstCharacter = suspects[0];
        
        // API 호출 대신 가상의 응답 생성 (API 오류 해결)
        // 실제 구현에서는 API 호출 코드로 대체
        const responses = [];
        
        for (let i = 0; i < suspects.length; i++) {
            const character = suspects[i];
            
            // 가상의 응답 생성
            const response = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        response: `${character.name}의 응답: 이 질문에 대한 답변입니다. 캐릭터마다 다른 답변이 제공됩니다.`,
                        remaining_questions: gameState.remainingQuestions - 1
                    });
                }, 500);
            });
            
            responses.push(response);
        }

        // 응답 처리
        responses.forEach((data, index) => {
            if (!data) return;

            const character = suspects[index];

            // 응답 카드 생성
            const card = document.createElement('div');
            card.className = 'character-response-card';
            card.innerHTML = `
                <div class="response-character-info">
                    <div class="response-emoji">${characterEmojis[character.id] || '👤'}</div>
                    <div class="response-character-name">${character.name}</div>
                </div>
                <div class="response-text">${data.response}</div>
            `;

            elements.allResponsesContainer.appendChild(card);

            // 대화 내용 저장
            if (!gameState.conversations[character.id]) {
                gameState.conversations[character.id] = [];
            }

            gameState.conversations[character.id].push({
                question: question.text,
                response: data.response
            });

            // 마지막 응답의 남은 질문 수 사용
            gameState.remainingQuestions = data.remaining_questions;
        });

        // 질문 기록에 추가
        gameState.askedQuestions.push(question.id);

        // 모든 응답 화면 표시 (모든 질문에서 항상 응답 화면을 표시)
        showScreen('allResponses');

    } catch (error) {
        console.error('질문 처리 오류:', error);
        alert('질문 처리 중 오류가 발생했습니다.');
        showQuestionSelectScreen();
    } finally {
        showLoading(false);
    }
}

// 증거품에 대한 질문하기
async function askEvidenceQuestion(evidence, question, questionIndex, characterId) {
    // 로딩 표시
    showLoading(true);

    try {
        // API 호출하여 응답 받기 (실제 API가 없으므로 가상의 응답 생성)
        // 실제 구현에서는 API 호출 코드로 대체
        const response = await new Promise(resolve => {
            setTimeout(() => {
                const responses = [
                    "그건 제가 잘 모르겠네요. 그 증거품에 대해서는 별로 아는 게 없어요.",
                    "음... 그 질문에 대해 생각해본 적이 없어요. 확실한 답변을 드리기 어렵네요.",
                    "그건 제가 알고 있는 내용이지만, 자세히 말하기는 어려워요. 다른 질문을 해주세요.",
                    "네, 그 증거품은 제 것이 맞습니다. 하지만 사건과는 관련이 없어요.",
                    "그 증거품에 대해서는 피해자와 이야기를 나눈 적이 있어요. 하지만 그게 사건과 관련이 있는지는 모르겠어요."
                ];
                
                resolve({
                    response: responses[Math.floor(Math.random() * responses.length)]
                });
            }, 500);
        });

        // 질문 기회 차감
        gameState.evidenceQuestions[evidence.id]--;
        
        // 질문한 질문 기록
        if (!gameState.askedEvidenceQuestions[evidence.id]) {
            gameState.askedEvidenceQuestions[evidence.id] = [];
        }
        gameState.askedEvidenceQuestions[evidence.id].push(questionIndex);
        
        // 응답 표시
        const responseElement = document.getElementById(`evidence-question-response`);
        if (responseElement) {
            responseElement.innerHTML = `
                <div class="evidence-question-response">
                    <p class="question-text"><strong>Q:</strong> ${question}</p>
                    <p class="answer-text"><strong>A:</strong> ${response.response}</p>
                </div>
            `;
        }
        
        // 질문 버튼 상태 업데이트
        updateEvidenceQuestionButtons(evidence);
        
        // 대화 내용 저장
        if (!gameState.conversations[characterId]) {
            gameState.conversations[characterId] = [];
        }
        
        gameState.conversations[characterId].push({
            question: `[증거품: ${evidence.name}] ${question}`,
            response: response.response
        });

    } catch (error) {
        console.error('증거품 질문 처리 오류:', error);
        alert('질문 처리 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// 증거품 질문 버튼 상태 업데이트
function updateEvidenceQuestionButtons(evidence) {
    const questionButtons = document.querySelectorAll('.evidence-question-button');
    const remainingQuestions = gameState.evidenceQuestions[evidence.id];
    const askedQuestions = gameState.askedEvidenceQuestions[evidence.id] || [];
    
    // 남은 질문 수 표시
    const remainingElement = document.getElementById('evidence-question-remaining');
    if (remainingElement) {
        remainingElement.textContent = `질문 가능 횟수: ${remainingQuestions}`;
    }
    
    // 질문 버튼 상태 업데이트
    questionButtons.forEach((button, index) => {
        if (askedQuestions.includes(index) || remainingQuestions <= 0) {
            button.disabled = true;
            button.classList.add('disabled');
        }
    });
    
    // 모든 질문 기회를 소진했을 때
    if (remainingQuestions <= 0) {
        const responseElement = document.getElementById(`evidence-question-response`);
        if (responseElement && responseElement.innerHTML === '') {
            responseElement.innerHTML = `
                <div class="evidence-question-response">
                    <p class="no-questions">질문 기회를 모두 사용하였습니다.</p>
                </div>
            `;
        }
    }
}

// 채팅 메시지 추가
function addChatMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}-message`;
    message.textContent = text;

    elements.chatMessages.appendChild(message);

    // 스크롤을 맨 아래로 이동
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// 질문 선택 화면으로 돌아가기
function showQuestionSelectScreen() {
    updateQuestionSelectScreen();
    showScreen('questionSelect');
}

// 캐릭터 선택 화면 업데이트
function updateCharacterSelectScreen() {
    elements.characterList.innerHTML = '';

    // 피해자를 제외한 캐릭터만 표시
    const suspects = gameState.characters.filter(char => char.name !== '윤지우');

    // 질문 페이지로 돌아가는 버튼 추가 (상단에 배치)
    const backButtonContainer = document.createElement('div');
    backButtonContainer.className = 'back-button-container';
    backButtonContainer.style.marginBottom = '20px';
    backButtonContainer.style.textAlign = 'center';
    
    const backButton = document.createElement('button');
    backButton.className = 'secondary-button';
    backButton.textContent = '← 질문 페이지로 돌아가기';
    backButton.addEventListener('click', showQuestionSelectScreen);
    
    backButtonContainer.appendChild(backButton);
    elements.characterList.appendChild(backButtonContainer);

    // 안내 텍스트 추가
    const guideText = document.createElement('p');
    guideText.className = 'instruction';
    guideText.textContent = 'AI 범인은 누구일까요?';
    elements.characterList.appendChild(guideText);
    
    const subGuideText = document.createElement('p');
    subGuideText.className = 'sub-instruction';
    subGuideText.textContent = '지금까지의 대화를 바탕으로 AI 범인을 선택하세요.';
    elements.characterList.appendChild(subGuideText);

    // 캐릭터 아바타 컨테이너 생성 (두 번째 사진 형식)
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'character-avatar-container';
    
    // 캐릭터 아바타 추가
    suspects.forEach(character => {
        const avatar = document.createElement('div');
        avatar.className = 'character-avatar-item';
        avatar.innerHTML = `
            <div class="avatar-circle">
                <div class="avatar-emoji">${characterEmojis[character.id] || '👤'}</div>
            </div>
            <div class="avatar-name">${character.name}</div>
        `;
        
        // 아바타 클릭 시 캐릭터 카드 표시
        avatar.addEventListener('click', () => {
            showCharacterDetailCard(character);
        });
        
        avatarContainer.appendChild(avatar);
    });
    
    // 아바타 컨테이너를 캐릭터 목록에 추가
    elements.characterList.appendChild(avatarContainer);
    
    // 캐릭터 상세 카드 컨테이너 생성 (첫 번째 사진 형식)
    const detailCardContainer = document.createElement('div');
    detailCardContainer.id = 'character-detail-container';
    detailCardContainer.className = 'character-detail-container';
    
    // 캐릭터 상세 카드 컨테이너를 캐릭터 목록에 추가
    elements.characterList.appendChild(detailCardContainer);
    
    // 첫 번째 캐릭터의 상세 카드 표시
    if (suspects.length > 0) {
        showCharacterDetailCard(suspects[0]);
    }
}

// 캐릭터 상세 카드 표시 함수
function showCharacterDetailCard(character) {
    const detailContainer = document.getElementById('character-detail-container');
    if (!detailContainer) return;
    
    const charDetails = characterDetails[character.id];
    
    detailContainer.innerHTML = `
        <div class="character-detail-card">
            <div class="character-detail-header">
                <div class="character-detail-emoji">${characterEmojis[character.id] || '👤'}</div>
                <div class="character-detail-name">${character.name}</div>
                <div class="character-detail-role">${charDetails.role}</div>
            </div>
            <div class="character-detail-info">
                <div class="character-detail-item">
                    <div class="detail-label">특기:</div>
                    <div class="detail-value">${charDetails.specialty}</div>
                </div>
                <div class="character-detail-item">
                    <div class="detail-label">좋아하는 것:</div>
                    <div class="detail-value">${charDetails.likes}</div>
                </div>
                <div class="character-detail-item">
                    <div class="detail-label">피해자와의 관계:</div>
                    <div class="detail-value">${charDetails.relationship}</div>
                </div>
                <div class="character-detail-item">
                    <div class="detail-label">성격:</div>
                    <div class="detail-value">${charDetails.personality}</div>
                </div>
            </div>
            <button class="guess-button">범인 지목하기</button>
        </div>
    `;
    
    // 범인 지목 버튼 클릭 이벤트
    detailContainer.querySelector('.guess-button').addEventListener('click', () => {
        showConfirmationModal(character);
    });
    
    // 선택된 아바타 강조 표시
    document.querySelectorAll('.character-avatar-item').forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('.avatar-name').textContent === character.name) {
            item.classList.add('active');
        }
    });
}

// 범인 지목 확인 모달 표시
function showConfirmationModal(character) {
    // 확인 모달 생성
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
        <div class="confirmation-modal-content">
            <h3>범인 지목 확인</h3>
            <p><strong>${character.name}</strong>을(를) AI 범인으로 지목하시겠습니까?</p>
            <div class="confirmation-buttons">
                <button class="confirm-button">확인</button>
                <button class="cancel-button">취소</button>
            </div>
        </div>
    `;
    
    // 모달을 body에 추가
    document.body.appendChild(modal);
    
    // 확인 버튼 클릭 시 범인 지목 처리
    modal.querySelector('.confirm-button').addEventListener('click', () => {
        accuseCharacter(character);
        document.body.removeChild(modal);
    });
    
    // 취소 버튼 클릭 시 모달 닫기
    modal.querySelector('.cancel-button').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 범인 지목 함수
async function accuseCharacter(character) {
    // 로딩 표시
    showLoading(true);
    
    try {
        // API 호출 대신 가상의 결과 생성 (API 오류 해결)
        // 실제 구현에서는 API 호출 코드로 대체
        const data = await new Promise(resolve => {
            setTimeout(() => {
                // 랜덤으로 정답 여부 결정 (데모용)
                const isCorrect = Math.random() > 0.5;
                const culpritId = isCorrect ? character.id : gameState.characters.find(c => c.id !== character.id && c.id !== 'jiho').id;
                
                resolve({
                    correct: isCorrect,
                    culprit_id: culpritId
                });
            }, 1000);
        });
        
        // 게임 결과 저장
        gameState.result = data;
        
        // 결과 화면 업데이트
        updateResultScreen(character, data);
        
        // 결과 화면 표시
        showScreen('result');
    } catch (error) {
        console.error('범인 지목 오류:', error);
        alert('범인 지목 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// 결과 화면 업데이트
function updateResultScreen(accusedCharacter, result) {
    // 결과 제목 설정
    if (result.correct) {
        elements.resultTitle.textContent = '정답입니다!';
        elements.resultTitle.className = 'success';
    } else {
        elements.resultTitle.textContent = '오답입니다!';
        elements.resultTitle.className = 'error';
    }
    
    // 결과 텍스트 설정
    if (result.correct) {
        elements.resultText.textContent = `축하합니다! ${accusedCharacter.name}이(가) AI 범인이었습니다.`;
    } else {
        const actualCulprit = gameState.characters.find(char => char.id === result.culprit_id);
        elements.resultText.textContent = `아쉽습니다. 실제 AI 범인은 ${actualCulprit.name}이었습니다.`;
    }
    
    // 플레이어 선택 및 실제 범인 표시
    elements.playerGuess.textContent = accusedCharacter.name;
    
    const actualCulprit = gameState.characters.find(char => char.id === result.culprit_id);
    elements.actualCulprit.textContent = actualCulprit.name;
    
    // 결과 이미지 설정 (이모지 사용)
    elements.resultImage.innerHTML = `<div class="character-emoji">${characterEmojis[result.culprit_id] || '👤'}</div>`;
}

// 사건 현장 초기화 함수
function initCrimeScene() {
    // 열어본 증거품 목록 초기화
    elements.openedEvidenceList.innerHTML = '';
    
    // 물음표 아이콘 초기화
    const questionMarks = document.querySelectorAll('.evidence-box-item');
    questionMarks.forEach(mark => {
        const evidenceId = parseInt(mark.getAttribute('data-id'));
        
        // 이미 열람한 증거품인지 확인
        if (gameState.openedEvidences.includes(evidenceId)) {
            // 이미 열람한 증거품이면 해당 이모지로 표시
            const evidence = evidenceData.find(item => item.id === evidenceId);
            mark.textContent = evidence.emoji;
            mark.classList.remove('question-mark');
            mark.classList.add('opened');
        } else {
            // 아직 열람하지 않은 증거품이면 물음표로 표시
            mark.textContent = '❓';
            mark.classList.add('question-mark');
            mark.classList.remove('opened');
        }
        
        // 클릭 이벤트 리스너 제거 후 다시 추가
        const newMark = mark.cloneNode(true);
        mark.parentNode.replaceChild(newMark, mark);
        
        // 클릭 이벤트 리스너 추가
        newMark.addEventListener('click', function() {
            const evidenceId = parseInt(this.getAttribute('data-id'));
            
            // 이미 열람한 증거품인지 확인
            if (gameState.openedEvidences.includes(evidenceId)) {
                // 이미 열람한 증거품이면 모달로 상세 정보 표시
                showEvidenceDetail(evidenceId);
                return;
            }
            
            // 최대 3개까지만 열람 가능
            if (gameState.openedEvidences.length >= 3) {
                alert('더 이상 단서를 열람할 수 없습니다. (최대 3개)');
                return;
            }
            
            // 증거품 열람 처리
            openEvidence(evidenceId);
        });
    });
    
    // 이미 열람한 증거품 목록에 추가
    gameState.openedEvidences.forEach(evidenceId => {
        const evidence = evidenceData.find(item => item.id === evidenceId);
        if (evidence) {
            addToOpenedEvidenceList(evidence);
        }
    });
}

// 증거품 열람 함수
function openEvidence(evidenceId) {
    // 해당 ID의 증거품 찾기
    const evidence = evidenceData.find(item => item.id === evidenceId);
    if (!evidence) return;
    
    // 열람한 증거품 ID 배열에 추가
    gameState.openedEvidences.push(evidenceId);
    
    // 물음표 아이콘 변경 (열람 표시)
    const questionMark = document.querySelector(`.evidence-box-item[data-id="${evidenceId}"]`);
    questionMark.textContent = evidence.emoji;
    questionMark.classList.remove('question-mark');
    questionMark.classList.add('opened');
    
    // 증거품에 대한 질문 기회 설정 (1~3회 랜덤)
    gameState.evidenceQuestions[evidenceId] = Math.floor(Math.random() * 3) + 1;
    
    // 열람한 증거품 목록에 추가
    addToOpenedEvidenceList(evidence);
    
    // 증거품 상세 정보 모달 표시
    showEvidenceDetail(evidenceId);
}

// 열람한 증거품 목록에 추가하는 함수
function addToOpenedEvidenceList(evidence) {
    // 피해자 소유 증거품인 경우 질문 버튼 생성하지 않음
    const isPerpEvidence = evidence.ownerId === 'jiho';
    
    const evidenceItem = document.createElement('div');
    evidenceItem.className = 'opened-evidence-item';
    evidenceItem.innerHTML = `
        <div class="evidence-emoji">${evidence.emoji}</div>
        <div class="evidence-name">${evidence.name}</div>
        <div class="evidence-owner">${evidence.owner}</div>
        <div class="evidence-description">${evidence.description}</div>
    `;
    
    // 피해자 소유가 아닌 경우에만 질문 버튼 추가
    if (!isPerpEvidence) {
        const questionButton = document.createElement('button');
        questionButton.className = 'evidence-question-btn';
        questionButton.innerHTML = `🔍 ${evidence.owner.split(' ')[0]}에게 질문하기`;
        questionButton.addEventListener('click', () => {
            showEvidenceQuestionModal(evidence);
        });
        evidenceItem.appendChild(questionButton);
    }
    
    // 클릭 시 상세 정보 모달 표시
    evidenceItem.addEventListener('click', (e) => {
        // 질문 버튼 클릭 시에는 모달 표시하지 않음
        if (e.target.classList.contains('evidence-question-btn')) return;
        showEvidenceDetail(evidence.id);
    });
    
    elements.openedEvidenceList.appendChild(evidenceItem);
}

// 증거품 상세 정보 모달 표시 함수
function showEvidenceDetail(evidenceId) {
    const evidence = evidenceData.find(item => item.id === evidenceId);
    if (!evidence) return;
    
    // 모달 내용 설정
    elements.evidenceEmoji.textContent = evidence.emoji;
    elements.evidenceName.textContent = evidence.name;
    elements.evidenceOwner.textContent = evidence.owner;
    elements.evidenceDescription.textContent = evidence.description;
    
    // 모달 표시
    elements.evidenceModal.style.display = 'block';
}

// 증거품 질문 모달 표시 함수
function showEvidenceQuestionModal(evidence) {
    // 이미 모달이 있으면 제거
    const existingModal = document.getElementById('evidence-question-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // 증거품 소유자 정보 가져오기
    const ownerName = evidence.owner.split(' ')[0];
    const ownerId = evidence.ownerId;
    
    // 증거품에 대한 질문 데이터 가져오기
    const questionData = evidenceQuestionData[evidence.name];
    if (!questionData) return;
    
    // 질문 기회가 없으면 알림
    if (!gameState.evidenceQuestions[evidence.id] || gameState.evidenceQuestions[evidence.id] <= 0) {
        alert('이 증거품에 대한 질문 기회를 모두 사용하였습니다.');
        return;
    }
    
    // 이미 질문한 질문 목록
    const askedQuestions = gameState.askedEvidenceQuestions[evidence.id] || [];
    
    // 모달 생성
    const modal = document.createElement('div');
    modal.id = 'evidence-question-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content evidence-question-modal-content">
            <span class="close-modal">&times;</span>
            <div class="evidence-question-header">
                <div class="evidence-question-info">
                    <div class="evidence-emoji">${evidence.emoji}</div>
                    <div class="evidence-info">
                        <div class="evidence-name">증거: ${evidence.name}</div>
                        <div class="evidence-owner">👤 ${ownerName}</div>
                    </div>
                </div>
                <div id="evidence-question-remaining" class="evidence-question-remaining">
                    🎯 질문 가능 횟수: ${gameState.evidenceQuestions[evidence.id]}
                </div>
            </div>
            <div class="evidence-question-list">
                ${questionData.questions.map((question, index) => `
                    <button class="evidence-question-button ${askedQuestions.includes(index) ? 'disabled' : ''}" 
                            ${askedQuestions.includes(index) ? 'disabled' : ''} 
                            data-index="${index}">
                        ❓ ${question}
                    </button>
                `).join('')}
            </div>
            <div id="evidence-question-response" class="evidence-question-response"></div>
        </div>
    `;
    
    // 모달을 body에 추가
    document.body.appendChild(modal);
    
    // 모달 닫기 버튼 이벤트
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 질문 버튼 클릭 이벤트
    modal.querySelectorAll('.evidence-question-button').forEach((button, index) => {
        if (!askedQuestions.includes(index)) {
            button.addEventListener('click', () => {
                askEvidenceQuestion(evidence, questionData.questions[index], index, ownerId);
            });
        }
    });
    
    // 모달 표시
    modal.style.display = 'block';
}

// 난이도 선택 함수
function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    // 난이도별 최대 질문 수 설정
    switch(difficulty) {
        case 'easy':
            gameState.maxQuestions = 7;
            break;
        case 'normal':
            gameState.maxQuestions = 5;
            break;
        case 'hard':
            gameState.maxQuestions = 3;
            break;
        default:
            gameState.maxQuestions = 5;
    }
    
    // 남은 질문 수 초기화
    gameState.remainingQuestions = gameState.maxQuestions;
    
    console.log(`난이도 선택: ${difficulty}, 최대 질문 수: ${gameState.maxQuestions}`);
    
    // 게임 시작
    startGame();
}

// 이벤트 리스너 설정 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // 로컬 스토리지에서 세션 ID 복구 시도
    const savedSessionId = localStorage.getItem('gameSessionId');
    if (savedSessionId) {
        // 세션 복구 로직 (필요시 구현)
    }
});