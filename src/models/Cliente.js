
class Cliente {
    constructor(dados) {
        this.nome = dados.cliente || '';
        this.cpf = dados.cpf || dados.documento || '';
        this.email = dados.email || '';
        this.endereco = `${dados.endereco_log || ''}, ${dados.endereco_bairro || ''}, ${dados.endereco_cidade || ''}`;
        this.plano = dados.plano || '';
    }

    // Método de exemplo para salvar no BD
    async save() {
        console.log(`Cliente ${this.nome} salvo!`);
        return true;
    }
}

module.exports = Cliente;