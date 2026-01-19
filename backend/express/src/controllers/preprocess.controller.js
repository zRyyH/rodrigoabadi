import multer from 'multer';
import path from 'path';
import { processFiles } from '../services/preprocess.service.js';

const expected = {
    sales: '.xlsx',
    nfes: '.xlsx',
    pdfs: '.zip',
    xmls: '.zip'
};

const fileFilter = (req, file, cb) => {
    if (!(file.fieldname in expected)) {
        req.unexpectedFields = req.unexpectedFields || [];
        req.unexpectedFields.push(file.fieldname);
        cb(null, false);
        return;
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (expected[file.fieldname] === ext) {
        cb(null, true);
    } else {
        cb(new Error(`Extensão inválida para ${file.fieldname}`), false);
    }
};

const multerUpload = multer({ storage: multer.memoryStorage(), fileFilter }).any();

export function upload(req, res, next) {
    multerUpload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (req.unexpectedFields?.length > 0) {
            return res.status(400).json({
                error: `Campos inesperados: ${req.unexpectedFields.join(', ')}`,
                expected: Object.entries(expected).map(([key, ext]) => `${key} (${ext})`).join(', ')
            });
        }

        const files = {};
        for (const file of req.files || []) {
            files[file.fieldname] = file;
        }
        req.files = files;
        next();
    });
}

export async function preprocess(req, res) {
    const missing = Object.keys(expected).filter(field => !req.files[field]);

    if (missing.length > 0) {
        return res.status(400).json({ error: `Arquivos obrigatórios faltando: ${missing.join(', ')}` });
    }

    const result = await processFiles(req.files);
    res.json({ user: req.user, files: result });
}