const express = require('express');
const router = express.Router();
const cadastroController = require('../controllers/cadastroController');

// Define a rota para finalizar o cadastro
// POST para enviar os dados do formulário para o Back-end
router.post('/finalizar', cadastroController.finalizarCadastro);

module.exports = router;