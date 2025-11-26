require('dotenv').config(); // carrega variáveis do .env

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cadastroRoutes = require('./src/routes/cadastroRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo de requests por IP por windowMs
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
    origin: function (origin, callback) {
    
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS policy: origin not allowed'), false);
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api', cadastroRoutes);

// Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Front-end acessível em http://localhost:${PORT}/index.html`);
});