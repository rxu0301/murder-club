"""
데이터베이스 초기화 스크립트
"""
import os
import sqlite3

# 데이터베이스 경로
DB_PATH = os.path.join(os.path.dirname(__file__), 'game.db')

def init_db():
    """데이터베이스 초기화 함수"""
    # 이전 DB 파일이 있으면 삭제
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    
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
    
    print(f"데이터베이스가 초기화되었습니다: {DB_PATH}")

if __name__ == "__main__":
    init_db()