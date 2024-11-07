const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // CORS 미들웨어 추가
app.use(express.json());

app.post('/insert', (req, res) => {
    const { module, level, html, css, js } = req.body;

    // 데이터베이스 연결 및 삽입 로직 추가
    console.log('Received data:', module, level, html, css, js);
    res.status(200).send('Data inserted successfully');
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
