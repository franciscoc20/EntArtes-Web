import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Coachings from './pages/Coachings';
import Validacao from './pages/Validacao';
import Inventario from './pages/Inventario';
import Disponibilidade from './pages/Disponibilidade';
import Historico from './pages/Historico';
import logo from './logo_entartes.png';

export const PROFESSORES = [
  { nome: 'Natália Azevedo', modalidades: ['Ballet Clássico', 'Dança Contemporânea'] },
  { nome: 'Filipe Narciso',  modalidades: ['Jazz', 'Dança Contemporânea'] },
  { nome: 'Rodolfo Iacca',   modalidades: ['Flamenco', 'Ballet Clássico'] },
  { nome: 'Maria Borges',    modalidades: ['Ballet Clássico', 'Acrobática'] },
  { nome: 'Ana Luís Gomes',  modalidades: ['Teatro Musical', 'Jazz'] },
  { nome: 'Alexandra Galvão',modalidades: ['Acrobática'] },
];

export const MODALIDADES = [
  'Ballet Clássico', 'Jazz', 'Dança Contemporânea',
  'Acrobática', 'Flamenco', 'Teatro Musical',
];

const pedidosIniciais = [
  { id: 1, aluno: 'Sofia Martins',  professor: 'Natália Azevedo', modalidade: 'Ballet Clássico', data: '2026-06-10', hora: '16:00', duracao: '60', status: 'pendente',   valor: '36.00', estudio: 'Estúdio 1', formato: 'particular' },
  { id: 2, aluno: 'Rodrigo Costa',  professor: 'Filipe Narciso',  modalidade: 'Jazz',            data: '2026-06-11', hora: '17:00', duracao: '30', status: 'pendente',   valor: '18.00', estudio: 'Estúdio 2', formato: 'particular' },
  { id: 3, aluno: 'Beatriz Lima',   professor: 'Maria Borges',    modalidade: 'Ballet Clássico', data: '2026-06-01', hora: '18:00', duracao: '60', status: 'confirmado', valor: '36.00', estudio: 'Estúdio 3', formato: 'particular' },
];

function Login({ onLogin }) {
  const [perfil, setPerfil] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  const PASSWORDS = { direcao: '1234', professor: '1234', ee: '1234' };

  function handleEntrar() {
    if (!perfil) { setErro('Seleciona um perfil.'); return; }
    if (!nome.trim()) { setErro('Seleciona ou introduz o teu nome.'); return; }
    if (!password) { setErro('Introduz a palavra-passe.'); return; }
    if (password !== PASSWORDS[perfil]) { setErro('Palavra-passe incorreta.'); return; }
    onLogin({ perfil, nome: nome.trim() });
  }

  return (
    <div className="login-overlay">
      <div className="login-card">
        <img src={logo} alt="Ent'Artes" className="login-logo" />
        <h1 className="login-titulo">Plataforma Ent'Artes</h1>
        <p className="login-sub">Seleciona o teu perfil para entrar</p>
        <div className="login-perfis">
          <button className={`login-perfil-btn ${perfil === 'direcao' ? 'active' : ''}`}
            onClick={() => { setPerfil('direcao'); setNome('Direção'); setPassword(''); setErro(''); }}>
            <span className="login-perfil-icone">🏫</span>
            <span className="login-perfil-label">Direção</span>
            <span className="login-perfil-desc">Acesso total</span>
          </button>
          <button className={`login-perfil-btn ${perfil === 'professor' ? 'active' : ''}`}
            onClick={() => { setPerfil('professor'); setNome(''); setPassword(''); setErro(''); }}>
            <span className="login-perfil-icone">👨‍🏫</span>
            <span className="login-perfil-label">Professor</span>
            <span className="login-perfil-desc">Ver horários e aceitar aulas</span>
          </button>
          <button className={`login-perfil-btn ${perfil === 'ee' ? 'active' : ''}`}
            onClick={() => { setPerfil('ee'); setNome(''); setPassword(''); setErro(''); }}>
            <span className="login-perfil-icone">👨‍👩‍👧</span>
            <span className="login-perfil-label">Encarregado</span>
            <span className="login-perfil-desc">Ver professores e pedir coachings</span>
          </button>
        </div>
        {perfil === 'professor' && (
          <div className="login-profs-lista">
            <p className="login-label-escolha">Seleciona o teu nome:</p>
            <div className="login-profs-grid">
              {PROFESSORES.map(p => (
                <button key={p.nome} className={`login-prof-item ${nome === p.nome ? 'active' : ''}`}
                  onClick={() => { setNome(p.nome); setErro(''); }}>
                  <div className="login-prof-avatar">{p.nome[0]}</div>
                  <div className="login-prof-info">
                    <strong>{p.nome}</strong>
                    <span>{p.modalidades.join(', ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {perfil === 'ee' && (
          <input className="login-input" type="text" placeholder="O teu nome" value={nome}
            onChange={e => { setNome(e.target.value); setErro(''); }} />
        )}
        {perfil && (
          <input className="login-input" type="password" placeholder="Palavra-passe" value={password}
            onChange={e => { setPassword(e.target.value); setErro(''); }}
            onKeyDown={e => e.key === 'Enter' && handleEntrar()} />
        )}
        {erro && <p className="login-erro">{erro}</p>}
        {perfil && (
          <button className="login-btn" onClick={handleEntrar}>
            {nome ? `Entrar como ${nome}` : 'Entrar'}
          </button>
        )}
      </div>
    </div>
  );
}

function ProfessoresEE({ professores, pedidos }) {
  const [profSelecionado, setProfSelecionado] = useState(null);
  const [dataAtiva, setDataAtiva] = useState(new Date().toISOString().split('T')[0]);

  const HORAS = [
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '12:00','12:30','13:00','13:30','14:00','14:30',
    '15:00','15:30','16:00','16:30','17:00','17:30',
    '18:00','18:30','19:00','19:30','20:00','20:30','21:00',
  ];

  function getSlotsProf(horaInicio, duracao) {
    const slots = [];
    const [h, m] = horaInicio.split(':').map(Number);
    let totalMins = h * 60 + m;
    const fim = totalMins + Number(duracao);
    while (totalMins < fim) {
      const hh = String(Math.floor(totalMins / 60)).padStart(2, '0');
      const mm = String(totalMins % 60).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
      totalMins += 30;
    }
    return slots;
  }

  const slotsOcupados = profSelecionado
    ? pedidos
        .filter(p =>
          p.professor === profSelecionado.nome &&
          p.data === dataAtiva &&
          ['aceite', 'confirmado'].includes(p.status) &&
          p.hora
        )
        .flatMap(p => getSlotsProf(p.hora, p.duracao))
    : [];

  return (
    <div>
      <div className="page-header">
        <h1>Professores</h1>
        <p>Clica num professor para ver a sua disponibilidade</p>
      </div>
      <div className="profs-grid">
        {professores.map(p => (
          <div key={p.nome} className="prof-card"
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => { setProfSelecionado(p); setDataAtiva(new Date().toISOString().split('T')[0]); }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div className="prof-avatar">{p.nome[0]}</div>
            <div className="prof-info">
              <strong>{p.nome}</strong>
              <div className="prof-modalidades">
                {p.modalidades.map(m => <span key={m} className="prof-tag">{m}</span>)}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#E05A1C', fontWeight: 600, marginTop: '4px' }}>
                Ver disponibilidade →
              </span>
            </div>
          </div>
        ))}
      </div>

      {profSelecionado && (
        <div className="disp-modal-overlay" onClick={() => setProfSelecionado(null)}>
          <div className="disp-modal" style={{ maxWidth: '520px', width: '95%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '2px' }}>{profSelecionado.nome}</h3>
                <p>{profSelecionado.modalidades.join(', ')}</p>
              </div>
              <button onClick={() => setProfSelecionado(null)} className="btn-cancelar">✕</button>
            </div>
            <input type="date" value={dataAtiva}
              onChange={e => setDataAtiva(e.target.value)}
              className="disp-data-input" style={{ width: '100%' }} />
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '4px' }}>
                {HORAS.map(hora => {
                  const ocupado = slotsOcupados.includes(hora);
                  return (
                    <div key={hora} style={{ display: 'contents' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9E8E82', display: 'flex', alignItems: 'center', padding: '4px 0' }}>
                        {hora}
                      </span>
                      <div style={{
                        borderRadius: '8px', padding: '8px 12px', fontSize: '0.78rem', fontWeight: 500,
                        background: ocupado ? '#E6F4F2' : '#F7F3EF',
                        color: ocupado ? '#00695C' : '#C8BDB6',
                        border: ocupado ? '1px solid #A8D5CF' : '1px solid #EDE8E3',
                        marginBottom: '3px',
                      }}>
                        {ocupado ? '● Ocupado' : '○ Disponível'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem' }}>
              <span style={{ color: '#00695C', fontWeight: 600 }}>● Ocupado</span>
              <span style={{ color: '#C8BDB6', fontWeight: 600 }}>○ Disponível</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VistaEE({ utilizador, onSair, pedidos, onAdicionarPedido, onConfirmarRealizacao }) {
  const [tabAtiva, setTabAtiva] = useState('dashboard');

  const [alunos, setAlunos] = useState(() => {
    const guardados = localStorage.getItem(`alunos_${utilizador.nome}`);
    return guardados ? JSON.parse(guardados) : [];
  });

  const [mostrarFormAluno, setMostrarFormAluno] = useState(false);
  const [novoAluno, setNovoAluno] = useState({ nome: '', modalidade: '', idade: '' });

  useEffect(() => {
    localStorage.setItem(`alunos_${utilizador.nome}`, JSON.stringify(alunos));
  }, [alunos, utilizador.nome]);

  const meusPedidos = pedidos.filter(p => alunos.some(a => a.nome === p.aluno));
  const pendentes   = meusPedidos.filter(p => p.status === 'pendente').length;
  const confirmados = meusPedidos.filter(p => p.status === 'confirmado').length;
  const aceites     = meusPedidos.filter(p => p.status === 'aceite').length;

  const hoje = new Date().toISOString().split('T')[0];
  const paraConfirmar = meusPedidos.filter(p =>
    p.status === 'confirmado' && p.data < hoje && !p.eeConfirmou
  );

  function handleNovoAlunoChange(e) {
    setNovoAluno({ ...novoAluno, [e.target.name]: e.target.value });
  }

  function adicionarAluno(e) {
    e.preventDefault();
    if (!novoAluno.nome.trim()) { alert('Indica o nome do aluno!'); return; }
    setAlunos([...alunos, { id: Date.now(), ...novoAluno }]);
    setNovoAluno({ nome: '', modalidade: '', idade: '' });
    setMostrarFormAluno(false);
  }

  function eliminarAluno(id) {
    if (!window.confirm('Tens a certeza que queres remover este aluno?')) return;
    setAlunos(alunos.filter(a => a.id !== id));
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Ent'Artes" className="sidebar-logo-img" />
        </div>
        <nav className="sidebar-nav">
          <button className={`sidebar-btn ${tabAtiva === 'dashboard' ? 'active' : ''}`} onClick={() => setTabAtiva('dashboard')}>
            <span className="sidebar-icone">⊞</span><span>Dashboard</span>
          </button>
          <button className={`sidebar-btn ${tabAtiva === 'alunos' ? 'active' : ''}`} onClick={() => setTabAtiva('alunos')}>
            <span className="sidebar-icone">🎓</span><span>Os meus Alunos</span>
            {alunos.length > 0 && <span className="nav-badge">{alunos.length}</span>}
          </button>
          <button className={`sidebar-btn ${tabAtiva === 'professores' ? 'active' : ''}`} onClick={() => setTabAtiva('professores')}>
            <span className="sidebar-icone">👨‍🏫</span><span>Professores</span>
          </button>
          <button className={`sidebar-btn ${tabAtiva === 'coaching' ? 'active' : ''}`} onClick={() => setTabAtiva('coaching')}>
            <span className="sidebar-icone">◎</span><span>Pedir Coaching</span>
          </button>
          <button className={`sidebar-btn ${tabAtiva === 'meusPedidos' ? 'active' : ''}`} onClick={() => setTabAtiva('meusPedidos')}>
            <span className="sidebar-icone">📋</span><span>Os meus Pedidos</span>
            {(pendentes + aceites + paraConfirmar.length) > 0 && (
              <span className="nav-badge">{pendentes + aceites + paraConfirmar.length}</span>
            )}
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{utilizador.nome[0].toUpperCase()}</div>
            <div>
              <div className="sidebar-user-nome">{utilizador.nome}</div>
              <div className="sidebar-user-role">Encarregado</div>
            </div>
          </div>
          <button className="btn-sair" onClick={onSair}>Sair</button>
        </div>
      </aside>

      <main className="main-content">
        {tabAtiva === 'dashboard' && (
          <div>
            <div className="page-header">
              <h1>Olá, {utilizador.nome.split(' ')[0]}!</h1>
              <p>Bem-vindo à plataforma Ent'Artes</p>
            </div>
            {paraConfirmar.length > 0 && (
              <div className="alerta-realizacao">
                <span>⚠️</span>
                <div>
                  <strong>Tens {paraConfirmar.length} coaching(s) para confirmar realização!</strong>
                  <p>Confirma se as aulas foram realizadas para que a direção possa validar e faturar.</p>
                </div>
                <button className="btn-alerta" onClick={() => setTabAtiva('meusPedidos')}>Confirmar agora →</button>
              </div>
            )}
            <div className="stats-grid">
              <div className="stat-card">
                <span>🎓</span>
                <span className="stat-label">Os meus Alunos</span>
                <span className="stat-valor">{alunos.length}</span>
              </div>
              <div className="stat-card">
                <span>📋</span>
                <span className="stat-label">Total de Pedidos</span>
                <span className="stat-valor">{meusPedidos.length}</span>
              </div>
              <div className="stat-card">
                <span>✅</span>
                <span className="stat-label">Confirmados</span>
                <span className="stat-valor">{confirmados}</span>
              </div>
            </div>
            <div className="dashboard-grid-2">
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <h2>Últimos Pedidos</h2>
                  <button className="btn-link" onClick={() => setTabAtiva('meusPedidos')}>Ver todos →</button>
                </div>
                <div className="ultimos-pedidos">
                  {meusPedidos.length === 0 && <p className="empty-text">Ainda não tens pedidos.</p>}
                  {[...meusPedidos].reverse().slice(0, 4).map(p => (
                    <div key={p.id} className="pedido-item">
                      <div className="pedido-info">
                        <strong>{p.aluno} → {p.professor}</strong>
                        <span>{p.modalidade} · {p.data}{p.hora ? ` às ${p.hora}` : ''}</span>
                      </div>
                      <span className={`status-badge ${p.status}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-validar" onClick={() => setTabAtiva('coaching')}>+ Pedir novo coaching</button>
              </div>
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <h2>Os meus Alunos</h2>
                  <button className="btn-link" onClick={() => setTabAtiva('alunos')}>Ver todos →</button>
                </div>
                <div className="ultimos-pedidos">
                  {alunos.length === 0 && <p className="empty-text">Ainda não adicionaste alunos.</p>}
                  {alunos.slice(0, 4).map(a => (
                    <div key={a.id} className="pedido-item">
                      <div className="pedido-info">
                        <strong>{a.nome}</strong>
                        <span>{a.modalidade || 'Sem modalidade'}{a.idade ? ` · ${a.idade} anos` : ''}</span>
                      </div>
                      <span className="status-badge confirmado">ativo</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tabAtiva === 'alunos' && (
          <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1>Os meus Alunos</h1>
                <p>Gere os alunos associados à tua conta</p>
              </div>
              <button className="btn-adicionar" onClick={() => setMostrarFormAluno(!mostrarFormAluno)}>
                {mostrarFormAluno ? '✕ Cancelar' : '+ Adicionar Aluno'}
              </button>
            </div>
            {mostrarFormAluno && (
              <form className="inventario-form" onSubmit={adicionarAluno}>
                <h3>Novo Aluno</h3>
                <div className="inventario-form-grid">
                  <label>Nome do Aluno *
                    <input type="text" name="nome" value={novoAluno.nome}
                      onChange={handleNovoAlunoChange} placeholder="Ex: Maria Silva" />
                  </label>
                  <label>Modalidade Principal
                    <select name="modalidade" value={novoAluno.modalidade} onChange={handleNovoAlunoChange}>
                      <option value="">Selecionar...</option>
                      {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </label>
                  <label>Idade
                    <input type="number" name="idade" value={novoAluno.idade}
                      onChange={handleNovoAlunoChange} placeholder="Ex: 12" min="3" max="99" />
                  </label>
                </div>
                <button type="submit" className="btn-guardar">Guardar Aluno</button>
              </form>
            )}
            {alunos.length === 0 && !mostrarFormAluno && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9E8E82' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                <h3 style={{ marginBottom: '0.5rem', color: '#1A1410' }}>Ainda não tens alunos</h3>
                <p>Adiciona os teus alunos para gerir os seus coachings facilmente.</p>
              </div>
            )}
            <div className="profs-grid">
              {alunos.map(a => (
                <div key={a.id} className="prof-card" style={{ position: 'relative' }}>
                  <div className="prof-avatar" style={{ background: '#E05A1C' }}>{a.nome[0].toUpperCase()}</div>
                  <div className="prof-info" style={{ flex: 1 }}>
                    <strong>{a.nome}</strong>
                    <div className="prof-modalidades">
                      {a.modalidade && <span className="prof-tag">{a.modalidade}</span>}
                      {a.idade && <span className="prof-tag" style={{ background: '#FEF3CD', color: '#9A6C00' }}>{a.idade} anos</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#9E8E82', marginTop: '4px' }}>
                      {pedidos.filter(p => p.aluno === a.nome).length} pedido(s)
                    </span>
                  </div>
                  <button onClick={() => eliminarAluno(a.id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#C8BDB6' }}
                    onMouseOver={e => e.target.style.color = '#922B21'}
                    onMouseOut={e => e.target.style.color = '#C8BDB6'}>🗑</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tabAtiva === 'professores' && (
          <ProfessoresEE professores={PROFESSORES} pedidos={pedidos} />
        )}

        {tabAtiva === 'coaching' && (
          <Coachings
            pedidos={pedidos}
            onAdicionarPedido={onAdicionarPedido}
            professores={PROFESSORES}
            modalidades={MODALIDADES}
            alunos={alunos}
          />
        )}

        {tabAtiva === 'meusPedidos' && (
          <div>
            <div className="page-header">
              <h1>Os meus Pedidos</h1>
              <p>Acompanha o estado dos pedidos de coaching dos teus alunos</p>
            </div>
            {paraConfirmar.length > 0 && (
              <div className="dashboard-section" style={{ marginBottom: '1.5rem', borderTop: '3px solid #E05A1C' }}>
                <div className="dashboard-section-header">
                  <h2>⚠️ Confirmar Realização ({paraConfirmar.length})</h2>
                  <span style={{ fontSize: '0.8rem', color: '#9E8E82' }}>Prazo: 48h após a aula</span>
                </div>
                <div className="validacao-lista">
                  {paraConfirmar.map(p => (
                    <div key={p.id} className="validacao-card confirmado">
                      <div className="validacao-info">
                        <strong>{p.aluno}</strong>
                        <span>{p.professor} · {p.modalidade}</span>
                        <span>{p.data} às {p.hora} · {p.duracao} min · {p.estudio}</span>
                        {p.valor && <span className="hist-valor">💶 {p.valor}€</span>}
                      </div>
                      <div className="validacao-acoes">
                        <button className="btn-confirmar" onClick={() => onConfirmarRealizacao(p.id, 'ee')}>
                          ✓ Confirmar Realização
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="validacao-lista">
              {meusPedidos.length === 0 && <p className="empty-text">Ainda não tens pedidos.</p>}
              {[...meusPedidos].reverse().map(p => (
                <div key={p.id} className={`validacao-card ${p.status}`}>
                  <div className="validacao-info">
                    <strong>{p.aluno}</strong>
                    <span>{p.professor} · {p.modalidade} · {p.formato}</span>
                    <span>{p.data} às {p.hora} · {p.duracao} min · {p.estudio}</span>
                    {p.valor && <span className="hist-valor">💶 {p.valor}€</span>}
                    {p.motivo && <span className="motivo-tag">💬 {p.motivo}</span>}
                    {p.eeConfirmou && <span className="confirmacao-tag">✓ Confirmaste a realização</span>}
                    {p.profConfirmou && <span className="confirmacao-tag">✓ Professor confirmou</span>}
                  </div>
                  <span className={`status-badge ${p.status}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function VistaProfessor({ utilizador, onSair, pedidos, onAceitar, onRecusar, onConfirmarRealizacao }) {
  const [tabAtiva, setTabAtiva] = useState('coachings');
  const [motivoId, setMotivoId] = useState(null);
  const [motivo, setMotivo] = useState('');

  const meusPedidos = pedidos.filter(p => p.professor === utilizador.nome);
  const pendentes = meusPedidos.filter(p => p.status === 'pendente').length;

  const hoje = new Date().toISOString().split('T')[0];
  const paraConfirmar = meusPedidos.filter(p =>
    p.status === 'confirmado' && p.data < hoje && !p.profConfirmou
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Ent'Artes" className="sidebar-logo-img" />
        </div>
        <nav className="sidebar-nav">
          <button className={`sidebar-btn ${tabAtiva === 'coachings' ? 'active' : ''}`} onClick={() => setTabAtiva('coachings')}>
            <span className="sidebar-icone">◎</span>
            <span>Os meus Coachings</span>
            {(pendentes + paraConfirmar.length) > 0 && <span className="nav-badge">{pendentes + paraConfirmar.length}</span>}
          </button>
          <button className={`sidebar-btn ${tabAtiva === 'horario' ? 'active' : ''}`} onClick={() => setTabAtiva('horario')}>
            <span className="sidebar-icone">◷</span>
            <span>O meu Horário</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{utilizador.nome[0].toUpperCase()}</div>
            <div>
              <div className="sidebar-user-nome">{utilizador.nome}</div>
              <div className="sidebar-user-role">Professor</div>
            </div>
          </div>
          <button className="btn-sair" onClick={onSair}>Sair</button>
        </div>
      </aside>

      <main className="main-content">
        {tabAtiva === 'coachings' && (
          <div>
            <div className="page-header">
              <h1>Os meus Coachings</h1>
              <p>Aceita, recusa e confirma a realização das aulas</p>
            </div>
            {paraConfirmar.length > 0 && (
              <div className="dashboard-section" style={{ marginBottom: '1.5rem', borderTop: '3px solid #E05A1C' }}>
                <div className="dashboard-section-header">
                  <h2>⚠️ Confirmar Realização ({paraConfirmar.length})</h2>
                  <span style={{ fontSize: '0.8rem', color: '#9E8E82' }}>Prazo: 48h após a aula</span>
                </div>
                <div className="validacao-lista">
                  {paraConfirmar.map(p => (
                    <div key={p.id} className="validacao-card confirmado">
                      <div className="validacao-info">
                        <strong>{p.aluno}</strong>
                        <span>{p.modalidade} · {p.formato}</span>
                        <span>{p.data} às {p.hora} · {p.duracao} min · {p.estudio}</span>
                        {p.valor && <span className="hist-valor">💶 {p.valor}€</span>}
                        {p.eeConfirmou && <span className="confirmacao-tag">✓ EE já confirmou</span>}
                      </div>
                      <div className="validacao-acoes">
                        <button className="btn-confirmar" onClick={() => onConfirmarRealizacao(p.id, 'professor')}>
                          ✓ Confirmar Realização
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {['pendente', 'aceite', 'recusado', 'confirmado', 'realizado_pendente', 'validado'].map(estado => {
              const lista = meusPedidos.filter(p => p.status === estado);
              if (lista.length === 0) return null;
              return (
                <div key={estado} className="dashboard-section" style={{ marginBottom: '1.5rem' }}>
                  <div className="dashboard-section-header">
                    <h2>{
                      estado === 'aceite'            ? 'Aceites — a aguardar direção' :
                      estado === 'pendente'           ? 'Novos pedidos' :
                      estado === 'confirmado'         ? 'Confirmados pela direção' :
                      estado === 'realizado_pendente' ? 'Realizados — a aguardar validação direção' :
                      estado === 'validado'           ? 'Validados e faturados' :
                      'Recusados'
                    }</h2>
                  </div>
                  <div className="validacao-lista">
                    {lista.map(p => (
                      <div key={p.id} className={`validacao-card ${p.status}`}>
                        <div className="validacao-info">
                          <strong>{p.aluno}</strong>
                          <span>{p.modalidade} · {p.formato}</span>
                          <span>{p.data} às {p.hora} · {p.duracao} min · {p.estudio}</span>
                          {p.valor && <span className="hist-valor">💶 {p.valor}€</span>}
                          {p.eeConfirmou && <span className="confirmacao-tag">✓ EE confirmou</span>}
                          {p.profConfirmou && <span className="confirmacao-tag">✓ Professor confirmou</span>}
                        </div>
                        <div className="validacao-acoes">
                          <span className={`status-badge ${p.status}`}>{p.status}</span>
                          {p.status === 'pendente' && (
                            <>
                              <button className="btn-confirmar" onClick={() => onAceitar(p.id)}>✓ Aceitar</button>
                              <button className="btn-rejeitar" onClick={() => { setMotivoId(p.id); setMotivo(''); }}>✕ Recusar</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {meusPedidos.length === 0 && <p className="empty-text">Não tens coachings pedidos.</p>}
            {motivoId && (
              <div className="disp-modal-overlay" onClick={() => setMotivoId(null)}>
                <div className="disp-modal" onClick={e => e.stopPropagation()}>
                  <h3>Motivo de Recusa</h3>
                  <p>Podes indicar o motivo — será visível ao encarregado.</p>
                  <textarea className="motivo-textarea"
                    placeholder="Ex: Não estou disponível nesse horário..."
                    value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} />
                  <div className="disp-modal-acoes">
                    <button onClick={() => setMotivoId(null)} className="btn-cancelar">Cancelar</button>
                    <button onClick={() => { onRecusar(motivoId, motivo); setMotivoId(null); setMotivo(''); }} className="btn-rejeitar">Recusar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {tabAtiva === 'horario' && (
          <Disponibilidade pedidos={pedidos.filter(p => p.professor === utilizador.nome)} modoProfessor={true} />
        )}
      </main>
    </div>
  );
}

function App() {
  const [utilizador, setUtilizador] = useState(null);
  const [paginaAtiva, setPaginaAtiva] = useState('dashboard');
  const [filtroValidacao, setFiltroValidacao] = useState('aceite');

  const [pedidos, setPedidos] = useState(() => {
    const guardados = localStorage.getItem('pedidos');
    return guardados ? JSON.parse(guardados) : pedidosIniciais;
  });

  useEffect(() => {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
  }, [pedidos]);

  function handleLogin(u) { setUtilizador(u); }
  function handleSair() { setUtilizador(null); setPaginaAtiva('dashboard'); }

  function navegar(pagina, filtro = 'aceite') {
    setPaginaAtiva(pagina);
    setFiltroValidacao(filtro);
  }

  function adicionarPedido(novoPedido) {
    setPedidos(prev => [...prev, { ...novoPedido, id: prev.length + 1, status: 'pendente' }]);
  }

  function aceitarPedido(id) {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'aceite' } : p));
  }

  function recusarPedido(id, motivo = '') {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'recusado', motivo } : p));
  }

  function confirmarPedido(id) {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'confirmado' } : p));
  }

  function rejeitarPedido(id, motivo = '') {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'rejeitado', motivo } : p));
  }

  function cancelarPedido(id) {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'cancelado' } : p));
  }

  function confirmarRealizacao(id, quem) {
    setPedidos(prev => prev.map(p => {
      if (p.id !== id) return p;
      const atualizado = {
        ...p,
        eeConfirmou:   quem === 'ee'       ? true : p.eeConfirmou,
        profConfirmou: quem === 'professor' ? true : p.profConfirmou,
      };
      if (atualizado.eeConfirmou && atualizado.profConfirmou) {
        atualizado.status = 'realizado_pendente';
      }
      return atualizado;
    }));
  }

  function validarRealizacao(id) {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'validado' } : p));
  }

  const pendentes = pedidos.filter(p => p.status === 'aceite').length;
  const paraValidarRealizacao = pedidos.filter(p => p.status === 'realizado_pendente').length;

  const navItems = [
    { id: 'dashboard',       label: 'Dashboard',       icone: '⊞' },
    { id: 'coachings',       label: 'Coachings',       icone: '◎' },
    { id: 'validacao',       label: 'Validação',       icone: '✓' },
    { id: 'historico',       label: 'Histórico',       icone: '🕘' },
    { id: 'inventario',      label: 'Inventário',      icone: '▤' },
    { id: 'disponibilidade', label: 'Disponibilidade', icone: '◷' },
  ];

  if (!utilizador) return <Login onLogin={handleLogin} />;
  if (utilizador.perfil === 'ee') return (
    <VistaEE utilizador={utilizador} onSair={handleSair} pedidos={pedidos}
      onAdicionarPedido={adicionarPedido} onConfirmarRealizacao={confirmarRealizacao} />
  );
  if (utilizador.perfil === 'professor') return (
    <VistaProfessor utilizador={utilizador} onSair={handleSair} pedidos={pedidos}
      onAceitar={aceitarPedido} onRecusar={recusarPedido} onConfirmarRealizacao={confirmarRealizacao} />
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Ent'Artes" className="sidebar-logo-img" />
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`sidebar-btn ${paginaAtiva === item.id ? 'active' : ''}`}
              onClick={() => navegar(item.id)}>
              <span className="sidebar-icone">{item.icone}</span>
              <span>{item.label}</span>
              {item.id === 'validacao' && (pendentes + paraValidarRealizacao) > 0 && (
                <span className="nav-badge">{pendentes + paraValidarRealizacao}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{utilizador.nome[0].toUpperCase()}</div>
            <div>
              <div className="sidebar-user-nome">{utilizador.nome}</div>
              <div className="sidebar-user-role">Administrador</div>
            </div>
          </div>
          <button className="btn-sair" onClick={handleSair}>Sair</button>
        </div>
      </aside>

      <main className="main-content">
        {paginaAtiva === 'dashboard'       && <Dashboard pedidos={pedidos} onNavegar={navegar} />}
        {paginaAtiva === 'coachings'       && <Coachings pedidos={pedidos} onAdicionarPedido={adicionarPedido} professores={PROFESSORES} modalidades={MODALIDADES} />}
        {paginaAtiva === 'validacao'       && <Validacao pedidos={pedidos} onConfirmar={confirmarPedido} onRejeitar={rejeitarPedido} onCancelar={cancelarPedido} onValidarRealizacao={validarRealizacao} filtroInicial={filtroValidacao} />}
        {paginaAtiva === 'historico'       && <Historico pedidos={pedidos} />}
        {paginaAtiva === 'inventario'      && <Inventario />}
        {paginaAtiva === 'disponibilidade' && <Disponibilidade pedidos={pedidos} modoProfessor={false} />}
      </main>
    </div>
  );
}

export default App;