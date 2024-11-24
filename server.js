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

const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'LMS' });

db.connect((err) => {
    if (err) {
        console.error('데이터베이스 연결 실패', err);
        return;
    }
    console.log('데이터베이스 연결 성공');
});

app.listen(port, () => {
    console.log(`서버가 ${port} 포트에서 실행 중입니다.`);
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
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
app.post('/api/register', (req, res) => {
    const { id, pw, name } = req.body;

    bcrypt.hash(pw, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: '비밀번호 처리 중 오류가 발생했습니다.' });
        }

        const sql = 'INSERT INTO user (id, pw, name) VALUES (?, ?, ?)';
        db.query(sql, [id, hashedPassword, name], (err, result) => {
            if (err) {
                return res.status(500).json({ error: '사용자 추가 중 오류가 발생했습니다.' });
            }
            res.status(201).json({ message: '회원가입 성공' });
        });
    });
});

// 로그인 API
app.post('/api/login', (req, res) => {
    const { id, pw } = req.body;

    const sql = 'SELECT * FROM user WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }

        const user = results[0];

        bcrypt.compare(pw, user.pw, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
            }

            const token = jwt.sign(
                { 
                    id: user.id, 
                    name: user.name,
                    role: user.role
                }, 
                'your_jwt_secret', 
                { expiresIn: '1h' }
            );

            res.status(200).json({ 
                message: '로그인 성공', 
                token,
                name: user.name,
                role: user.role
            });
        });
    });
});

app.get('/api/modules', async (req, res) => {
    try {
        const { level, module, search } = req.query;
        let sql = 'SELECT * FROM iframe_data';
        const params = [];
        const conditions = [];

        // 빈 문자열 체크를 추가하여 실제 값이 있는 경우만 필터링
        if (level !== undefined && level !== '') {
            conditions.push('level = ?');
            params.push(parseInt(level));
        }

        if (module && module !== '') {
            conditions.push('module = ?');
            params.push(module);
        }

        if (search && search.trim() !== '') {
            conditions.push('(name LIKE ? OR description LIKE ?)');
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY module, level, name';

        const [results] = await db.promise().query(sql, params);
        
        // 결과 로깅
        
        res.json(results);
    } catch (error) {
        console.error('모듈 목록 조회 중 오류:', error);
        res.status(500).json({ 
            error: '모듈 목록 조회 중 오류가 발생했습니다.',
            details: error.message,
            stack: error.stack // 개발 중에만 사용하고 프로덕션에서는 제거
        });
    }
});

// 사용자별 제출된 과제 조회 API
app.get('/api/submissions/user/:userName', async (req, res) => {
    try {
        const { userName } = req.params;
        const [results] = await db.promise().query(
            'SELECT * FROM submissions WHERE user_name = ?',
            [userName]
        );
        res.json(results);
    } catch (error) {
        console.error('사용자별 제출 과제 조회 중 오류:', error);
        res.status(500).json({ error: '사용자별 제출 과제 조회 중 오류가 발생했습니다.' });
    }
});

// 모듈 저장 API
app.post('/api/save-module', async (req, res) => {
    try {
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

        // 파일 저장
        const baseDir = path.join(__dirname, 'public');
        const moduleDir = path.join(baseDir, path.dirname(iframeData.path));

        await ensureDirectoryExists(moduleDir);

        await fs.writeFile(path.join(moduleDir, 'index.html'), files.html, 'utf8');
        await fs.writeFile(path.join(moduleDir, 'style.css'), files.css || '/* No CSS provided */', 'utf8');
        if (files.js) {
            await fs.writeFile(path.join(moduleDir, 'index.js'), files.js, 'utf8');
        }

        // DB에 모듈 정보 저장
        const [result] = await db.promise().query(
            'INSERT INTO iframe_data (level, module, name, description, path, title) VALUES (?, ?, ?, ?, ?, ?)',
            [iframeData.level, iframeData.module, iframeData.name, iframeData.description, iframeData.path, iframeData.title]
        );

        res.status(200).json({
            message: '모듈이 성공적으로 저장되었습니다.',
            path: iframeData.path,
            id: result.insertId
        });
    } catch (error) {
        console.error('모듈 저장 중 오류:', error);
        res.status(500).json({ error: '모듈 저장 중 오류가 발생했습니다.' });
    }
});

// 모듈 삭제 API
app.delete('/api/delete-module', async (req, res) => {
    const { path: modulePath, name } = req.body;
    
    try {
        const projectRoot = path.join(__dirname, '..');
        const moduleDir = path.join(projectRoot, 'react-start', 'public', modulePath.replace(/^\//, ''));
        const parentDir = path.dirname(moduleDir);
        await fs.rm(parentDir, { recursive: true, force: true });

        const iframeDataPath = path.join(projectRoot, 'react-start', 'src', 'data', 'iframeData.js');
        let content = await fs.readFile(iframeDataPath, 'utf8');
        
        const regex = new RegExp(`\\{[^}]*name:\\s*"${name}"[^}]*\\}`, 'g');
        content = content.replace(regex, '');
        
        content = content.replace(/,\s*,/g, ',');
        content = content.replace(/\[\s*,/, '[');
        content = content.replace(/,\s*\]/, ']');
        content = content.replace(/\n\s*\n/g, '\n');
        
        await fs.writeFile(iframeDataPath, content, 'utf8');

        res.status(200).json({ message: '삭제 완료' });
    } catch (error) {
        res.status(500).json({ error: '삭제 실패' });
    }
});

// 사용자 조회 API
app.get('/api/users', (req, res) => {
    const sql = 'SELECT idx, id, name, role FROM user WHERE id != "admin"';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: '사용자 조회 중 오류가 발생했습니다.' });
        }
        res.json(results);
    });
});

// 사용자 권한 변경 API
app.put('/api/users/:idx/role', (req, res) => {
    const userIdx = req.params.idx;
    const { role } = req.body;
    
    if (!['user', 'manager'].includes(role)) {
        return res.status(400).json({ error: '잘못된 권한 값입니다.' });
    }

    const sql = 'UPDATE user SET role = ? WHERE idx = ? AND id != "admin"';
    db.query(sql, [role, userIdx], (err, result) => {
        if (err) {
            return res.status(500).json({ error: '권한 변경 중 오류가 발생했습니다.' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없거나 관리자 계정입니다.' });
        }
        
        res.json({ message: '권한이 성공적으로 변경되었습니다.' });
    });
});

// 사용자 삭제 API
app.delete('/api/users/:idx', (req, res) => {
    const userIdx = req.params.idx;
    
    const sql = 'DELETE FROM user WHERE idx = ? AND id != "admin"';
    db.query(sql, [userIdx], (err, result) => {
        if (err) {
            return res.status(500).json({ error: '사용자 삭제 중 오류가 발생했습니다.' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없거나 관리자 계정입니다.' });
        }
        
        res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
    });
});

const multer = require('multer');

// 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 제한
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    }
});

// 과제 제출 API
app.post('/api/submit', upload.single('image'), (req, res) => {
    const { userName, description, assignmentName, assignmentPath } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    // 과제 제출
    const sql = 'INSERT INTO submissions (user_name, image_path, description, assignment_name, assignment_path) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [userName, imagePath, description, assignmentName, assignmentPath], (err, result) => {
        if (err) {
            console.error('과제 제출 중 오류:', err);
            return res.status(500).json({ error: '과제 제출 중 오류가 발생했습니다.' });
        }
        
        res.status(201).json({ 
            message: '과제가 성공적으로 제출되었습니다.',
            imagePath: imagePath
        });
    });
});

// 제출된 과제 목록 조회 API
app.get('/api/submissions', (req, res) => {
    const sql = `
        SELECT s.*, NOT EXISTS (
                    SELECT 1 
                    FROM completed_assignments ca 
                    WHERE ca.user_name = s.user_name 
                    AND ca.assignment_name = s.assignment_name
                ) as is_pending 
        FROM submissions s 
        ORDER BY s.submit_time DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('과제 목록 조회 중 오류 발생:', err);
            return res.status(500).json({ error: '과제 목록 조회 중 오류가 발생했습니다.' });
        }
        res.json(results);
    });
});

// 과제 완료 처리 API
app.post('/api/complete-assignment', async (req, res) => {
    try {
        const { userName, assignmentName } = req.body;

        await db.promise().beginTransaction();

        // 1. 제출된 과제의 이미지 경로 조회
        const [submissions] = await db.promise().query(
            'SELECT image_path FROM submissions WHERE user_name = ? AND assignment_name = ?',
            [userName, assignmentName]
        );

        if (submissions.length > 0) {
            // 2. 이미지 파일 삭제
            const imagePath = submissions[0].image_path;
            const fullImagePath = path.join(__dirname, 'public', imagePath);
            
            try {
                await fs.unlink(fullImagePath);
                console.log('이미지 파일 삭제 완료:', fullImagePath);
            } catch (error) {
                console.error('이미지 파일 삭제 실패:', error);
                // 파일 삭제 실패는 트랜잭션을 롤백하지 않음 (DB 처리는 계속 진행)
            }
        }

        // 3. 완료된 과제 테이블에 추가
        await db.promise().query(
            'INSERT INTO completed_assignments (user_name, assignment_name) VALUES (?, ?)',
            [userName, assignmentName]
        );

        // 4. 제출 테이블에서 과제 삭제
        await db.promise().query(
            'DELETE FROM submissions WHERE user_name = ? AND assignment_name = ?',
            [userName, assignmentName]
        );

        await db.promise().commit();
        res.json({ message: '과제가 성공적으로 완료 처리되었습니다.' });

    } catch (error) {
        await db.promise().rollback();

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: '이미 완료된 과제입니다.' });
        }
        
        console.error('과제 완료 처리 중 오류:', error);
        res.status(500).json({ error: '과제 완료 처리 중 오류가 발생했습니다.' });
    }
});

// 완료된 과제 목록 조회 API
app.get('/api/completed-assignments/:userName', (req, res) => {
    const { userName } = req.params;
    const sql = 'SELECT assignment_name, completed_at FROM completed_assignments WHERE user_name = ?';
    
    db.query(sql, [userName], (err, results) => {
        if (err) {
            return res.status(500).json({ error: '완료된 과제 조회 중 오류가 발생했습니다.' });
        }
        res.json(results);
    });
});

// 특정 과제 삭제 API
app.delete('/api/submissions/:idx', (req, res) => {
    const submissionIdx = req.params.idx;
    
    const sql = 'DELETE FROM submissions WHERE idx = ?';
    db.query(sql, [submissionIdx], (err, result) => {
        if (err) {
            return res.status(500).json({ error: '과제 삭제 중 오류가 발생했습니다.' });
        }
        
        res.json({ message: '과제가 성공적으로 삭제되었습니다.' });
    });
});


const TIERS = {
    BRONZE: { name: '브론즈', minScore: 0, maxScore: 29 },
    SILVER: { name: '실버', minScore: 30, maxScore: 59 },
    GOLD: { name: '골드', minScore: 60, maxScore: 99 },
    PLATINUM: { name: '플래티넘', minScore: 100, maxScore: 149 },
    DIAMOND: { name: '다이아몬드', minScore: 150, maxScore: Infinity }
};

// 사용자의 티어 계산 함수
function calculateTier(totalScore) {
    for (const [tier, range] of Object.entries(TIERS)) {
        if (totalScore >= range.minScore && totalScore <= range.maxScore) {
            return {
                tier: range.name, // 변경된 부분
                nextTier: getNextTierInfo(totalScore)
            };
        }
    }
    return null;
}

// 다음 티어까지 남은 점수 계산
function getNextTierInfo(currentScore) {
const tiers = Object.entries(TIERS);
for (let i = 0; i < tiers.length - 1; i++) {
    const currentTier = tiers[i][1];
    const nextTier = tiers[i + 1][1];
    if (currentScore >= currentTier.minScore && currentScore < nextTier.minScore) {
    return {
        name: nextTier.name,
        remainingScore: nextTier.minScore - currentScore
    };
    }
}
return null;
}

// 랭킹 정보 조회 API
app.get('/api/rankings', async (req, res) => {
try {
    const [results] = await db.promise().query(`
    SELECT 
        u.name,
        u.id,
        COUNT(DISTINCT ca.assignment_name) as completed_assignments,
        COALESCE(SUM(
        CASE 
            WHEN i.level = 0 THEN 1
            WHEN i.level = 1 THEN 2
            WHEN i.level = 2 THEN 4
            WHEN i.level = 3 THEN 6
            WHEN i.level = 4 THEN 10
            WHEN i.level = 5 THEN 50
        END
        ), 0) as total_score
    FROM user u
    LEFT JOIN completed_assignments ca ON u.name = ca.user_name
    LEFT JOIN iframe_data i ON ca.assignment_name = i.name
    WHERE u.id != 'admin'
    GROUP BY u.name, u.id
    ORDER BY total_score DESC, completed_assignments DESC
    `);
    
    const rankings = results.map((user, index) => ({
    ...user,
    rank: index + 1,
    ...calculateTier(user.total_score)
    }));

    res.json(rankings);
} catch (error) {
    console.error('랭킹 조회 중 오류:', error);
    res.status(500).json({ error: '랭킹 조회 중 오류가 발생했습니다.' });
}
});

const uploadDir = path.join(__dirname, 'public', 'uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// iframe_data 삭제 API
app.delete('/api/iframe-data/:idx', async (req, res) => {
    try {
        const { idx } = req.params;
        
        const [result] = await db.promise().query(
            'DELETE FROM iframe_data WHERE idx = ?',
            [idx]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '해당 데이터를 찾을 수 없습니다.' });
        }

        res.json({ message: '성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('데이터 삭제 중 오류:', error);
        res.status(500).json({ error: '데이터 삭제 중 오류가 발생했습니다.' });
    }
});

// 아이디 중복 확인 API
app.post('/api/check-id', (req, res) => {
    const { id } = req.body;

    // 아이디 유효성 검사
    const idRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!idRegex.test(id)) {
        return res.status(400).json({ 
            available: false,
            message: '아이디는 4-20자의 영문자와 숫자만 사용 가능합니다.'
        });
    }

    const sql = 'SELECT COUNT(*) as count FROM user WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                error: '아이디 중복 확인 중 오류가 발생했습니다.' 
            });
        }

        const isAvailable = results[0].count === 0;
        res.json({ 
            available: isAvailable,
            message: isAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'
        });
    });
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});