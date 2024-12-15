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
    const { id, pw, name, githubId, githubToken } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(pw, 10);
        const sql = 'INSERT INTO user (id, pw, name, github_id, github_token) VALUES (?, ?, ?, ?, ?)';
        
        await db.promise().query(sql, [id, hashedPassword, name, githubId, githubToken]);
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
            id: user.id,
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

app.post('/api/project-url', async (req, res) => {
    const { userId, assignmentName, projectUrl, code } = req.body;

    try {
        // GitHub 저장소 정보 파싱
        const repoUrl = new URL(projectUrl);
        const [, owner, repo] = repoUrl.pathname.split('/');
        const repoName = repo.replace('.git', '');

        // 사용자의 GitHub 토큰 가져오기
        const [userResults] = await db.promise().query(
            'SELECT github_token FROM user WHERE id = ?',
            [userId]
        );

        if (userResults.length === 0 || !userResults[0].github_token) {
            return res.status(400).json({ error: 'GitHub 토큰을 찾을 수 없습니다.' });
        }

        const userGithubToken = userResults[0].github_token;

        // 사용자의 토큰으로 Octokit 인스턴스 생성
        const octokit = new Octokit({
            auth: userGithubToken
        });

        try {
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
                    
                    try {
                        // 파일이 이미 존재하는지 확인
                        const { data: existingFile } = await octokit.repos.getContent({
                            owner,
                            repo: repoName,
                            path: file.path
                        });

                        // 파일이 존재하면 업데이트
                        await octokit.repos.createOrUpdateFileContents({
                            owner,
                            repo: repoName,
                            path: file.path,
                            message: `Update ${file.path}`,
                            content: content,
                            sha: existingFile.sha,
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
                } catch (error) {
                    console.error(`Error uploading ${file.path}:`, error);
                    throw error;
                }
            }

            // DB에 URL 저장
            await db.promise().query(
                'INSERT INTO completed_assignments (user_name, assignment_name, github_url) VALUES (?, ?, ?) ' +
                'ON DUPLICATE KEY UPDATE github_url = VALUES(github_url)',
                [userId, assignmentName, projectUrl]
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

app.get('/api/project-url/:userId/:assignmentName', async (req, res) => {
    const { userId, assignmentName } = req.params;

    try {
        const [results] = await db.promise().query(
            'SELECT github_url as projectUrl FROM completed_assignments WHERE user_name = ? AND assignment_name = ?',
            [userId, assignmentName]
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
    console.log('Received submit request with body:', req.body);
    const { userId, description, assignmentName, assignmentPath } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    if (!req.file) {
        return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
    }

    try {
        // 사용자 존재 여부 확인
        const [users] = await db.promise().query(
            'SELECT id FROM user WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: '존재하지 않는 사용자입니다.' });
        }

        // submissions 테이블에 이미 동일한 과제가 제출되었는지 확인
        const [existingSubmissions] = await db.promise().query(
            'SELECT idx FROM submissions WHERE user_id = ? AND assignment_name = ?',
            [userId, assignmentName]
        );

        if (existingSubmissions.length > 0) {
            return res.status(400).json({ error: '이미 제출된 과제입니다.' });
        }

        const imagePath = `/uploads/${req.file.filename}`;
        
        const sql = 'INSERT INTO submissions (user_id, image_path, description, assignment_name, assignment_path) VALUES (?, ?, ?, ?, ?)';
        const params = [userId, imagePath, description, assignmentName, assignmentPath];
        
        await db.promise().query(sql, params);
        
        res.status(201).json({ 
            message: '과제가 성공적으로 제출되었습니다.',
            imagePath: imagePath
        });
    } catch (err) {
        console.error('과제 제출 중 오류:', err);
        res.status(500).json({ 
            error: '과제 제출 중 오류가 발생했습니다.',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});
app.get('/api/submissions', async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT s.*, u.name as user_name, NOT EXISTS (
                SELECT 1 
                FROM completed_assignments ca 
                WHERE ca.user_id = s.user_id 
                AND ca.assignment_name = s.assignment_name
            ) as is_pending 
            FROM submissions s 
            JOIN user u ON s.user_id = u.id
            ORDER BY s.submit_time DESC
        `);
        
        res.json(results);
    } catch (err) {
        console.error('과제 목록 조회 중 오류:', err);
        res.status(500).json({ error: '과제 목록 조회 중 오류가 발생했습니다.' });
    }
});

app.get('/api/submissions/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [results] = await db.promise().query(
            'SELECT * FROM submissions WHERE user_id = ?',
            [userId]
        );
        res.json(results);
    } catch (error) {
        console.error('사용자별 제출 과제 조회 중 오류:', error);
        res.status(500).json({ error: '사용자별 제출 과제 조회 중 오류가 발생했습니다.' });
    }
});

app.post('/api/complete-assignment', async (req, res) => {
    const { userId, assignmentName } = req.body;

    try {
        await db.promise().beginTransaction();

        // 먼저 user의 이름을 가져옵니다
        const [userResults] = await db.promise().query(
            'SELECT name FROM user WHERE id = ?',
            [userId]
        );

        if (userResults.length === 0) {
            await db.promise().rollback();
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const userName = userResults[0].name;

        // 1. 제출된 과제의 이미지 경로 조회
        const [submissions] = await db.promise().query(
            'SELECT image_path FROM submissions WHERE user_id = ? AND assignment_name = ?',
            [userId, assignmentName]
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
            'INSERT INTO completed_assignments (user_id, user_name, assignment_name) VALUES (?, ?, ?)',
            [userId, userName, assignmentName]
        );

        // 4. 제출 테이블에서 과제 삭제
        await db.promise().query(
            'DELETE FROM submissions WHERE user_id = ? AND assignment_name = ?',
            [userId, assignmentName]
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

app.get('/api/completed-assignments/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [results] = await db.promise().query(
            'SELECT assignment_name, completed_at, github_url FROM completed_assignments WHERE user_id = ?',
            [userId]
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
        // 트랜잭션 시작
        await db.promise().beginTransaction();

        // 사용자 정보 조회
        const [userResults] = await db.promise().query(
            'SELECT id FROM user WHERE idx = ? AND id != "admin"',
            [userIdx]
        );

        if (userResults.length === 0) {
            await db.promise().rollback();
            return res.status(404).json({ error: '사용자를 찾을 수 없거나 관리자 계정입니다.' });
        }

        const userId = userResults[0].id;

        // 1. submissions 테이블에서 사용자의 이미지 파일 경로 조회
        const [submissions] = await db.promise().query(
            'SELECT image_path FROM submissions WHERE user_id = ?',
            [userId]
        );

        // 2. 이미지 파일 삭제
        for (const submission of submissions) {
            if (submission.image_path) {
                const fullImagePath = path.join(__dirname, 'public', submission.image_path);
                try {
                    await fs.unlink(fullImagePath);
                    console.log('이미지 파일 삭제 완료:', fullImagePath);
                } catch (error) {
                    console.error('이미지 파일 삭제 실패:', error);
                }
            }
        }

        // 3. completed_assignments 테이블에서 사용자 데이터 삭제
        await db.promise().query(
            'DELETE FROM completed_assignments WHERE user_id = ?',
            [userId]
        );

        // 4. submissions 테이블에서 사용자 데이터 삭제
        await db.promise().query(
            'DELETE FROM submissions WHERE user_id = ?',
            [userId]
        );

        // 5. 마지막으로 user 테이블에서 사용자 삭제
        const [result] = await db.promise().query(
            'DELETE FROM user WHERE idx = ? AND id != "admin"',
            [userIdx]
        );
        
        if (result.affectedRows === 0) {
            await db.promise().rollback();
            return res.status(404).json({ error: '사용자를 찾을 수 없거나 관리자 계정입니다.' });
        }

        // 트랜잭션 커밋
        await db.promise().commit();
        
        res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
    } catch (err) {
        // 에러 발생 시 롤백
        await db.promise().rollback();
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

        // 프로젝트 루트의 public 폴더 경로 설정
        const moduleDir = path.join('..', 'public', path.dirname(iframeData.path));

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
            LEFT JOIN completed_assignments ca ON u.id = ca.user_id
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
    const authHeader = req.headers.authorization;
    const githubToken = authHeader?.split(' ')[1];

    if (!githubToken) {
        return res.status(400).json({ error: 'GitHub 토큰이 필요합니다.' });
    }

    try {
        const octokit = new Octokit({
            auth: githubToken  // 'token ' 접두어 제거
        });

        try {
            const response = await octokit.users.getByUsername({
                username: githubId
            });
            
            if (response.status === 200) {
                // GitHub 사용자가 실제로 존재하는지 확인
                res.json({ valid: true });
            }
        } catch (error) {
            if (error.status === 404) {
                res.status(404).json({ error: '존재하지 않는 GitHub 계정입니다.' });
            } else {
                throw error;  // 다른 오류는 아래의 catch 블록으로 전달
            }
        }
    } catch (error) {
        console.error('GitHub API 에러:', error);
        if (error.status === 401) {
            res.status(401).json({ error: 'GitHub 토큰이 유효하지 않습니다.' });
        } else {
            res.status(500).json({ error: 'GitHub 계정 확인 중 오류가 발생했습니다.' });
        }
    }
});

// 모듈 삭제 API 추가
app.delete('/api/iframe-data/:idx', async (req, res) => {
    const { idx } = req.params;

    try {
        // 1. 먼저 삭제할 모듈의 정보를 가져옵니다
        const [modules] = await db.promise().query(
            'SELECT path FROM iframe_data WHERE idx = ?',
            [idx]
        );

        if (modules.length === 0) {
            return res.status(404).json({ error: '모듈을 찾을 수 없습니다.' });
        }

        // 2. 파일 시스템에서 관련 파일들을 삭제합니다
        const modulePath = path.join('..', 'public', path.dirname(modules[0].path));
        try {
            await fs.rm(modulePath, { recursive: true, force: true });
            console.log('모듈 디렉토리 삭제 완료:', modulePath);
        } catch (error) {
            console.error('파일 삭제 실패:', error);
            return res.status(500).json({ error: '파일 삭제 중 오류가 발생했습니다.' });
        }

        // 3. 데이터베이스에서 모듈 정보를 삭제합니다
        const [result] = await db.promise().query(
            'DELETE FROM iframe_data WHERE idx = ?',
            [idx]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '모듈을 찾을 수 없습니다.' });
        }

        res.json({ message: '모듈이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('모듈 삭제 중 오류:', error);
        res.status(500).json({ error: '모듈 삭제 중 오류가 발생했습니다.' });
    }
});

// 사용자 정보 조회 API
app.get('/api/user/:userId', async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'SELECT id, name, github_id, github_token FROM user WHERE id = ?',
            [req.params.userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        res.json(results[0]);
    } catch (error) {
        console.error('사용자 정보 조회 중 오류:', error);
        res.status(500).json({ error: '사용자 정보 조회 중 오류가 발생했습니다.' });
    }
});

// 사용자 정보 수정 API
app.put('/api/user/:userId', async (req, res) => {
    const { name, githubId, githubToken, currentPassword, newPassword } = req.body;
    const userId = req.params.userId;

    try {
        // 현재 사용자 정보 조회
        const [users] = await db.promise().query(
            'SELECT * FROM user WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        // 비밀번호 변경이 요청된 경우
        if (newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, users[0].pw);
            if (!isMatch) {
                return res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
            }
            
            // 새 비밀번호 해시
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            
            // 모든 정보 업데이트
            await db.promise().query(
                'UPDATE user SET name = ?, github_id = ?, github_token = ?, pw = ? WHERE id = ?',
                [name, githubId, githubToken, hashedNewPassword, userId]
            );
        } else {
            // 비밀번호를 제외한 정보만 업데이트
            await db.promise().query(
                'UPDATE user SET name = ?, github_id = ?, github_token = ? WHERE id = ?',
                [name, githubId, githubToken, userId]
            );
        }

        res.json({ message: '사용자 정보가 성공적으로 업데이트되었습니다.' });
    } catch (error) {
        console.error('사용자 정보 수정 중 오류:', error);
        res.status(500).json({ error: '사용자 정보 수정 중 오류가 발생했습니다.' });
    }
});

// 비밀번호 변경 API
app.put('/api/user/:userId/password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.userId;

    try {
        // 현재 사용자 정보 조회
        const [users] = await db.promise().query(
            'SELECT * FROM user WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        // 현재 비밀번호 확인
        const isMatch = await bcrypt.compare(currentPassword, users[0].pw);
        if (!isMatch) {
            return res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 새 비밀번호 해시
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 비밀번호 업데이트
        await db.promise().query(
            'UPDATE user SET pw = ? WHERE id = ?',
            [hashedNewPassword, userId]
        );

        res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
        console.error('비밀번호 변경 중 오류:', error);
        res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다.' });
    }
});

// 게시글 작성 API
app.post('/api/posts', async (req, res) => {
    const { category, title, content, author_id, author_name } = req.body;

    try {
        // 관리자 권한 체크 (공지사항인 경우)
        if (category === 'notice') {
            const [users] = await db.promise().query(
                'SELECT role FROM user WHERE id = ?',
                [author_id]
            );

            if (users.length === 0 || users[0].role !== 'admin') {
                return res.status(403).json({ error: '공지사항 작성 권한이 없습니다.' });
            }
        }

        // 게시글 작성
        const [result] = await db.promise().query(
            `INSERT INTO board_posts 
                (category, title, content, author_id, author_name) 
            VALUES (?, ?, ?, ?, ?)`,
            [category, title, content, author_id, author_name]
        );

        res.status(201).json({
            message: '게시글이 성공적으로 작성되었습니다.',
            postId: result.insertId
        });
    } catch (error) {
        console.error('게시글 작성 중 오류:', error);
        res.status(500).json({ error: '게시글 작성 중 오류가 발생했습니다.' });
    }
});

// 게시글 목록 조회 API (전체 및 카테고리별)
app.get('/api/posts', async (req, res) => {
    const { category, search } = req.query;
    
    try {
        let sql = 'SELECT * FROM board_posts';
        const params = [];
        const conditions = [];

        // 카테고리가 지정되어 있고 'all'이 아닌 경우
        if (category && category !== 'all') {
            conditions.push('category = ?');
            params.push(category);
        }

        // 검색어가 있는 경우
        if (search) {
            conditions.push('(title LIKE ? OR content LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        // WHERE 조건 추가
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        // 정렬 추가
        sql += ' ORDER BY created_at DESC';

        const [posts] = await db.promise().query(sql, params);
        res.json(posts);
    } catch (error) {
        console.error('게시글 목록 조회 중 오류:', error);
        res.status(500).json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' });
    }
});

// 게시글 조회 API
app.get('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [posts] = await db.promise().query(
            'SELECT * FROM board_posts WHERE id = ?',
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        }

        res.json(posts[0]);
    } catch (error) {
        console.error('게시글 조회 중 오류:', error);
        res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
    }
});

// 게시글 수정 API
app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, author_id } = req.body;

    try {
        const [result] = await db.promise().query(
            'UPDATE board_posts SET title = ?, content = ? WHERE id = ? AND author_id = ?',
            [title, content, id, author_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '게시글을 찾을 수 없거나 수정 권한이 없습니다.' });
        }

        res.json({ message: '게시글이 성공적으로 수정되었습니다.' });
    } catch (error) {
        console.error('게시글 수정 중 오류:', error);
        res.status(500).json({ error: '게시글 수정 중 오류가 발생했습니다.' });
    }
});

// 게시글 삭제 API
app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { author_id } = req.body;

    try {
        const [result] = await db.promise().query(
            'DELETE FROM board_posts WHERE id = ? AND author_id = ?',
            [id, author_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '게시글을 찾을 수 없거나 삭제 권한이 없습니다.' });
        }

        res.json({ message: '게시글이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('게시글 삭제 중 오류:', error);
        res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
    }
});

// 서버 시작
startServer();

export default app;