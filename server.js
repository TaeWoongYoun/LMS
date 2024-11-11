const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3001;

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'User'
});

// 데이터베이스 연결을 시도합니다.
db.connect((err) => {
    if (err) {
        console.error('데이터베이스 연결 실패', err);
        return;
    }
    console.log('데이터베이스 연결 성공');
});

// CORS 허용을 위해 cors 미들웨어 사용
app.use(cors());
// 요청 본문을 JSON으로 파싱하기 위해 body-parser 미들웨어 사용
app.use(bodyParser.json({ limit: '50mb' }));
// 정적 파일 제공
app.use(express.static('public'));

// 폴더 존재 여부 확인 및 생성 함수
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// 파일 이름 검증 함수
function validateFileName(fileName) {
    const validPattern = /^[a-zA-Z0-9-_]+$/;
    return validPattern.test(fileName);
}

// iframeData 파일에 데이터 추가 함수
async function appendToIframeDataFile(newData) {
    const iframeDataPath = path.join(__dirname, 'src', 'data', 'iframeData.js');
    let content = '';
    try {
        content = await fs.readFile(iframeDataPath, 'utf8');
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
        content = 'const iframeData = [];\n\nexport default iframeData;';
    }

    const lastArrayIndex = content.lastIndexOf(']');
    if (lastArrayIndex === -1) {
        throw new Error('유효하지 않은 파일 형식');
    }

    const newEntry = `{ level: ${newData.level}, module: "${newData.module}", name: "${newData.name}", description: "${newData.description}", path: "${newData.path}", title: "${newData.title}" }`;
    const separator = content.slice(0, lastArrayIndex).trim().endsWith('[') ? '' : ',\n';
    const newContent = content.slice(0, lastArrayIndex) + (separator + newEntry + '\n];\n\nexport default iframeData;');

    await fs.writeFile(iframeDataPath, newContent, 'utf8');
}

// 회원가입 API
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

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

        const isMatch = await bcrypt.compare(password, result[0].password);
        if (!isMatch) {
            return res.status(401).send('이메일 또는 비밀번호가 잘못되었습니다.');
        }

        const token = jwt.sign({ id: result[0].id, email: result[0].email }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    });
});

// 모듈 저장 API
app.post('/api/save-module', async (req, res) => {
    const { iframeData, files } = req.body;

    if (!iframeData || !files) {
        return res.status(400).json({ error: '잘못된 데이터 형식입니다.' });
    }

    const folderName = iframeData.path.split('/').slice(-2)[0];
    if (!validateFileName(folderName)) {
        return res.status(400).json({
            error: '폴더명은 영문자, 숫자, 하이픈, 언더스코어만 사용할 수 있습니다.'
        });
    }

    const baseDir = path.join(__dirname, 'public');
    const moduleDir = path.join(baseDir, path.dirname(iframeData.path));

    await ensureDirectoryExists(moduleDir);

    await fs.writeFile(path.join(moduleDir, 'index.html'), files.html, 'utf8');
    await fs.writeFile(path.join(moduleDir, 'style.css'), files.css || '/* No CSS provided */', 'utf8');
    if (files.js) {
        await fs.writeFile(path.join(moduleDir, 'script.js'), files.js, 'utf8');
    }

    await appendToIframeDataFile({
        level: iframeData.level,
        module: iframeData.module,
        name: iframeData.name,
        description: iframeData.description,
        path: iframeData.path,
        title: iframeData.title
    });

    res.status(200).json({
        message: '모듈이 성공적으로 저장되었습니다.',
        path: iframeData.path
    });
});

// 기본 라우트 처리 ("/" 경로)
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// 서버 실행
app.listen(port, () => {
    console.log(`서버가 ${port} 포트에서 실행 중입니다.`);
});
