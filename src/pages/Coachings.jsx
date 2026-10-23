import { useState } from 'react';
import { ocupacaoPorData, getSlotsOcupados } from './Disponibilidade';

const VALOR_HORA = 36;
const HOJE = new Date().toISOString().split('T')[0];

function calcularValor(duracao) {
  return ((Number(duracao) / 60) * VALOR_HORA).toFixed(2);
}

function Coachings({ pedidos, onAdicionarPedido, professores, modalidades, alunos }) {
  const [form, setForm] = useState({
    aluno: '',
    professor: '',
    modalidade: '',
    data: '',
    hora: '',
    duracao: '60',
    formato: 'particular',
    estudio: '',
  });

  const [pedidosSessao, setPedidosSessao] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const [aviso, setAviso] = useState('');

  const modalidadesDisponiveis = form.professor
    ? professores.find(p => p.nome === form.professor)?.modalidades || []
    : modalidades;

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'professor') {
      setForm({ ...form, professor: value, modalidade: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
    setAviso('');
  }

  function verificarConflito() {
    if (!form.estudio || !form.data || !form.hora || !form.duracao) return null;

    const slotsNovos = getSlotsOcupados(form.hora, form.duracao);

    // Verificar conflito por aluno
    if (form.aluno) {
      const conflitoAluno = pedidos.find(p => {
        if (p.aluno !== form.aluno) return false;
        if (p.data !== form.data) return false;
        if (!['pendente', 'aceite', 'confirmado'].includes(p.status)) return false;
        const slotsExistentes = getSlotsOcupados(p.hora, p.duracao);
        return slotsNovos.some(s => slotsExistentes.includes(s));
      });

      if (conflitoAluno) {
        return `⚠️ ${form.aluno} já tem um coaching marcado nesse horário (${conflitoAluno.hora} · ${conflitoAluno.duracao} min).`;
      }
    }

    // Verificar conflito por professor
if (form.professor) {
  const conflitoProfessor = pedidos.find(p => {
    if (p.professor !== form.professor) return false;
    if (p.data !== form.data) return false;
    if (!['pendente', 'aceite', 'confirmado'].includes(p.status)) return false;
    const slotsExistentes = getSlotsOcupados(p.hora, p.duracao);
    return slotsNovos.some(s => slotsExistentes.includes(s));
  });

  if (conflitoProfessor) {
    return `⚠️ ${form.professor} já tem um coaching marcado nesse horário (${conflitoProfessor.hora} · ${conflitoProfessor.duracao} min).`;
  }
}

    // Verificar conflito por estúdio
    const conflito = pedidos.find(p => {
      if (p.estudio !== form.estudio) return false;
      if (p.data !== form.data) return false;
      if (!['pendente', 'aceite', 'confirmado'].includes(p.status)) return false;
      const slotsExistentes = getSlotsOcupados(p.hora, p.duracao);
      return slotsNovos.some(s => slotsExistentes.includes(s));
    });

    if (conflito) {
      return `⚠️ ${form.estudio} já tem um coaching das ${conflito.hora} (${conflito.duracao} min) nesse dia — horários sobrepostos.`;
    }

    const ocupacaoData = ocupacaoPorData[form.data];
    if (ocupacaoData) {
      const temConflito = slotsNovos.some(slot => ocupacaoData[form.estudio]?.[slot]);
      if (temConflito) {
        return `⚠️ ${form.estudio} já tem uma aula marcada nesse horário.`;
      }
    }

    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.aluno || !form.professor || !form.data || !form.hora || !form.estudio) {
      setAviso('⚠️ Preenche todos os campos obrigatórios.');
      return;
    }

    if (form.data < HOJE) {
      setAviso('⚠️ Não podes marcar um coaching numa data que já passou.');
      return;
    }

    const conflito = verificarConflito();
    if (conflito) {
      setAviso(conflito);
      return;
    }

    const valor = calcularValor(form.duracao);
    const pedido = { ...form, valor };

    onAdicionarPedido(pedido);
    setPedidosSessao([...pedidosSessao, pedido]);
    setForm({ aluno: '', professor: '', modalidade: '', data: '', hora: '', duracao: '60', formato: 'particular', estudio: '' });
    setEnviado(true);
    setAviso('');
    setTimeout(() => setEnviado(false), 3000);
  }

  const campoAluno = alunos && alunos.length > 0 ? (
    <label>Aluno
      <select name="aluno" value={form.aluno} onChange={handleChange}>
        <option value="">Selecionar aluno</option>
        {alunos.map(a => (
          <option key={a.id} value={a.nome}>{a.nome}</option>
        ))}
      </select>
    </label>
  ) : alunos && alunos.length === 0 ? (
    <div className="form-aviso">
      ⚠️ Ainda não tens alunos adicionados. Vai a <strong>Os meus Alunos</strong> para adicionar primeiro.
    </div>
  ) : (
    <label>Nome do Aluno
      <input
        type="text"
        name="aluno"
        value={form.aluno}
        onChange={handleChange}
        placeholder="Nome completo"
      />
    </label>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Coachings</h1>
        <p>Requisita uma aula particular</p>
      </div>

      <div className="coachings-layout">
        <form className="coaching-form" onSubmit={handleSubmit}>
          <h2>Novo Pedido</h2>

          {enviado && (
            <div className="form-sucesso">
              ✅ Pedido enviado com sucesso! Aguarda confirmação.
            </div>
          )}

          {aviso && (
            <div className="form-aviso">
              {aviso}
            </div>
          )}

          {campoAluno}

          <label>Professor
            <select name="professor" value={form.professor} onChange={handleChange}>
              <option value="">Selecionar professor</option>
              {professores.map(p => (
                <option key={p.nome} value={p.nome}>{p.nome}</option>
              ))}
            </select>
          </label>

          <label>Modalidade
            <select name="modalidade" value={form.modalidade} onChange={handleChange} disabled={!form.professor}>
              <option value="">
                {form.professor ? 'Selecionar modalidade' : 'Seleciona primeiro o professor'}
              </option>
              {modalidadesDisponiveis.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label>Estúdio
            <select name="estudio" value={form.estudio} onChange={handleChange}>
              <option value="">Selecionar estúdio</option>
              <option>Estúdio 1</option>
              <option>Estúdio 2</option>
              <option>Estúdio 3</option>
              <option>Estúdio 4</option>
              <option>Estúdio 5</option>
              <option>Estúdio 6</option>
              <option>Estúdio 7</option>
              <option>Estúdio 8</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ flex: 1 }}>Data
              <input
                type="date"
                name="data"
                value={form.data}
                onChange={handleChange}
                min={HOJE}
              />
            </label>
            <label style={{ flex: 1 }}>Hora de Início
              <select name="hora" value={form.hora} onChange={handleChange}>
                <option value="">Selecionar hora</option>
                <option>09:00</option><option>09:30</option>
                <option>10:00</option><option>10:30</option>
                <option>11:00</option><option>11:30</option>
                <option>12:00</option><option>12:30</option>
                <option>13:00</option><option>13:30</option>
                <option>14:00</option><option>14:30</option>
                <option>15:00</option><option>15:30</option>
                <option>16:00</option><option>16:30</option>
                <option>17:00</option><option>17:30</option>
                <option>18:00</option><option>18:30</option>
                <option>19:00</option><option>19:30</option>
                <option>20:00</option><option>20:30</option>
                <option>21:00</option>
              </select>
            </label>
          </div>

          <label>Duração
            <select name="duracao" value={form.duracao} onChange={handleChange}>
              <option value="30">30 minutos</option>
              <option value="60">60 minutos</option>
              <option value="90">90 minutos</option>
              <option value="120">120 minutos</option>
            </select>
          </label>

          <label>Formato
            <select name="formato" value={form.formato} onChange={handleChange}>
              <option value="particular">Particular</option>
              <option value="dueto">Dueto</option>
              <option value="trio">Trio</option>
              <option value="ensemble">Ensemble (4-8 alunos)</option>
            </select>
          </label>

          <div className="valor-preview">
            💶 Valor estimado: <strong>{calcularValor(form.duracao)}€</strong>
          </div>

          <button type="submit">Enviar Pedido</button>
        </form>

        {pedidosSessao.length > 0 && (
          <div className="pedidos-lista">
            <h3>Pedidos desta sessão</h3>
            {pedidosSessao.map((p, i) => (
              <div key={i} className="pedido-item">
                <div className="pedido-info">
                  <strong>{p.aluno}</strong>
                  <span>{p.professor} · {p.estudio} · {p.data} às {p.hora} · {p.duracao} min · {p.formato}</span>
                  <span className="pedido-valor">💶 {p.valor}€</span>
                </div>
                <span className="status-badge pendente">pendente</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Coachings;