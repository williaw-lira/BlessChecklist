
const sharp = require('sharp');
const pdf = require('pdf-poppler');
const fs = require('fs');
const path = require('path');

exports.gerarDocumento = async (cliente) => {

    console.log(`Gerando documento para o cliente: ${cliente.nome}`);

    const safeName = (cliente.nome || 'cliente').replace(/\s/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    const nomeArquivo = `cadastro_${safeName}.txt`;
    const dirTemp = path.join(__dirname, '..', '..', 'temp');
    const caminho = path.join(dirTemp, nomeArquivo);
    
    // Assegura que o diretório 'temp' exista
    if (!fs.existsSync(dirTemp)) {
        fs.mkdirSync(dirTemp, { recursive: true });
    }

    // Sanitiza dados sensíveis antes de gravar: mascara CPF/CNPJ, emails e telefones
    const mask = (v, keep = 4) => {
        if (!v) return v;
        const s = String(v);
        if (s.length <= keep) return '*'.repeat(s.length);
        return '*'.repeat(Math.max(0, s.length - keep)) + s.slice(-keep);
    };

    const maskEmail = (e) => {
        if (!e || typeof e !== 'string') return e;
        const parts = e.split('@');
        if (parts.length !== 2) return mask(e);
        const local = parts[0];
        const domain = parts[1];
        if (local.length <= 2) return '*@' + domain;
        return local[0] + '***' + local.slice(-1) + '@' + domain;
    };

    const sanitized = { ...cliente };
    // campos prováveis que contêm PII
    if (sanitized.cpf) sanitized.cpf = mask(sanitized.cpf, 4);
    if (sanitized.documento) sanitized.documento = mask(sanitized.documento, 4);
    if (sanitized.email) sanitized.email = maskEmail(sanitized.email);
    if (sanitized.tel_titular) sanitized.tel_titular = mask(sanitized.tel_titular, 4);
    if (sanitized.tel_recado) sanitized.tel_recado = mask(sanitized.tel_recado, 4);

    // grava a versão sanitizada para evitar deixar PII em disco
    fs.writeFileSync(caminho, JSON.stringify(sanitized, null, 2), 'utf-8');

    return {
        status: 'OK',
        arquivoGerado: nomeArquivo,
        caminho: caminho
    };
};