import { useState } from 'react';

function Historico({ pedidos }) {
  const [filtroProfessor, setFiltroProfessor] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const professores = [...new Set(pedidos.map(p => p.professor).filter(Boolean))];

  const pedidosFiltrados = pedidos.filter(p => {
    const matchProfessor = filtroProfessor === '' || p.professor === filtroProfessor;
    const matchStatus    = filtroStatus === ''    || p.status === filtroStatus;
    const matchData      = filtroData === ''      || p.data === filtroData;
    return matchProfessor && matchStatus && matchData;
  });

  const totalFaturado = pedidosFiltrados
    .filter(p => p.status === 'confirmado')
    .reduce((acc, p) => acc + Number(p.valor || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1>Histórico</h1>
        <p>Registo detalhado de todos os coachings</p>
      </div>

      <div className="inventario-controlos">
        <select
          className="inventario-filtro"
          value={filtroProfessor}
          onChange={e => setFiltroProfessor(e.target.value)}
        >
          <option value="">Todos os professores</option>
          {professores.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

<select
  className="inventario-filtro"
  value={filtroStatus}
  onChange={e => setFiltroStatus(e.target.value)}
>
  <option value="">Todos os estados</option>
  <option value="pendente">Aguarda professor</option>
  <option value="aceite">Para validar</option>
  <option value="confirmado">Confirmado</option>
  <option value="rejeitado">Rejeitado</option>
  <option value="recusado">Recusado pelo professor</option>
  <option value="cancelado">Cancelado</option>
</select>
        <input
          type="date"
          className="inventario-filtro"
          value={filtroData}
          onChange={e => setFiltroData(e.target.value)}
        />

        {(filtroProfessor || filtroStatus || filtroData) && (
          <button
            className="btn-adicionar"
            onClick={() => { setFiltroProfessor(''); setFiltroStatus(''); setFiltroData(''); }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="historico-wrapper">
        <table className="historico-tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Aluno</th>
              <th>Professor</th>
              <th>Modalidade</th>
              <th>Estúdio</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Duração</th>
              <th>Formato</th>
              <th>Valor</th>
              <th>Estado</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.length === 0 && (
              <tr>
                <td colSpan="12" className="empty-text">Nenhum registo encontrado.</td>
              </tr>
            )}
            {pedidosFiltrados.map(p => (
              <tr key={p.id}>
                <td className="hist-id">#{p.id}</td>
                <td><strong>{p.aluno}</strong></td>
                <td>{p.professor || '—'}</td>
                <td>{p.modalidade || '—'}</td>
                <td>{p.estudio || '—'}</td>
                <td>{p.data || '—'}</td>
                <td>{p.hora || '—'}</td>
                <td>{p.duracao} min</td>
                <td>{p.formato || '—'}</td>
                <td className="hist-valor">{p.valor ? `${p.valor}€` : '—'}</td>
                <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                <td className="hist-motivo">{p.motivo || '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="9" className="hist-total-label">Total faturado (confirmados)</td>
              <td className="hist-total-valor">{totalFaturado.toFixed(2)}€</td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default Historico;