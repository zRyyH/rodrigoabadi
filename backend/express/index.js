const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    res.json({
        filename: req.file.originalname,
        fieldname: req.file.fieldname,
        mimetype: req.file.mimetype,
        size: req.file.size,
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));