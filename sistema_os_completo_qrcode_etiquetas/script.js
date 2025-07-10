
let ordens = [];
let chart;

function login() {
  const user = document.getElementById('usuario').value;
  const pass = document.getElementById('senha').value;
  if (user === 'ricardo' && pass === '1234') {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
  } else {
    alert('Usuário ou senha incorretos.');
  }
}

function adicionarOS() {
  const titulo = document.getElementById('titulo').value;
  const descricao = document.getElementById('descricao').value;
  const inicio = document.getElementById('inicio').value;
  const fim = document.getElementById('fim').value;

  if (!titulo || !inicio || !fim) return alert("Preencha todos os campos obrigatórios.");

  ordens.push({ titulo, descricao, inicio, fim, status: 'Pendente' });

  document.getElementById('titulo').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('inicio').value = '';
  document.getElementById('fim').value = '';

  atualizarLista();
  atualizarGrafico();
}

function marcarConcluida(index) {
  ordens[index].status = 'Concluída';
  atualizarLista();
  atualizarGrafico();
}

function atualizarLista() {
  const lista = document.getElementById('lista-os');
  lista.innerHTML = '';
  ordens.forEach((os, index) => {
    const div = document.createElement('div');
    div.className = 'os-item ' + (os.status === 'Concluída' ? 'completed' : '');
    div.innerHTML = `
      <strong>${os.titulo}</strong><br>
      ${os.descricao}<br>
      Início: ${new Date(os.inicio).toLocaleString()}<br>
      Término: ${new Date(os.fim).toLocaleString()}<br>
      Status: ${os.status}
      ${os.status === 'Pendente' ? `<button onclick="marcarConcluida(${index})">Marcar Concluída</button>` : ''}
    `;
    lista.appendChild(div);
  });
}

function atualizarGrafico() {
  const pendentes = ordens.filter(os => os.status === 'Pendente').length;
  const concluidas = ordens.filter(os => os.status === 'Concluída').length;

  const dados = {
    labels: ['Pendentes', 'Concluídas'],
    datasets: [{
      label: 'Status das OS',
      data: [pendentes, concluidas],
      backgroundColor: ['#f39c12', '#2ecc71']
    }]
  };

  if (chart) {
    chart.data = dados;
    chart.update();
  } else {
    const ctx = document.getElementById('graficoOS').getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: dados,
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Controle de Manutenção' }
        }
      }
    });
  }
}

function gerarPDF() {
  const element = document.getElementById('os-container');
  const opt = {
    margin:       0.5,
    filename:     'ordens_servico.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

function gerarExcel() {
  const ws_data = [["Título", "Descrição", "Início", "Término", "Status"]];
  ordens.forEach(os => {
    ws_data.push([os.titulo, os.descricao, os.inicio, os.fim, os.status]);
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Ordens");
  XLSX.writeFile(wb, "ordens_servico.xlsx");
}

function gerarQRCode() {
  const container = document.getElementById("qr-codes");
  container.innerHTML = "";
  ordens.forEach((os, index) => {
    const canvas = document.createElement("canvas");
    const qr = new QRious({
      element: canvas,
      value: `OS ${index + 1}\nTítulo: ${os.titulo}\nStatus: ${os.status}\nInício: ${os.inicio}\nFim: ${os.fim}`,
      size: 150,
    });
    container.appendChild(canvas);
  });
}

function salvarQRCodesComoImagens() {
  ordens.forEach((os, index) => {
    const canvas = document.createElement("canvas");
    new QRious({
      element: canvas,
      value: `OS ${index + 1}\nTítulo: ${os.titulo}\nStatus: ${os.status}\nInício: ${os.inicio}\nFim: ${os.fim}`,
      size: 150,
    });
    const link = document.createElement('a');
    link.download = `os_${index + 1}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
}

function gerarPDFdeQRCodes() {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.gap = "10px";

  ordens.forEach((os, index) => {
    const div = document.createElement("div");
    div.style.margin = "10px";
    const canvas = document.createElement("canvas");
    new QRious({
      element: canvas,
      value: `OS ${index + 1}\nTítulo: ${os.titulo}\nStatus: ${os.status}\nInício: ${os.inicio}\nFim: ${os.fim}`,
      size: 150,
    });
    const label = document.createElement("div");
    label.innerText = `OS ${index + 1} - ${os.titulo}`;
    label.style.fontSize = "12px";
    label.style.textAlign = "center";
    div.appendChild(canvas);
    div.appendChild(label);
    container.appendChild(div);
  });

  html2pdf().from(container).set({ margin: 0.3, filename: 'etiquetas_qr.pdf' }).save();
}

function buscarOSPorQRCode(valorQRCode) {
  const os = ordens.find(os => valorQRCode.includes(os.titulo));
  if (os) {
    alert(`OS encontrada:\nTítulo: ${os.titulo}\nStatus: ${os.status}\nInício: ${os.inicio}\nFim: ${os.fim}`);
  } else {
    alert("OS não encontrada.");
  }
}
