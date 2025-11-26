const defaultPlans = [
    ['BLESS 600 MB','1','99,90'],
    ['BLESS 800 MB SEM PORTABILIDADE','1','109,90'],
    ['BLESS 900 MB COM CONCORRÊNCIA','1','99,90'],
    ['BLESS 1 GB','1','149,90'],
    ['BLESS 1,5 GB + WI-FI 7','1','199,90'],
    ['IP FIXO','1','80,00'],
    ['LINHA DE TELEFONE ILIMITADA','1','49,90'],
    ['PONTO EXTRA DE WI-FI (MESH)','1','50,00'],
    ['DEDICADA BÁSICA — 50 MB','1','419,90'],
    ['DEDICADA BÁSICA — 100 MB','1','549,90'],
    ['DEDICADA BÁSICA — 250 MB','1','699,90'],
    ['DEDICADO PRO — 100 MB','1','799,90'],
    ['DEDICADO PRO — 150 MB','1','899,90'],
    ['DEDICADO PRO — 250 MB','1','1199,90']
    ];

    function carregarDados(){
        const raw = localStorage.getItem('cad_orcamento');
        if(!raw) return null;
        try{return JSON.parse(raw);}catch(e){return null;}
    }
    function salvarDadosStorage(obj){
        try{ localStorage.setItem('cad_orcamento', JSON.stringify(obj)); return true; }
        catch(e){ console.error(e); return false; }
    }
    function formatBR(num){ return num.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
    function parseBR(str){
        if(!str) return 0;
        str = (''+str).trim().replace(/\s/g,'');
        if(/\,\d{1,2}$/.test(str)){ str = str.replace(/\./g,'').replace(',', '.'); }
        else { str = str.replace(/,/g,''); }
        const n = parseFloat(str);
        return isNaN(n)?0:n;
    }

    function createRow(desc, qty, val){
        const tr = document.createElement('tr');
        const tdCheck = document.createElement('td'); tdCheck.innerHTML = `<input type="checkbox" class="row-select">`; tr.appendChild(tdCheck);
        const tdDesc = document.createElement('td'); tdDesc.className='desc-cell'; tdDesc.contentEditable = false; tdDesc.textContent = desc; tr.appendChild(tdDesc);
        const tdQty = document.createElement('td'); tdQty.className='right qty-cell'; tdQty.contentEditable = false; tdQty.textContent = qty; tr.appendChild(tdQty);
        const tdVal = document.createElement('td'); tdVal.className='right val-cell'; tdVal.contentEditable = false; tdVal.textContent = val; tr.appendChild(tdVal);
        const tdAct = document.createElement('td'); tdAct.className='right'; tdAct.innerHTML = `<button class="icon-btn btn-edit" title="Editar linha">✎</button><button class="icon-btn btn-del" title="Apagar linha">🗑</button>`; tr.appendChild(tdAct);

        tdAct.querySelector('.btn-del').addEventListener('click', ()=>{ tr.remove(); updateTotal(); });
        tdAct.querySelector('.btn-edit').addEventListener('click', ()=>{
            const editable = tdDesc.isContentEditable;
            tdDesc.contentEditable = tdQty.contentEditable = tdVal.contentEditable = !editable;
            tdDesc.classList.toggle('editable', !editable);
            tdQty.classList.toggle('editable', !editable);
            tdVal.classList.toggle('editable', !editable);
        if(!editable) tdDesc.focus();
        });

        tdDesc.addEventListener('input', updateTotal);
        tdQty.addEventListener('input', updateTotal);
        tdVal.addEventListener('input', updateTotal);

        return tr;
    }

    function populateTable(data){
        const tbody = document.getElementById('plansBody');
        tbody.innerHTML = '';
        const rows = (data && data.table && data.table.length) ? data.table : defaultPlans;
        rows.forEach(r=>{ const [d,q,v] = r; tbody.appendChild(createRow(d,q,v)); });
        updateTotal();
    
        const sel = document.getElementById('selectAll');
        if(sel) sel.checked = false;
    }

    function serializeTable(){
        const rows = [];
        document.querySelectorAll('#plansBody tr').forEach(tr=>{
            const desc = tr.querySelector('.desc-cell').textContent.trim();
            const qty = tr.querySelector('.qty-cell').textContent.trim();
            const val = tr.querySelector('.val-cell').textContent.trim();
            rows.push([desc, qty, val]);
        });
        return rows;
    }

    function updateTotal(){
        let total = 0;
        document.querySelectorAll('#plansBody tr').forEach(tr=>{
            const qty = parseBR(tr.querySelector('.qty-cell').textContent || '0');
            const val = parseBR(tr.querySelector('.val-cell').textContent || '0');
            total += qty * val;
        });
        document.getElementById('totalValue').textContent = formatBR(total);
    }


    function preencherTela(data){
        const a = (data && data.answers) ? data.answers : {};
        document.getElementById('metaDate').textContent = 'Data: ' + (data && data.date ? data.date : new Date().toLocaleDateString('pt-BR'));
        document.getElementById('c_nome').textContent = a.cliente || '';
        document.getElementById('c_doc').textContent = a.documento || a.cpf || '';
        document.getElementById('c_end').textContent = a.endereco_log || '';
        document.getElementById('c_cid').textContent = a.endereco_cidade || '';
        document.getElementById('c_tel').textContent = a.tel_titular || a.tel_recado || '';
        document.getElementById('c_email').textContent = a.email || '';
        document.getElementById('obsText').textContent = (data && data.obs) ? data.obs : '---';
        populateTable(data);

        const showTotal = (data && typeof data.showTotal !== 'undefined') ? !!data.showTotal : true;
        document.getElementById('totalRow').style.display = showTotal ? '' : 'none';
        document.getElementById('toggleTotal').textContent = showTotal ? 'Esconder Total' : 'Mostrar Total';
    }


    document.getElementById('addRow').addEventListener('click', ()=>{
        const tbody = document.getElementById('plansBody');
        const tr = createRow('Novo item','1','0,00');
        tbody.appendChild(tr);
        tr.querySelector('.btn-edit').click();
        updateTotal();
    });

    document.getElementById('toggleEdit').addEventListener('click', ()=>{
        const btn = document.getElementById('toggleEdit');
        const on = btn.textContent.includes('Ativar');
        document.querySelectorAll('.desc-cell, .qty-cell, .val-cell').forEach(c=>{
            c.contentEditable = on ? 'true' : 'false';
            c.classList.toggle('editable', on);
        });
        btn.textContent = on ? 'Desativar Edição' : 'Ativar Edição';
    });

    document.getElementById('clearSelected').addEventListener('click', ()=>{
        let removed = 0;
        document.querySelectorAll('.row-select').forEach(ch=>{
            if(ch.checked){ ch.closest('tr').remove(); removed++; }
        });
        if(removed) updateTotal();

        document.getElementById('selectAll').checked = false;
    });


    document.getElementById('selectAll').addEventListener('change', (e)=>{
        const on = e.target.checked;
        document.querySelectorAll('.row-select').forEach(ch => ch.checked = on);
    });

    document.getElementById('toggleTotal').addEventListener('click', ()=>{
        const totalRow = document.getElementById('totalRow');
        const visible = totalRow.style.display !== 'none';
        totalRow.style.display = visible ? 'none' : '';
        document.getElementById('toggleTotal').textContent = visible ? 'Mostrar Total' : 'Esconder Total';
    });

    document.getElementById('saveBtn').addEventListener('click', ()=>{
        const data = carregarDados() || {answers:{}};
        data.answers = data.answers || {};
        data.answers.cliente = document.getElementById('c_nome').textContent.trim();
        data.answers.cpf = document.getElementById('c_doc').textContent.trim();
        data.answers.documento = document.getElementById('c_doc').textContent.trim();
        data.answers.endereco_log = document.getElementById('c_end').textContent.trim();
        data.answers.endereco_cidade = document.getElementById('c_cid').textContent.trim();
        data.answers.tel_titular = document.getElementById('c_tel').textContent.trim();
        data.answers.email = document.getElementById('c_email').textContent.trim();
        data.date = new Date().toLocaleDateString('pt-BR');
        data.obs = document.getElementById('obsText').textContent.trim();
        data.table = serializeTable();
        data.showTotal = document.getElementById('totalRow').style.display !== 'none';
        const ok = salvarDadosStorage(data);
        alert(ok ? 'Orçamento salvo no localStorage.' : 'Falha ao salvar.');
    });

    document.getElementById('backBtn').addEventListener('click', ()=>{
        document.getElementById('saveBtn').click();
        window.open('index.html','_self');
    });

    document.getElementById('downloadPdf').addEventListener('click', ()=>{
        updateTotal();
        document.getElementById('saveBtn').click();

        document.documentElement.classList.add('pdf-mode');

        const element = document.getElementById('pdfContent');
        const opt = {
        margin:       [0.25,0.25,0.25,0.25],
        filename:     'orcamento_bless.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 1.6, useCORS: true, logging:false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(()=>{
        document.documentElement.classList.remove('pdf-mode');
        }).catch((err)=>{
        console.error(err);
        document.documentElement.classList.remove('pdf-mode');
        });
    });

    document.addEventListener('input', (e)=>{
        if(e.target.matches('.desc-cell, .qty-cell, .val-cell')) updateTotal();
        
        if(e.target.matches('.row-select')) {
            const all = document.querySelectorAll('.row-select');
            const checked = Array.from(all).every(ch => ch.checked);
        document.getElementById('selectAll').checked = checked;
    }
    });

 
    const data = carregarDados();
    preencherTela(data);
    setInterval(updateTotal, 1000);