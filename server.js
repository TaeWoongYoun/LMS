const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

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

async function appendToIframeDataFile(newData) {
  const iframeDataPath = path.join(__dirname, 'src', 'data', 'iframeData.js');
  try {
    // 파일이 존재하는지 확인
    let content = '';
    try {
      content = await fs.readFile(iframeDataPath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        // 파일이 없는 경우 기본 구조 생성
        content = 'const iframeData = [];\n\nexport default iframeData;';
      } else {
        throw err;
      }
    }

    // 마지막 배열 닫기 bracket(]) 이전의 위치 찾기
    const lastArrayIndex = content.lastIndexOf(']');
    if (lastArrayIndex === -1) {
      throw new Error('유효하지 않은 파일 형식');
    }

    // 새로운 데이터 형식화
    const newEntry = `    { level: ${newData.level}, module: "${newData.module}", name: "${newData.name}", description: "${newData.description}", path: "${newData.path}", title: "${newData.title}" }`;

    // 기존 데이터가 있는 경우 쉼표 추가
    const separator = content.slice(0, lastArrayIndex).trim().endsWith('[') ? '' : ',\n';

    // 새로운 내용 조합
    const newContent = content.slice(0, lastArrayIndex) + 
                      (separator + newEntry + '\n];\n\nexport default iframeData;');

    // 파일 쓰기
    await fs.writeFile(iframeDataPath, newContent, 'utf8');

    return true;
  } catch (error) {
    console.error('iframeData.js 업데이트 중 에러:', error);
    throw error;
  }
}

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

    // 파일 시스템에 파일 저장
    const baseDir = path.join(__dirname, 'public');
    const moduleDir = path.join(baseDir, path.dirname(iframeData.path));
    
    await ensureDirectoryExists(moduleDir);

    // 파일들 저장
    await fs.writeFile(path.join(moduleDir, 'index.html'), files.html, 'utf8');
    await fs.writeFile(path.join(moduleDir, 'style.css'), files.css || '/* No CSS provided */', 'utf8');
    if (files.js) {
      await fs.writeFile(path.join(moduleDir, 'script.js'), files.js, 'utf8');
    }

    // iframeData.js 파일에 새 데이터 추가
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

  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ 
      error: '서버에서 파일을 저장하는 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

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