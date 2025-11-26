const Cliente = require('../models/Cliente');
const processamentoService = require('../services/processamentoService');

exports.finalizarCadastro = async (req, res) => {
    try {
        const dadosDoFormulario = req.body;
        
        const cliente = new Cliente(dadosDoFormulario);
        
        const resultadoProcessamento = await processamentoService.gerarDocumento(cliente);

        res.status(200).json({
            mensagem: 'Cadastro finalizado e documento gerado com sucesso.',
            dados: resultadoProcessamento
        });
    } catch (error) {
        console.error('Erro ao finalizar cadastro:', error);
        res.status(500).json({ erro: 'Falha interna do servidor.' });
    }
};