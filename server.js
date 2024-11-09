// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

// 유틸리티 함수: 디렉토리 생성
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// 유틸리티 함수: 파일 이름 검증
function validateFileName(fileName) {
  const validPattern = /^[a-zA-Z0-9-_]+$/;
  return validPattern.test(fileName);
}

app.post('/api/save-module', async (req, res) => {
  try {
    const { iframeData, files } = req.body;

    // 기본 유효성 검사
    if (!iframeData || !files) {
      return res.status(400).json({ error: '잘못된 데이터 형식입니다.' });
    }

    // 파일 이름 유효성 검사
    if (!validateFileName(iframeData.name)) {
      return res.status(400).json({ 
        error: '폴더명은 영문자, 숫자, 하이픈, 언더스코어만 사용할 수 있습니다.' 
      });
    }

    // 기본 디렉토리 설정 (프로젝트 루트의 public 폴더 아래)
    const baseDir = path.join(__dirname, 'public');
    const moduleDir = path.join(baseDir, iframeData.path);
    
    // 디렉토리 생성
    await ensureDirectoryExists(moduleDir);

    // 파일 저장
    const htmlFilePath = path.join(moduleDir, 'index.html');
    const cssFilePath = path.join(moduleDir, 'style.css');
    const jsFilePath = path.join(moduleDir, 'script.js');

    // HTML 파일 저장
    await fs.writeFile(htmlFilePath, files.html, 'utf8');

    // CSS 파일 저장
    await fs.writeFile(cssFilePath, files.css || '/* No CSS provided */', 'utf8');

    // JavaScript 파일 저장 (있는 경우에만)
    if (files.js) {
      await fs.writeFile(jsFilePath, files.js, 'utf8');
    }

    // 모듈 정보 저장 (메타데이터)
    const metaData = {
      ...iframeData,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const metaFilePath = path.join(moduleDir, 'metadata.json');
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2), 'utf8');

    console.log(`모듈이 성공적으로 저장되었습니다: ${iframeData.path}`);
    res.status(200).json({ 
      message: '모듈이 성공적으로 저장되었습니다.',
      path: iframeData.path 
    });

  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ 
      error: '서버에서 파일을 저장하는 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: '서버 내부 오류가 발생했습니다.',
    details: err.message 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});