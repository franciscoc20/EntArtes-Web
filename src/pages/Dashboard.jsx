function Dashboard({ pedidos, onNavegar }) {
  const paraValidar = pedidos.filter(p => p.status === 'aceite').length;
  const confirmados = pedidos.filter(p => p.status === 'confirmado').length;
  const totalFaturado = pedidos
    .filter(p => p.status === 'confirmado')
    .reduce((acc, p) => acc + Number(p.valor || 0), 0);

  const ultimos = [...pedidos].slice(-4).reverse();

  const hoje = new Date().toISOString().split('T')[0];
  const proximos = pedidos
    .filter(p => p.status === 'confirmado' && p.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data) || a.hora?.localeCompare(b.hora))
    .slice(0, 4);

  const porProfessor = pedidos
    .filter(p => p.status === 'confirmado' && p.professor)
    .reduce((acc, p) => {
      acc[p.professor] = (acc[p.professor] || 0) + 1;
      return acc;
    }, {});

  const rankingProfessores = Object.entries(porProfessor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const maxCoachings = rankingProfessores[0]?.[1] || 1;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Bem-vindo à plataforma Ent'Artes</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>📋</span>
          <span className="stat-label">Total de Pedidos</span>
          <span className="stat-valor">{pedidos.length}</span>
        </div>
        <div
          className="stat-card stat-card-clicavel"
          onClick={() => onNavegar('validacao', 'aceite')}
        >
          <span>⏳</span>
          <span className="stat-label">Para Validar</span>
          <span className="stat-valor">{paraValidar}</span>
          <span className="stat-hint">clica para ver →</span>
        </div>
        <div
          className="stat-card stat-card-clicavel"
          onClick={() => onNavegar('validacao', 'confirmado')}
        >
          <span>✅</span>
          <span className="stat-label">Confirmados</span>
          <span className="stat-valor">{confirmados}</span>
          <span className="stat-hint">clica para ver →</span>
        </div>
        <div className="stat-card">
          <span>💶</span>
          <span className="stat-label">Total Faturado</span>
          <span className="stat-valor">{totalFaturado.toFixed(0)}€</span>
        </div>
      </div>

      <div className="dashboard-grid-2">

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Últimos Pedidos</h2>
            <button className="btn-link" onClick={() => onNavegar('validacao', 'aceite')}>
              Ver todos →
            </button>
          </div>
          <div className="ultimos-pedidos">
            {ultimos.length === 0 && (
              <p className="empty-text">Ainda não há pedidos.</p>
            )}
            {ultimos.map(p => (
              <div key={p.id} className="pedido-item">
                <div className="pedido-info">
                  <strong>{p.aluno}</strong>
                  <span>{p.professor} · {p.modalidade} · {p.data}{p.hora ? ` às ${p.hora}` : ''}</span>
                </div>
                <span className={`status-badge ${p.status}`}>{p.status}</span>
              </div>
            ))}
          </div>
          {paraValidar > 0 && (
            <button className="btn-validar" onClick={() => onNavegar('validacao', 'aceite')}>
              Validar {paraValidar} pedido{paraValidar > 1 ? 's' : ''} aceite{paraValidar > 1 ? 's' : ''}
            </button>
          )}
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Próximos Coachings</h2>
          </div>
          <div className="ultimos-pedidos">
            {proximos.length === 0 && (
              <p className="empty-text">Sem coachings confirmados futuros.</p>
            )}
            {proximos.map(p => (
              <div key={p.id} className="pedido-item">
                <div className="pedido-info">
                  <strong>{p.aluno}</strong>
                  <span>{p.professor} · {p.estudio}</span>
                  <span>{p.data} às {p.hora} · {p.duracao} min</span>
                </div>
                <span className="status-badge confirmado">confirmado</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Coachings por Professor</h2>
          </div>
          {rankingProfessores.length === 0 && (
            <p className="empty-text">Sem dados ainda.</p>
          )}
          <div className="ranking-lista">
            {rankingProfessores.map(([prof, count]) => (
              <div key={prof} className="ranking-item">
                <div className="ranking-topo">
                  <span className="ranking-nome">{prof}</span>
                  <span className="ranking-count">{count}</span>
                </div>
                <div className="ranking-barra-bg">
                  <div
                    className="ranking-barra-fill"
                    style={{ width: `${(count / maxCoachings) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;