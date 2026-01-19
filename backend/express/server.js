import 'dotenv/config';
import app from './src/app.js';
import config from './src/config/index.js';

app.listen(config.port, () => {
    console.log(`API rodando na porta ${config.port}`);
});