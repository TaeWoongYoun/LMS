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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
