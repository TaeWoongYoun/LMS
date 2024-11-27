import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer from 'multer';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import * as fs from 'fs/promises';
import bodyParser from 'body-parser';
import axios from 'axios';

// ES Module에서 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Express 앱 설정
const app = express();
const port = 3001;

// GitHub API 설정
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API = 'https://api.github.com';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// 데이터베이스 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'LMS'
});

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    }
});

// 유틸리티 함수
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

function validateFileName(fileName) {
    const validPattern = /^[a-zA-Z0-9-_]+$/;
    return validPattern.test(fileName);
}

async function isWriteable(path) {
    try {
        await fs.access(path, fs.constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

const TIERS = {
    BRONZE: { name: '브론즈', minScore: 0, maxScore: 29 },
    SILVER: { name: '실버', minScore: 30, maxScore: 59 },
    GOLD: { name: '골드', minScore: 60, maxScore: 99 },
    PLATINUM: { name: '플래티넘', minScore: 100, maxScore: 149 },
    DIAMOND: { name: '다이아몬드', minScore: 150, maxScore: 199 },
    SERAPHIM: { name: '세라핌', minScore: 200, maxScore: Infinity },
};

function calculateTier(totalScore) {
    for (const [tier, range] of Object.entries(TIERS)) {
        if (totalScore >= range.minScore && totalScore <= range.maxScore) {
            return {
                tier: range.name,
                nextTier: getNextTierInfo(totalScore)
            };
        }
    }
    return null;
}

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
// 인증 관련 API
app.post('/api/register', async (req, res) => {
    const { id, pw, name, githubId } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(pw, 10);
        const sql = 'INSERT INTO user (id, pw, name, github_id) VALUES (?, ?, ?, ?)';
        
        await db.promise().query(sql, [id, hashedPassword, name, githubId]);
        res.status(201).json({ message: '회원가입 성공' });
    } catch (err) {
        console.error('회원가입 오류:', err);
        res.status(500).json({ error: '사용자 추가 중 오류가 발생했습니다.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { id, pw } = req.body;

    try {
        const [results] = await db.promise().query(
            'SELECT * FROM user WHERE id = ?',
            [id]
        );

        if (results.length === 0) {
            return res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(pw, user.pw);

        if (!isMatch) {
            return res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            'your_jwt_secret',
            { expiresIn: '24h' }
        );

        res.json({ 
            message: '로그인 성공',
            token,
            name: user.name,
            role: user.role,
            githubId: user.github_id
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
    }
});

app.post('/api/check-id', async (req, res) => {
    const { id } = req.body;

    try {
        const idRegex = /^[a-zA-Z0-9]{4,20}$/;
        if (!idRegex.test(id)) {
            return res.status(400).json({ 
                available: false,
                message: '아이디는 4-20자의 영문자와 숫자만 사용 가능합니다.'
            });
        }

        const [results] = await db.promise().query(
            'SELECT COUNT(*) as count FROM user WHERE id = ?',
            [id]
        );

        const isAvailable = results[0].count === 0;
        res.json({ 
            available: isAvailable,
            message: isAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'
        });
    } catch (err) {
        console.error('아이디 중복 확인 오류:', err);
        res.status(500).json({ error: '아이디 중복 확인 중 오류가 발생했습니다.' });
    }
});

// GitHub 관련 API
app.post('/api/project-url', async (req, res) => {
    const { userName, assignmentName, projectUrl, code } = req.body;

    try {
        // GitHub 저장소 정보 파싱
        const repoUrl = new URL(projectUrl);
        const [, owner, repo] = repoUrl.pathname.split('/');
        const repoName = repo.replace('.git', '');

        try {
            // Base64로 파일 내용 인코딩하고 GitHub에 업로드
            const files = [
                {
                    path: `${assignmentName}/index.html`,
                    content: code.html,
                    message: `Add index.html for ${assignmentName}`
                },
                {
                    path: `${assignmentName}/style.css`,
                    content: code.css,
                    message: `Add style.css for ${assignmentName}`
                }
            ];

            if (code.js) {
                files.push({
                    path: `${assignmentName}/index.js`,
                    content: code.js,
                    message: `Add index.js for ${assignmentName}`
                });
            }

            // 각 파일을 GitHub에 업로드
            for (const file of files) {
                try {
                    const content = Buffer.from(file.content).toString('base64');
                    
                    // 파일이 이미 존재하는지 확인
                    try {
                        await octokit.repos.getContent({
                            owner,
                            repo: repoName,
                            path: file.path
                        });

                        // 파일이 존재하면 업데이트
                        const existingFile = await octokit.repos.getContent({
                            owner,
                            repo: repoName,
                            path: file.path
                        });

                        await octokit.repos.createOrUpdateFileContents({
                            owner,
                            repo: repoName,
                            path: file.path,
                            message: `Update ${file.path}`,
                            content: content,
                            sha: existingFile.data.sha,
                            branch: 'main'
                        });
                    } catch (error) {
                        if (error.status === 404) {
                            // 파일이 없으면 새로 생성
                            await octokit.repos.createOrUpdateFileContents({
                                owner,
                                repo: repoName,
                                path: file.path,
                                message: file.message,
                                content: content,
                                branch: 'main'
                            });
                        } else {
                            throw error;
                        }
                    }
                    
                    console.log(`Successfully uploaded ${file.path}`);
                } catch (error) {
                    console.error(`Error uploading ${file.path}:`, error);
                    throw error;
                }
            }

            // DB에 URL 저장
            await db.promise().query(
                'INSERT INTO completed_assignments (user_name, assignment_name, github_url) VALUES (?, ?, ?) ' +
                'ON DUPLICATE KEY UPDATE github_url = VALUES(github_url)',
                [userName, assignmentName, projectUrl]
            );

            res.json({
                message: '코드가 성공적으로 GitHub에 업로드되었습니다.',
                githubUrl: `${projectUrl}/tree/main/${assignmentName}`
            });
        } catch (error) {
            console.error('GitHub 업로드 오류:', error);
            res.status(500).json({
                error: 'GitHub 업로드 중 오류가 발생했습니다.',
                details: error.message
            });
        }
    } catch (error) {
        console.error('URL 처리 오류:', error);
        res.status(400).json({ error: '잘못된 GitHub URL 형식입니다.' });
    }
});

app.get('/api/project-url/:userName/:assignmentName', async (req, res) => {
    const { userName, assignmentName } = req.params;

    try {
        const [results] = await db.promise().query(
            'SELECT github_url as projectUrl FROM completed_assignments WHERE user_name = ? AND assignment_name = ?',
            [userName, assignmentName]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: '등록된 URL을 찾을 수 없습니다.' });
        }

        res.json({ projectUrl: results[0].projectUrl });
    } catch (error) {
        console.error('URL 조회 오류:', error);
        res.status(500).json({ error: 'URL 조회 중 오류가 발생했습니다.' });
    }
});
// 과제 관련 API
app.post('/api/submit', upload.single('image'), async (req, res) => {
    const { userName, description, assignmentName, assignmentPath } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
    }

    try {
        const imagePath = `/uploads/${req.file.filename}`;
        const sql = 'INSERT INTO submissions (user_name, image_path, description, assignment_name, assignment_path) VALUES (?, ?, ?, ?, ?)';
        
        await db.promise().query(sql, [userName, imagePath, description, assignmentName, assignmentPath]);
        
        res.status(201).json({ 
            message: '과제가 성공적으로 제출되었습니다.',
            imagePath: imagePath
        });
    } catch (err) {
        console.error('과제 제출 중 오류:', err);
        res.status(500).json({ error: '과제 제출 중 오류가 발생했습니다.' });
    }
});

app.get('/api/submissions', async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT s.*, NOT EXISTS (
                SELECT 1 
                FROM completed_assignments ca 
                WHERE ca.user_name = s.user_name 
                AND ca.assignment_name = s.assignment_name
            ) as is_pending 
            FROM submissions s 
            ORDER BY s.submit_time DESC
        `);
        
        res.json(results);
    } catch (err) {
        console.error('과제 목록 조회 중 오류:', err);
        res.status(500).json({ error: '과제 목록 조회 중 오류가 발생했습니다.' });
    }
});

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

app.post('/api/complete-assignment', async (req, res) => {
    const { userName, assignmentName } = req.body;

    try {
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

app.get('/api/completed-assignments/:userName', async (req, res) => {
    try {
        const { userName } = req.params;
        const [results] = await db.promise().query(
            'SELECT assignment_name, completed_at, github_url FROM completed_assignments WHERE user_name = ?',
            [userName]
        );
        res.json(results);
    } catch (error) {
        console.error('완료된 과제 조회 중 오류:', error);
        res.status(500).json({ error: '완료된 과제 조회 중 오류가 발생했습니다.' });
    }
});

// 사용자 관리 API
app.get('/api/users', async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'SELECT idx, id, name, role, github_id FROM user WHERE id != "admin"'
        );
        res.json(results);
    } catch (err) {
        console.error('사용자 조회 중 오류:', err);
        res.status(500).json({ error: '사용자 조회 중 오류가 발생했습니다.' });
    }
});

app.put('/api/users/:idx/role', async (req, res) => {
    const userIdx = req.params.idx;
    const { role } = req.body;
    
    if (!['user', 'manager'].includes(role)) {
        return res.status(400).json({ error: '잘못된 권한 값입니다.' });
    }

    try {
        const [result] = await db.promise().query(
            'UPDATE user SET role = ? WHERE idx = ? AND id != "admin"',
            [role, userIdx]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없거나 관리자 계정입니다.' });
        }
        
        res.json({ message: '권한이 성공적으로 변경되었습니다.' });
    } catch (err) {
        console.error('권한 변경 중 오류:', err);
        res.status(500).json({ error: '권한 변경 중 오류가 발생했습니다.' });
    }
});

app.delete('/api/users/:idx', async (req, res) => {
    const userIdx = req.params.idx;
    
    try {
        const [result] = await db.promise().query(
            'DELETE FROM user WHERE idx = ? AND id != "admin"',
            [userIdx]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없거나 관리자 계정입니다.' });
        }
        
        res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
    } catch (err) {
        console.error('사용자 삭제 중 오류:', err);
        res.status(500).json({ error: '사용자 삭제 중 오류가 발생했습니다.' });
    }
});
// 모듈 관리 API
app.get('/api/modules', async (req, res) => {
    try {
        const { level, module, search } = req.query;
        let sql = 'SELECT * FROM iframe_data';
        const params = [];
        const conditions = [];

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
        res.json(results);
    } catch (error) {
        console.error('모듈 목록 조회 중 오류:', error);
        res.status(500).json({ error: '모듈 목록 조회 중 오류가 발생했습니다.' });
    }
});

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

        const baseDir = path.join(__dirname, 'public');
        const moduleDir = path.join(baseDir, path.dirname(iframeData.path));

        await ensureDirectoryExists(moduleDir);

        // 파일 저장
        await fs.writeFile(path.join(moduleDir, 'index.html'), files.html, 'utf8');
        await fs.writeFile(path.join(moduleDir, 'style.css'), files.css || '/* No CSS provided */', 'utf8');
        if (files.js) {
            await fs.writeFile(path.join(moduleDir, 'index.js'), files.js, 'utf8');
        }

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

// 랭킹 시스템 API
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

// 파일 시스템 초기화
async function initializeFileSystem() {
    try {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        await ensureDirectoryExists(uploadDir);
        console.log('업로드 디렉토리 초기화 완료');
        
        const projectsDir = path.join(__dirname, 'public', 'projects');
        await ensureDirectoryExists(projectsDir);
        console.log('프로젝트 디렉토리 초기화 완료');
    } catch (error) {
        console.error('파일 시스템 초기화 중 오류:', error);
        process.exit(1);
    }
}

// 서버 시작
async function startServer() {
    try {
        await initializeFileSystem();
        
        db.connect((err) => {
            if (err) {
                console.error('데이터베이스 연결 실패:', err);
                process.exit(1);
            }
            console.log('데이터베이스 연결 성공');
            
            app.listen(port, () => {
                console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
            });
        });
    } catch (error) {
        console.error('서버 시작 중 오류:', error);
        process.exit(1);
    }
}

// 기본 라우트
app.get('/', (req, res) => {
    res.json({ 
        message: 'W-LMS API 서버가 정상적으로 실행 중입니다.',
        version: '1.0.0',
        startTime: new Date().toISOString()
    });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error('서버 오류:', err);
    res.status(500).json({ 
        error: '서버 오류가 발생했습니다.',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.get('/api/check-github/:githubId', async (req, res) => {
    const { githubId } = req.params;

    try {
        const response = await octokit.users.getByUsername({
            username: githubId
        });
        
        if (response.status === 200) {
            res.json({ valid: true });
        }
    } catch (error) {
        if (error.status === 404) {
            res.status(404).json({ error: '존재하지 않는 GitHub 계정입니다.' });
        } else {
            console.error('GitHub API 에러:', error);
            res.status(500).json({ error: 'GitHub 계정 확인 중 오류가 발생했습니다.' });
        }
    }
});

// 서버 시작
startServer();

export default app;