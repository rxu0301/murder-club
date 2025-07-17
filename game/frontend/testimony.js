/**
 * 동아리 살인사건: 피해자 동아리원 증언 시스템
 */

// 증언 데이터
const testimonyData = {
    // 방송반 1학년 조연우 (이한결 관련)
    yeonwoo: {
        name: "조연우",
        role: "방송반 1학년",
        emoji: "🎧",
        testimonies: {
            hangyeol: [
                "지우 선배랑 한결 선배가 최근에 과학 프로젝트 때문에 심하게 다퉜어요. '이건 조작이야'라며 선배가 꽤 강하게 몰아붙였죠. 그날 밤, 한결 선배가 꽤 불안해 보였던 기억이 나요.",
                "한결 선배가 평소와 달리 실험실 정리를 깔끔하게 하던데… 뭔가 숨기는 것 같았어요.",
                "사건 전날, 한결 선배가 USB를 손에 꼭 쥐고 있던 걸 봤어요. 그걸 누가 훔쳐가려는 것 같다는 걱정을 했다고 하더군요."
            ],
            ai: [
                "피해자가 인터뷰를 준비하면서 '기계처럼 말하는 사람'에 대해 걱정했어요. 감정이 없고 차갑다면서요.",
                "누군가 피해자에게 '네가 뭔가를 알아내면 위험할 거야'라고 위협하는 듯한 메시지를 보냈다고 들었어요.",
                "피해자가 이상한 손목 밴드를 본 적 있다고 했는데, 뭔가 사람 같지 않았대요."
            ]
        }
    },
    
    // 방송반 2학년 유다현 (김소이 관련)
    dahyun: {
        name: "유다현",
        role: "방송반 2학년",
        emoji: "🎤",
        testimonies: {
            soi: [
                "소이 선배는 며칠 전부터 감정적으로 많이 힘들어 보였어요. 피해자와 말다툼한 뒤로는 거의 동아리 방에도 안 나왔죠.",
                "일기장을 몰래 봤는데, 피해자에 대한 복잡한 마음이 적혀 있었어요. 뭔가 후회하는 것 같기도 하고요.",
                "사건 당일 아침, 소이 선배가 누군가에게 '더 이상 못 참겠다'고 문자를 보낸 걸 봤어요."
            ]
        }
    },
    
    // 방송반 3학년 신예성 (박주현 관련)
    yesung: {
        name: "신예성",
        role: "방송반 3학년",
        emoji: "🎥",
        testimonies: {
            juhyun: [
                "박주현 선배가 피해자와 다툰 뒤로 며칠간 연락이 끊겼어요. 평소 말수가 적었지만 그날은 더 조용했죠.",
                "스마트폰 액정이 깨진 걸 보고 '그날 싸움이 있었나?' 하는 생각이 들었어요.",
                "박주현 선배가 '모두가 거짓말하고 있다'는 말을 하면서도, 누구를 지칭하는지 밝히지 않았어요."
            ],
            seyun: [
                "정세윤 선배가 피해자에게 '네 아이디어는 위험하다'며 강하게 경고한 적 있어요.",
                "사건 당일, 정세윤 선배가 캠코더를 들고 있었는데, 영상 일부가 삭제된 걸 나중에 알게 됐어요.",
                "정세윤 선배가 피해자와 마지막으로 다툰 사람이라는 소문이 돌았어요. 분위기가 아주 냉랭했죠."
            ],
            ai: [
                "피해자가 인터뷰를 준비하면서 '기계처럼 말하는 사람'에 대해 걱정했어요. 감정이 없고 차갑다면서요.",
                "누군가 피해자에게 '네가 뭔가를 알아내면 위험할 거야'라고 위협하는 듯한 메시지를 보냈다고 들었어요.",
                "피해자가 이상한 손목 밴드를 본 적 있다고 했는데, 뭔가 사람 같지 않았대요."
            ]
        }
    }
};

// 게임 상태에 증언 관련 데이터 추가
if (!gameState.testimony) {
    gameState.testimony = {
        selectedWitnesses: [], // 선택된 증언자 ID 배열
        viewedTestimonies: {} // 이미 본 증언 (key: witnessId, value: suspectId)
    };
}

// 증언자 2명을 무작위로 선택하는 함수
function selectRandomWitnesses() {
    // 이미 선택된 증언자가 있으면 그대로 반환
    if (gameState.testimony.selectedWitnesses.length > 0) {
        return gameState.testimony.selectedWitnesses;
    }
    
    // 모든 증언자 ID 배열
    const allWitnessIds = Object.keys(testimonyData);
    
    // 무작위로 2명 선택
    const selectedIds = [];
    while (selectedIds.length < 2 && allWitnessIds.length > 0) {
        const randomIndex = Math.floor(Math.random() * allWitnessIds.length);
        const witnessId = allWitnessIds.splice(randomIndex, 1)[0];
        selectedIds.push(witnessId);
    }
    
    // 게임 상태에 저장
    gameState.testimony.selectedWitnesses = selectedIds;
    
    return selectedIds;
}

// 증언 모달 표시 함수
function showTestimonyModal() {
    // 선택된 증언자 가져오기
    const selectedWitnesses = selectRandomWitnesses();
    
    // 모달 생성
    const modal = document.createElement('div');
    modal.className = 'testimony-modal';
    modal.id = 'testimony-modal';
    
    // 모달 내용
    const modalContent = document.createElement('div');
    modalContent.className = 'testimony-modal-content';
    
    // 모달 닫기 버튼
    const closeButton = document.createElement('span');
    closeButton.className = 'close-testimony-modal';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 모달 제목
    const title = document.createElement('h3');
    title.textContent = '누구의 증언을 들어볼까요?';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    
    // 증언자 선택 컨테이너
    const witnessContainer = document.createElement('div');
    witnessContainer.className = 'witness-container';
    
    // 선택된 증언자 카드 생성
    selectedWitnesses.forEach(witnessId => {
        const witness = testimonyData[witnessId];
        
        const witnessCard = document.createElement('div');
        witnessCard.className = 'witness-card';
        
        // 이미 증언을 본 경우 비활성화
        const isViewed = gameState.testimony.viewedTestimonies[witnessId];
        if (isViewed) {
            witnessCard.classList.add('viewed');
        }
        
        witnessCard.innerHTML = `
            <div class="witness-emoji">${witness.emoji}</div>
            <div class="witness-name">${witness.name}</div>
            <div class="witness-role">${witness.role}</div>
            <button class="testimony-button" ${isViewed ? 'disabled' : ''}>
                ${isViewed ? '이미 들은 증언' : '증언 듣기'}
            </button>
        `;
        
        // 증언 듣기 버튼 이벤트
        if (!isViewed) {
            const button = witnessCard.querySelector('.testimony-button');
            button.addEventListener('click', () => {
                showWitnessTestimony(witnessId);
            });
        }
        
        witnessContainer.appendChild(witnessCard);
    });
    
    // 모달 구성
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(witnessContainer);
    modal.appendChild(modalContent);
    
    // 모달 표시
    document.body.appendChild(modal);
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 증언자의 증언 표시 함수
function showWitnessTestimony(witnessId) {
    const witness = testimonyData[witnessId];
    
    // 이미 증언을 본 경우 처리
    if (gameState.testimony.viewedTestimonies[witnessId]) {
        return;
    }
    
    // 증언할 용의자 선택 (무작위)
    const availableSuspects = Object.keys(witness.testimonies);
    const suspectId = availableSuspects[Math.floor(Math.random() * availableSuspects.length)];
    
    // 해당 용의자에 대한 증언 중 무작위 선택
    const testimonies = witness.testimonies[suspectId];
    const testimony = testimonies[Math.floor(Math.random() * testimonies.length)];
    
    // 증언 모달 제거
    const testimonyModal = document.getElementById('testimony-modal');
    if (testimonyModal) {
        document.body.removeChild(testimonyModal);
    }
    
    // 증언 내용 모달 생성
    const modal = document.createElement('div');
    modal.className = 'testimony-content-modal';
    modal.id = 'testimony-content-modal';
    
    // 모달 내용
    const modalContent = document.createElement('div');
    modalContent.className = 'testimony-content-modal-content';
    
    // 모달 닫기 버튼
    const closeButton = document.createElement('span');
    closeButton.className = 'close-testimony-content-modal';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 증언자 정보
    const witnessInfo = document.createElement('div');
    witnessInfo.className = 'testimony-witness-info';
    witnessInfo.innerHTML = `
        <div class="testimony-witness-emoji">${witness.emoji}</div>
        <div class="testimony-witness-details">
            <div class="testimony-witness-name">${witness.name}</div>
            <div class="testimony-witness-role">${witness.role}</div>
        </div>
    `;
    
    // 증언 내용
    const testimonyContent = document.createElement('div');
    testimonyContent.className = 'testimony-content';
    testimonyContent.innerHTML = `
        <div class="testimony-bubble">
            <p>${testimony}</p>
        </div>
    `;
    
    // 버튼 컨테이너
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'testimony-buttons';
    
    // 돌아가기 버튼
    const backButton = document.createElement('button');
    backButton.className = 'testimony-back-button';
    backButton.textContent = '⬅ 돌아가기';
    backButton.addEventListener('click', () => {
        document.body.removeChild(modal);
        showTestimonyModal();
    });
    
    // 닫기 버튼
    const closeModalButton = document.createElement('button');
    closeModalButton.className = 'testimony-close-button';
    closeModalButton.textContent = '닫기';
    closeModalButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 버튼 추가
    buttonContainer.appendChild(backButton);
    buttonContainer.appendChild(closeModalButton);
    
    // 모달 구성
    modalContent.appendChild(closeButton);
    modalContent.appendChild(witnessInfo);
    modalContent.appendChild(testimonyContent);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    
    // 모달 표시
    document.body.appendChild(modal);
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // 증언 기록
    gameState.testimony.viewedTestimonies[witnessId] = suspectId;
    
    // 증언 효과음 재생 (선택 사항)
    playTestimonySound();
}

// 증언 효과음 재생 함수
function playTestimonySound() {
    // 효과음 재생 코드 (필요시 구현)
    // const sound = new Audio('path/to/testimony-sound.mp3');
    // sound.play();
}

// 증언 시스템 초기화 함수
function initTestimonySystem() {
    // 게임 시작 시 증언 데이터 초기화
    gameState.testimony = {
        selectedWitnesses: [], // 선택된 증언자 ID 배열
        viewedTestimonies: {} // 이미 본 증언 (key: witnessId, value: suspectId)
    };
    
    // 무작위 증언자 선택
    selectRandomWitnesses();
}