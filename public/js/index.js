const planoOptions = [
    'ESCOLHA O PLANO',
    'BLESS 600MB 99,90',
    'BLESS 800MB 109,90/MÊS',
    'BLESS 900MB COM PORTABILIDADE 99,90',
    'BLESS 950MB PREDIAL 99,90',
    'BLESS 1GB 149,90/MÊS',
    'BLESS 1,5GB 199,90/MÊS',
    'BLESS TELEFONE FIXO 49,90'
];
const steps = [
    {key:'vendedor', label:'Informe o nome do VENDEDOR', placeholder:'Ex: VENDEDOR BLESS', type:'text',},
    {key:'tipo', label:'Tipo de cliente', type:'select', options:[{v:'PF',t:'PESSOA FÍSICA'},{v:'PJ',t:'PESSOA JURÍDICA'}]},
    {key:'cliente', label:'Nome do CLIENTE (PF: nome completo | PJ: nome da empresa)', placeholder:'Ex: CLIENTE LTDA', type:'text'},
    {key:'responsavel', label:'Nome do RESPONSÁVEL (apenas PJ)', placeholder:'Ex: NOME DO RESPONSÁVEL', type:'text', onlyPJ:true},
    {key:'documento', label:'CNPJ (apenas PJ)', placeholder:'Ex: 12345678000199', type:'text', mask:'cpf_cnpj', onlyPJ:true},
    {key:'cpf', label:'CPF (PF ou responsável PJ)', placeholder:'Ex: 12345678900', type:'text', mask:'cpf_cnpj'},
    {key:'rg', label:'RG', placeholder:'Ex: 398190239', type:'text'},
    {key:'caracteristicas', label:'Possui internet? (se sim qual?)', placeholder:'Ex: SEM INTERNET', type:'textarea'},
    {key:'profissao', label:'Profissão', placeholder:'Ex: MECANICO', type:'text'},
    {key:'plano', label:'Plano', type:'select-editable', options:planoOptions},
    {key:'sexo', label:'Estado civil', type:'select', options:[{v:'CASADO',t:'CASADO'},{v:'CASADA',t:'CASADA'}]},
    {key:'endereco_log', label:'Endereço - rua e número', placeholder:'AV BRASIL - 00', type:'text'},
    {key:'endereco_bairro', label:'Bairro', placeholder:'ZONA 07', type:'text'},
    {key:'endereco_cidade', label:'Cidade - UF', placeholder:'MARINGA - PR', type:'text'},
    {key:'cep', label:'CEP (somente números)', placeholder:'87140000', type:'text', mask:'cep'},
    {key:'email', label:'Email', placeholder:'blessInternet@outlook.com', type:'email'},
    {key:'tel_titular', label:'Telefone TITULAR', placeholder:'44988184629', type:'text', mask:'tel'},
    {key:'tel_recado', label:'Telefone RECADO', placeholder:'44988240813', type:'text', mask:'tel'},
    {key:'venc', label:'Vencimento (dia)', placeholder:'10', type:'text'}
];
let answers = {};
let index = 0;
let includeChecklist = false;
let images = [];

const inputWrap = document.getElementById('inputWrap');
const qLabel = document.getElementById('questionLabel');
const preview = document.getElementById('previewArea');
const chips = document.getElementById('answeredChips');
const progressBar = document.getElementById('progressBar');
const statusSpan = document.getElementById('status');
const imagesPreview = document.getElementById('imagesPreview');
const imageInput = document.getElementById('imageInput');
const takePhotoBtn = document.getElementById('takePhotoBtn');

function toUpper(s){ return (s||'').toString().toUpperCase(); }
function maskCPF_CNPJ(v){
    v = v.replace(/\D/g,'');
    if(v.length<=11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,"$1.$2.$3-$4").replace(/[-.]$/,'');
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,"$1.$2.$3/$4-$5").replace(/[-./]$/,'');
}
function maskTel(v){
    v = v.replace(/\D/g,'');
    if(v.length<=10) return v.replace(/(\d{2})(\d{4})(\d{0,4})/,"($1) $2-$3").replace(/[- ]$/,'');
    return v.replace(/(\d{2})(\d{5})(\d{0,4})/,"($1) $2-$3").replace(/[- ]$/,'');
}
function maskCEP(v){
    v = v.replace(/\D/g,'');
    return v.replace(/(\d{5})(\d{0,3})/,"$1-$2").replace(/-$/,'');
}

function setQuestion(i){
    if(steps[i].key === 'responsavel' && answers['tipo'] !== 'PJ') {
        setQuestion(i+1); return;
    }
    if(steps[i].key === 'documento' && answers['tipo'] !== 'PJ') {
        setQuestion(i+1); return;
    }
    index = Math.max(0, Math.min(i, steps.length-1));
    const s = steps[index];
    qLabel.textContent = s.label;
    inputWrap.innerHTML = '';
    let el;
    if(s.type==='select'){
        el = document.createElement('select');
        el.className = 'select';
    s.options.forEach(opt=>{
        const o = document.createElement('option');
        o.value = opt.v;
        o.textContent = opt.t;
        el.appendChild(o);
    });
    el.value = answers[s.key]||s.options[0].v;
    } else if(s.type==='select-editable'){
        const row = document.createElement('div');
        row.className = 'row-flex';

        const sel = document.createElement('select');
        sel.className = 'select';

        (s.options || []).forEach(opt=>{
            const o = document.createElement('option');
            if (typeof opt === 'string') {
                o.value = opt;
                o.textContent = opt;
            } else if (opt && typeof opt === 'object') {
                o.value = opt.v || opt.t || '';
                o.textContent = opt.t || opt.v || '';
            }
            sel.appendChild(o);
        });

        const inp = document.createElement('input');
        inp.className = 'input';
        inp.type = 'text';
        inp.id = 'answerInput';
        inp.placeholder = s.placeholder || '';
        inp.value = answers[s.key] || '';

        sel.addEventListener('change', ()=>{
            inp.value = sel.value;
            inp.focus();
        });

        inp.addEventListener('input', ()=>{ inp.value = toUpper(inp.value); });
        inp.addEventListener('keydown', (e)=>{
            if(e.key==='Enter' && !e.shiftKey){
                e.preventDefault();
                confirmAnswer();
            }
        });

        if (inp.value) {
            const found = Array.from(sel.options).find(o => o.value === inp.value);
            if (found) sel.value = inp.value;
        }

        row.appendChild(sel);
        row.appendChild(inp);
        inputWrap.appendChild(row);
        inp.focus();
        return; 
    } else if(s.type==='textarea'){
        el = document.createElement('textarea');
        el.className = 'input';
        el.rows = 2;
        el.placeholder = s.placeholder||'';
        el.value = answers[s.key]||'';
    } else {
        el = document.createElement('input');
        el.className = 'input';
        el.type = s.type==='email' ? 'email' : 'text';
        el.placeholder = s.placeholder||'';
        el.value = answers[s.key]||'';
    }

    el.id = 'answerInput';
    el.autocomplete = 'off';
    el.addEventListener('input', (e)=>{
    if(s.mask==='cpf_cnpj') el.value = maskCPF_CNPJ(toUpper(el.value));
    else if(s.mask==='tel') el.value = maskTel(toUpper(el.value));
    else if(s.mask==='cep') el.value = maskCEP(toUpper(el.value));
    else el.value = toUpper(el.value);
    });

    el.addEventListener('keydown', (e)=>{
    if(e.key==='Enter' && !e.shiftKey){
        e.preventDefault(); confirmAnswer();
    } else if(e.key==='Backspace' && el.value==='' && index>0){
        e.preventDefault(); setQuestion(index-1);
    }
    });

    inputWrap.appendChild(el);
    el.focus();
    updateProgress();
}
function updateProgress(){
    const pct = Math.round(((index) / steps.length) * 100);
    progressBar.style.background = `linear-gradient(90deg,#FFD600 ${pct}%, #0ea5e9 ${pct}%)`;
}

function renderChips(){
    chips.innerHTML = '';
    steps.forEach((s, i)=>{
    if(answers[s.key]){
        const c = document.createElement('div');
        c.className = 'chip';
        let val = answers[s.key];
        if(Array.isArray(val)) val = val.join(', ');
            c.textContent = `${s.key.toUpperCase()}: ${val}`;
            c.style.cursor = 'pointer';
            c.addEventListener('click', ()=> setQuestion(i));
            chips.appendChild(c);
    }
    });
}

function buildPreview(){
    const L = v=>toUpper(v||'');
    const lines = [];
    lines.push('*NOVA VENDA - BLESS INTERNET*');
    if(answers['vendedor']) lines.push('VENDEDOR: ' + L(answers['vendedor']));
        lines.push('');
    if(answers['cliente']) lines.push('*' + L(answers['cliente']) + '*');
    if(answers['tipo']==='PJ' && answers['responsavel']) lines.push('RESPONSAVEL: ' + L(answers['responsavel']));
    if(answers['cliente'] || (answers['tipo']==='PJ' && answers['responsavel'])) lines.push('');
    if(answers['tipo']==='PJ' && answers['documento']) lines.push('CNPJ: ' + L(answers['documento']));
    if(answers['cpf']) lines.push('CPF: ' + L(answers['cpf']));
    if(answers['rg']) lines.push('RG: ' + L(answers['rg']));
    if(answers['caracteristicas']){
        let parts = answers['caracteristicas'].split(/[\n,;]+/).map(x=>L(x.trim())).filter(Boolean);
        parts.forEach(p=>lines.push(p));
    }
    if(answers['profissao']) lines.push(L(answers['profissao']));
    if(answers['sexo']) lines.push(L(answers['sexo']));
        lines.push('');
        lines.push('*Endereço de instalação:*');
    if(answers['endereco_log']) lines.push(L(answers['endereco_log']));
    if(answers['endereco_bairro']) lines.push(L(answers['endereco_bairro']));
    if(answers['endereco_cidade']) lines.push(L(answers['endereco_cidade']));
    if(answers['cep']) lines.push(L(answers['cep']));
        lines.push('');
    if(answers['email']) lines.push(L(answers['email']));
    if(answers['tel_titular']) lines.push(L(answers['tel_titular']) + ' - TITULAR');
    if(answers['tel_recado']) lines.push(L(answers['tel_recado']) + ' - RECADO');
        lines.push('');
    if(answers['plano']) lines.push('*' + L(answers['plano']) + '*');
    if(answers['venc']) lines.push('VENC: ' + L(answers['venc']));
    if(includeChecklist){
        lines.push('');
        lines.push('CHECKLIST:');
        lines.push(document.getElementById('chk2via').checked ? '[X] CONFERIU 2ª VIA DO CLIENTE' : '[ ] CONFERIU 2ª VIA DO CLIENTE');
        lines.push(document.getElementById('chkEndereco').checked ? '[X] CONFERIU ENDEREÇO' : '[ ] CONFERIU ENDEREÇO');
        lines.push(document.getElementById('chkDocFoto').checked ? '[X] DOCUMENTO (FOTO)' : '[ ] DOCUMENTO (FOTO)');
        lines.push(document.getElementById('chkTitular').checked ? '[X] TITULAR CONFERE' : '[ ] TITULAR CONFERE');
    }
    preview.textContent = lines.filter(x=>x!==undefined&&x!==null).join('\r\n').trim();
}

function confirmAnswer(){
    const s = steps[index];
    let val;

    const el = document.getElementById('answerInput');
    val = el ? (el.value || '').trim() : '';
    if(s.type==='select') {
        const sel = document.getElementById('answerInput');
        if(sel) val = sel.value;
    }
    if(s.type==='textarea') val = val.replace(/\r\n/g,'\n');
        answers[s.key] = val;
        renderChips();
    if(index < steps.length-1) setQuestion(index+1);
        buildPreview();
}
function skipQuestion(){
    answers[steps[index].key] = '';
    if(index < steps.length-1) setQuestion(index+1);
        buildPreview();
}
function prevQuestion(){
    if(index>0) setQuestion(index-1);
}

document.getElementById('confirmBtn').addEventListener('click', confirmAnswer);
document.getElementById('skipBtn').addEventListener('click', skipQuestion);
document.getElementById('prevBtn').addEventListener('click', prevQuestion);

document.getElementById('copyBtn').addEventListener('click', async ()=>{
    const txt = preview.textContent || '';
    if(!txt.trim()){ alert('Nada para copiar. Responda algumas perguntas primeiro.'); return; }
    try{
        await navigator.clipboard.writeText(txt.replace(/\n/g,"\r\n"));
        alert('Texto copiado! Cole no WhatsApp.');
        statusSpan.textContent='COPIADO';
    } catch(e){
        alert('Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.');
    }
});

document.getElementById('waBtn').addEventListener('click', ()=>{
    const txt = preview.textContent || '';
    if(!txt.trim()){ alert('Texto vazio. Preencha o cadastro primeiro.'); return; }
        const encoded = encodeURIComponent(txt.replace(/\n/g,"\r\n"));
        const url = `https://web.whatsapp.com/send?text=${encoded}`;
        window.open(url, '_blank');
});

document.getElementById('includeChecklist').addEventListener('click', ()=>{
    includeChecklist = !includeChecklist;
    document.getElementById('includeChecklist').textContent = includeChecklist ? 'Checklist será incluído' : 'Incluir checklist no texto';
    buildPreview();
});

document.getElementById('finalizeBtn').addEventListener('click', ()=>{
    if(!confirm('Finalizar cadastro e limpar todos os campos?')) return;
        answers = {}; index = 0; includeChecklist = false;
        document.getElementById('chk2via').checked = false;
        document.getElementById('chkEndereco').checked = false;
        document.getElementById('chkDocFoto').checked = false;
        document.getElementById('chkTitular').checked = false;
        renderChips(); setQuestion(0);
        preview.textContent = 'AQUI FICARÁ O TEXTO DO CADASTRO';
        statusSpan.textContent = 'PRONTO';
});

// salva dados atuais do cadastro para a página de orçamento
function salvarParaOrcamento(){
    const payload = {
        answers,
        includeChecklist,
        status: statusSpan ? statusSpan.textContent : 'PRONTO',
        date: new Date().toLocaleDateString('pt-BR')
    };
try{
    localStorage.setItem('cad_orcamento', JSON.stringify(payload));
    return true;
}catch(e){
    console.error('Erro ao salvar orçamento:', e);
    return false;
}
}

document.getElementById('genPdfBtn').addEventListener('click', ()=>{
    if(!salvarParaOrcamento()){
        alert('Não foi possível salvar os dados localmente.');
        return;
    }
    window.open('orcamento.html', '_blank');
});

function init(){ setQuestion(0); renderChips(); buildPreview(); }
init();