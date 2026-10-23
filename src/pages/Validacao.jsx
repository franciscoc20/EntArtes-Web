import { useState } from 'react';

function Validacao({ pedidos, onConfirmar, onRejeitar, onCancelar, onValidarRealizacao, filtroInicial }) {
  const [filtro, setFiltro] = useState(filtroInicial || 'aceite');
  const [motivoId, setMotivoId] = useState(null);
  const [motivo, setMotivo] = useState('');

  const pedidosFiltrados = pedidos.filter(p => p.status === filtro);
  const aceites             = pedidos.filter(p => p.status === 'aceite').length;
  const realizadoPendente   = pedidos.filter(p => p.status === 'realizado_pendente').length;

  function handleRejeitar(id) {
    setMotivoId(id);
    setMotivo('');
  }

  function confirmarRejeicao() {
    onRejeitar(motivoId, motivo);
    setMotivoId(null);
    setMotivo('');
  }

  return (
    <div>
      <div className="page-header">
        <h1>Validação</h1>
        <p>Confirma pedidos e valida a realização dos coachings</p>
      </div>

      <div className="filtro-tabs">
        <button className={filtro === 'aceite' ? 'tab-btn active' : 'tab-btn'} onClick={() => setFiltro('aceite')}>
          Para confirmar {aceites > 0 && <span className="tab-badge">{aceites}</span>}
        </button>
        <button className={filtro === 'realizado_pendente' ? 'tab-btn active' : 'tab-btn'} onClick={() => setFiltro('realizado_pendente')}>
          Validar realização {realizadoPendente > 0 && <span className="tab-badge">{realizadoPendente}</span>}
        </button>
        <button className={filtro === 'pendente' ? 'tab-btn active' : 'tab-btn'} onClick={() => setFiltro('pendente')}>
          Aguarda professor
        </button>
        <button className={filtro === 'confirmado' ? 'tab-btn active' : 'tab-btn'} onClick={() => setFiltro('confirmado')}>
          Confirmados
        </button>
        <button className={filtro === 'validado' ? 'tab-btn active' : 'tab-btn'} onClick={() => setFiltro('validado')}>
          Validados
        </button>
        <button className={filtro === 'rejeitado' ? 'tab-btn active' : 'tab-btn'} onClick={() => setFiltro('rejeitado')}>
          Rejeitados
        </button>
        <button className={filtro === 'recusado' ? 'tab-btn active' : 'tab-btn'} onClick={() => setFiltro('recusado')}>
          Recusados
        </button>
        <button className={filtro === 'cancelado' ? 'tab-btn active' : 'tab-btn'} onClick={() => setFiltro('cancelado')}>
          Cancelados
        </button>
      </div>

      <div className="validacao-lista">
        {pedidosFiltrados.length === 0 && (
          <p className="empty-text">Não há pedidos nesta categoria.</p>
        )}
        {pedidosFiltrados.map(p => (
          <div key={p.id} className={`validacao-card ${p.status}`}>
            <div className="validacao-info">
              <strong>{p.aluno}</strong>
              <span>{p.professor} · {p.modalidade}</span>
              <span>{p.data} às {p.hora} · {p.duracao} min · {p.estudio || '—'}</span>
              {p.valor && <span className="hist-valor">💶 {p.valor}€</span>}
              {p.motivo && <span className="motivo-tag">💬 {p.motivo}</span>}
              {p.eeConfirmou   && <span className="confirmacao-tag">✓ EE confirmou realização</span>}
              {p.profConfirmou && <span className="confirmacao-tag">✓ Professor confirmou realização</span>}
            </div>
            <div className="validacao-acoes">
              <span className={`status-badge ${p.status}`}>{p.status}</span>
              {p.status === 'aceite' && (
                <>
                  <button className="btn-confirmar" onClick={() => onConfirmar(p.id)}>✓ Confirmar</button>
                  <button className="btn-rejeitar" onClick={() => handleRejeitar(p.id)}>✕ Rejeitar</button>
                </>
              )}
              {p.status === 'realizado_pendente' && (
                <button className="btn-validar-real" onClick={() => onValidarRealizacao(p.id)}>
                  ✓ Validar Realização
                </button>
              )}
              {p.status === 'confirmado' && (
                <button className="btn-cancelar-pedido" onClick={() => onCancelar(p.id)}>
                  ✕ Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {motivoId && (
        <div className="disp-modal-overlay" onClick={() => setMotivoId(null)}>
          <div className="disp-modal" onClick={e => e.stopPropagation()}>
            <h3>Motivo de Rejeição</h3>
            <p>Podes indicar o motivo — será visível ao encarregado.</p>
            <textarea className="motivo-textarea"
              placeholder="Ex: Horário incompatível com o professor..."
              value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} />
            <div className="disp-modal-acoes">
              <button onClick={() => setMotivoId(null)} className="btn-cancelar">Cancelar</button>
              <button onClick={confirmarRejeicao} className="btn-rejeitar">Rejeitar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Validacao;