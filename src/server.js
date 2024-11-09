const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'User'
});

db.connect((err) => {
    if (err) {
        console.error('데이터베이스 연결 실패', err);
        return;
    }
    console.log('데이터베이스 연결 성공');
});

app.use(cors());
app.use(bodyParser.json());

// 회원가입 API
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL 쿼리로 회원정보 저장
    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(query, [email, hashedPassword], (err, result) => {
        if (err) {
            console.error('회원가입 오류:', err);
            return res.status(500).send('서버 오류');
        }
        res.status(200).send('회원가입 성공');
    });
});

// 로그인 API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, result) => {
        if (err) {
            console.error('로그인 오류:', err);
            return res.status(500).send('서버 오류');
        }

        if (result.length === 0) {
            return res.status(401).send('이메일 또는 비밀번호가 잘못되었습니다.');
        }

        // 비밀번호 비교
        const isMatch = await bcrypt.compare(password, result[0].password);
        if (!isMatch) {
            return res.status(401).send('이메일 또는 비밀번호가 잘못되었습니다.');
        }

        // 로그인 성공 후 JWT 토큰 발급
        const token = jwt.sign({ id: result[0].id, email: result[0].email }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    });
});

app.listen(port, () => {
    console.log(`서버가 ${port} 포트에서 실행 중`);
});
