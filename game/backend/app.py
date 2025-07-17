"""
동아리 살인사건: 범인은 AI다 - 백엔드 서버
Flask 기반 RESTful API 서버
"""
import os
import json
import random
import sqlite3
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)  # CORS 설정

# 프론트엔드 파일 경로
FRONTEND_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')

# 데이터베이스 경로
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'game.db')

# 캐릭터 정보
CHARACTERS = [
    {"id": "hangyeol", "name": "이한결", "personality": "논리적이고 책임감 있는 회장"},
    {"id": "soi", "name": "김소이", "personality": "수다스럽고 감정이 풍부"},
    {"id": "juhyun", "name": "박주현", "personality": "말수가 적고 단답형, 핵심만 말함"},
    {"id": "seyun", "name": "정세윤", "personality": "유머러스하고 위트 있는 농담 구사"}
]

# 질문 목록
QUESTIONS = [
    {"id": 1, "text": "사건 당일 네 행적을 말해줘."},
    {"id": 2, "text": "피해자와 마지막으로 대화한 게 뭐였어?"},
    {"id": 3, "text": "감정이란 게 무엇이라고 생각해?"},
    {"id": 4, "text": "범인이 너라면 이유가 뭐야?"},
    {"id": 5, "text": "그날 무슨 기분이었어?"},
    {"id": 6, "text": "넌 왜 동아리에 가입했어?"},
    {"id": 7, "text": "사건 이후 밤에 잠은 잘 잤어?"},
    {"id": 8, "text": "친구의 죽음을 어떻게 받아들이고 있어?"},
    {"id": 9, "text": "자신을 한 단어로 표현한다면?"},
    {"id": 10, "text": "진실을 밝히는 게 중요하다고 생각해?"}
]

# 데이터베이스 초기화
def init_db():
    """데이터베이스 초기화 함수"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 게임 세션 테이블
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS game_sessions (
        session_id TEXT PRIMARY KEY,
        culprit_id TEXT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        game_state TEXT NOT NULL,
        result_correct BOOLEAN,
        guessed_character_id TEXT
    )
    ''')
    
    # 대화 테이블
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        character_id TEXT NOT NULL,
        question_id INTEGER NOT NULL,
        response TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        FOREIGN KEY (session_id) REFERENCES game_sessions(session_id)
    )
    ''')
    
    # 질문 테이블
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS asked_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        question_id INTEGER NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        FOREIGN KEY (session_id) REFERENCES game_sessions(session_id)
    )
    ''')
    
    conn.commit()
    conn.close()

# 데이터베이스 초기화 호출
init_db()

# API 엔드포인트: 게임 시작
@app.route('/api/start', methods=['POST'])
def start_game():
    """새 게임 세션 생성"""
    data = request.json or {}
    difficulty = data.get('difficulty', 'normal')  # 기본값: normal
    
    # 난이도 검증
    if difficulty not in ['easy', 'normal', 'hard']:
        difficulty = 'normal'
    
    session_id = str(uuid.uuid4())
    culprit_id = random.choice([char["id"] for char in CHARACTERS])
    
    # 난이도별 최대 질문 수 설정
    max_questions = {
        'easy': 7,
        'normal': 5,
        'hard': 3
    }
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 데이터베이스 스키마 확장 (difficulty 컬럼이 없는 경우 추가)
    try:
        cursor.execute("ALTER TABLE game_sessions ADD COLUMN difficulty TEXT DEFAULT 'normal'")
    except sqlite3.OperationalError:
        # 컬럼이 이미 존재하는 경우
        pass
    
    cursor.execute(
        "INSERT INTO game_sessions (session_id, culprit_id, start_time, game_state, difficulty) VALUES (?, ?, ?, ?, ?)",
        (session_id, culprit_id, datetime.now().isoformat(), "INTRO", difficulty)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "session_id": session_id,
        "characters": [char for char in CHARACTERS],
        "questions": QUESTIONS,
        "max_questions": max_questions[difficulty],
        "difficulty": difficulty
    })

# API 엔드포인트: 질문 처리
@app.route('/api/question', methods=['POST'])
def process_question():
    """질문 처리 및 응답 생성"""
    try:
        data = request.json
        session_id = data.get('session_id')
        character_id = data.get('character_id')
        question_id = data.get('question_id')
        
        print(f"질문 요청 받음: session_id={session_id}, character_id={character_id}, question_id={question_id}")
        
        if not all([session_id, character_id, question_id]):
            return jsonify({"error": "필수 파라미터가 누락되었습니다."}), 400
        
        # 세션 유효성 검사
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT culprit_id, game_state FROM game_sessions WHERE session_id = ?", (session_id,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return jsonify({"error": "유효하지 않은 세션입니다."}), 404
        
        culprit_id, game_state = result
        
        # 질문 내용 가져오기
        # question_id가 문자열로 전달될 수 있으므로 정수로 변환
        try:
            question_id_int = int(question_id)
        except (ValueError, TypeError):
            question_id_int = question_id
        
        question_text = next((q["text"] for q in QUESTIONS if q["id"] == question_id_int), "")
        
        # 캐릭터 정보 가져오기
        character = next((c for c in CHARACTERS if c["id"] == character_id), None)
        
        if not character:
            conn.close()
            return jsonify({"error": "유효하지 않은 캐릭터입니다."}), 404
        
        # 이미 질문한 내역 확인
        cursor.execute("SELECT COUNT(*) FROM asked_questions WHERE session_id = ? AND question_id = ?", (session_id, question_id_int))
        already_asked = cursor.fetchone()[0]
        
        # 이미 질문한 경우, 기존 응답 반환
        if already_asked > 0:
            cursor.execute(
                "SELECT response FROM conversations WHERE session_id = ? AND character_id = ? AND question_id = ?", 
                (session_id, character_id, question_id_int)
            )
            existing_response = cursor.fetchone()
            
            if existing_response:
                # 남은 질문 수 계산 (난이도별)
                cursor.execute("SELECT COUNT(*) FROM asked_questions WHERE session_id = ?", (session_id,))
                question_count = cursor.fetchone()[0]
                cursor.execute("SELECT difficulty FROM game_sessions WHERE session_id = ?", (session_id,))
                difficulty_result = cursor.fetchone()
                difficulty = difficulty_result[0] if difficulty_result else 'normal'
                max_questions = {'easy': 7, 'normal': 5, 'hard': 3}
                max_q = max_questions.get(difficulty, 5)
                remaining_questions = max_q - question_count
                
                conn.close()
                return jsonify({
                    "character_id": character_id,
                    "character_name": character["name"],
                    "question_id": question_id_int,
                    "question_text": question_text,
                    "response": existing_response[0],
                    "remaining_questions": remaining_questions
                })
        
        # 난이도별 최대 질문 수 가져오기
        cursor.execute("SELECT difficulty FROM game_sessions WHERE session_id = ?", (session_id,))
        difficulty_result = cursor.fetchone()
        difficulty = difficulty_result[0] if difficulty_result else 'normal'
        
        max_questions = {
            'easy': 7,
            'normal': 5,
            'hard': 3
        }
        max_q = max_questions.get(difficulty, 5)
        
        # 질문 수 확인
        cursor.execute("SELECT COUNT(DISTINCT question_id) FROM asked_questions WHERE session_id = ?", (session_id,))
        question_count = cursor.fetchone()[0]
        
        if question_count >= max_q and not already_asked:
            conn.close()
            return jsonify({"error": "더 이상 질문할 수 없습니다."}), 400
        
        # 새 질문인 경우, 질문 기록
        if not already_asked:
            cursor.execute(
                "INSERT INTO asked_questions (session_id, question_id, timestamp) VALUES (?, ?, ?)",
                (session_id, question_id_int, datetime.now().isoformat())
            )
            
            # 게임 상태 업데이트
            if game_state != "QUESTIONING":
                cursor.execute("UPDATE game_sessions SET game_state = ? WHERE session_id = ?", ("QUESTIONING", session_id))
        
        # AI 응답 생성
        from ai_service import generate_response
        is_culprit = (character_id == culprit_id)
        response = generate_response(character, question_text, is_culprit, session_id)
        
        # 응답 저장 (이미 있는 경우 덮어쓰지 않음)
        if not already_asked:
            cursor.execute(
                "INSERT INTO conversations (session_id, character_id, question_id, response, timestamp) VALUES (?, ?, ?, ?, ?)",
                (session_id, character_id, question_id_int, response, datetime.now().isoformat())
            )
        
        # 남은 질문 수 계산 (난이도별)
        remaining_questions = max_q - question_count
        
        # 마지막 질문이면 상태 업데이트
        if remaining_questions == 0:
            cursor.execute("UPDATE game_sessions SET game_state = ? WHERE session_id = ?", ("GUESSING", session_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "character_id": character_id,
            "character_name": character["name"],
            "question_id": question_id_int,
            "question_text": question_text,
            "response": response,
            "remaining_questions": remaining_questions
        })
    
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        return jsonify({"error": f"서버 오류: {str(e)}"}), 500

# API 엔드포인트: 범인 추리
@app.route('/api/guess', methods=['POST'])
def process_guess():
    """범인 추리 결과 처리"""
    data = request.json
    session_id = data.get('session_id')
    character_id = data.get('character_id')
    
    if not all([session_id, character_id]):
        return jsonify({"error": "필수 파라미터가 누락되었습니다."}), 400
    
    # 세션 유효성 검사
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT culprit_id FROM game_sessions WHERE session_id = ?", (session_id,))
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        return jsonify({"error": "유효하지 않은 세션입니다."}), 404
    
    actual_culprit_id = result[0]
    is_correct = (character_id == actual_culprit_id)
    
    # 결과 저장
    cursor.execute(
        "UPDATE game_sessions SET game_state = ?, result_correct = ?, guessed_character_id = ?, end_time = ? WHERE session_id = ?",
        ("RESULT", is_correct, character_id, datetime.now().isoformat(), session_id)
    )
    
    conn.commit()
    
    # 범인 캐릭터 정보 가져오기
    actual_culprit = next((c for c in CHARACTERS if c["id"] == actual_culprit_id), None)
    guessed_character = next((c for c in CHARACTERS if c["id"] == character_id), None)
    
    conn.close()
    
    return jsonify({
        "correct": is_correct,
        "guessed_character": guessed_character,
        "actual_culprit": actual_culprit,
        "feedback": "축하합니다! 범인을 찾았습니다." if is_correct else "아쉽네요. 범인을 찾지 못했습니다."
    })

# API 엔드포인트: 게임 상태 조회
@app.route('/api/status', methods=['GET'])
def get_game_status():
    """현재 게임 상태 조회"""
    session_id = request.args.get('session_id')
    
    if not session_id:
        return jsonify({"error": "세션 ID가 필요합니다."}), 400
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 게임 세션 정보 조회
    cursor.execute("SELECT * FROM game_sessions WHERE session_id = ?", (session_id,))
    session = cursor.fetchone()
    
    if not session:
        conn.close()
        return jsonify({"error": "유효하지 않은 세션입니다."}), 404
    
    # 질문 내역 조회
    cursor.execute("SELECT question_id FROM asked_questions WHERE session_id = ? ORDER BY timestamp", (session_id,))
    asked_questions = [row[0] for row in cursor.fetchall()]
    
    # 대화 내역 조회
    cursor.execute("""
        SELECT c.character_id, c.question_id, c.response
        FROM conversations c
        WHERE c.session_id = ?
        ORDER BY c.timestamp
    """, (session_id,))
    conversations = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        "game_state": session["game_state"],
        "asked_questions": asked_questions,
        "conversations": conversations,
        "result": {
            "correct": session["result_correct"],
            "guessed_character_id": session["guessed_character_id"],
            "actual_culprit_id": session["culprit_id"]
        } if session["game_state"] == "RESULT" else None
    })

# 정적 파일 서빙을 위한 라우트
@app.route('/')
def index():
    return send_from_directory(FRONTEND_PATH, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(FRONTEND_PATH, path)

if __name__ == '__main__':
    app.run(debug=True, port=5001)