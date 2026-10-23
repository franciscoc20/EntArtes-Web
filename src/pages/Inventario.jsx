import { useState, useEffect } from 'react';

const pecasIniciais = [
  { id: 1, nome: 'Tutu branco clássico',     tipo: 'figurino',  espetaculo: 'Gala 2023',  tamanho: 'S',     estado: 'bom',      disponivel: true },
  { id: 2, nome: 'Coroa de bailarina',        tipo: 'acessorio', espetaculo: 'Gala 2023',  tamanho: 'Único', estado: 'bom',      disponivel: true },
  { id: 3, nome: 'Cenário floresta',          tipo: 'cenario',   espetaculo: 'Natal 2022', tamanho: 'Único', estado: 'usado',    disponivel: false },
  { id: 4, nome: 'Leotard preto jazz',        tipo: 'figurino',  espetaculo: 'Showcase',   tamanho: 'M',     estado: 'bom',      disponivel: true },
  { id: 5, nome: 'Chapéu flamenco',           tipo: 'acessorio', espetaculo: 'Gala 2022',  tamanho: 'Único', estado: 'bom',      disponivel: false },
  { id: 6, nome: 'Vestido flamenco vermelho', tipo: 'figurino',  espetaculo: 'Gala 2022',  tamanho: 'L',     estado: 'reparacao', disponivel: false },
];

function Inventario() {
  const [pecas, setPecas] = useState(() => {
    const guardadas = localStorage.getItem('pecas');
    return guardadas ? JSON.parse(guardadas) : pecasIniciais;
  });

  useEffect(() => {
    localStorage.setItem('pecas', JSON.stringify(pecas));
  }, [pecas]);

  const [pesquisa, setPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroDisp, setFiltroDisp] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novaPeca, setNovaPeca] = useState({
    nome: '', tipo: 'figurino', espetaculo: '', tamanho: 'Único', estado: 'bom',
  });

  const pecasFiltradas = pecas.filter(p => {
    const matchPesquisa = p.nome.toLowerCase().includes(pesquisa.toLowerCase());
    const matchTipo     = filtroTipo === '' || p.tipo === filtroTipo;
    const matchDisp     = filtroDisp === '' 
      || (filtroDisp === 'disponivel' && p.disponivel) 
      || (filtroDisp === 'indisponivel' && !p.disponivel);
    return matchPesquisa && matchTipo && matchDisp;
  });

  function handleChange(e) {
    setNovaPeca({ ...novaPeca, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!novaPeca.nome) {
      alert('O nome da peça é obrigatório!');
      return;
    }
    const peca = { id: Date.now(), ...novaPeca, disponivel: true };
    setPecas([...pecas, peca]);
    setNovaPeca({ nome: '', tipo: 'figurino', espetaculo: '', tamanho: 'Único', estado: 'bom' });
    setMostrarForm(false);
  }

  function toggleDisponivel(id) {
    setPecas(pecas.map(p => p.id === id ? { ...p, disponivel: !p.disponivel } : p));
  }

  function eliminarPeca(id) {
    if (!window.confirm('Tens a certeza que queres eliminar esta peça?')) return;
    setPecas(pecas.filter(p => p.id !== id));
  }

  const totalDisponiveis = pecas.filter(p => p.disponivel).length;

  return (
    <div>
      <div className="page-header">
        <h1>Inventário</h1>
        <p>Figurinos, acessórios e cenários — {pecas.length} peças · {totalDisponiveis} disponíveis para alugar</p>
      </div>

      <div className="inventario-controlos">
        <input
          className="inventario-pesquisa"
          type="text"
          placeholder="Pesquisar por nome..."
          value={pesquisa}
          onChange={e => setPesquisa(e.target.value)}
        />
        <select
          className="inventario-filtro"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="figurino">Figurino</option>
          <option value="acessorio">Acessório</option>
          <option value="cenario">Cenário</option>
        </select>
        <select
          className="inventario-filtro"
          value={filtroDisp}
          onChange={e => setFiltroDisp(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="disponivel">Disponíveis para alugar</option>
          <option value="indisponivel">Indisponíveis</option>
        </select>
        <button
          className="btn-adicionar"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Adicionar Peça'}
        </button>
      </div>

      {mostrarForm && (
        <form className="inventario-form" onSubmit={handleSubmit}>
          <h3>Nova Peça</h3>
          <div className="inventario-form-grid">
            <label>Nome da Peça
              <input
                type="text"
                name="nome"
                value={novaPeca.nome}
                onChange={handleChange}
                placeholder="Ex: Tutu branco"
              />
            </label>
            <label>Tipo
              <select name="tipo" value={novaPeca.tipo} onChange={handleChange}>
                <option value="figurino">Figurino</option>
                <option value="acessorio">Acessório</option>
                <option value="cenario">Cenário</option>
              </select>
            </label>
            <label>Espetáculo
              <input
                type="text"
                name="espetaculo"
                value={novaPeca.espetaculo}
                onChange={handleChange}
                placeholder="Ex: Gala 2025"
              />
            </label>
            <label>Tamanho
              <select name="tamanho" value={novaPeca.tamanho} onChange={handleChange}>
                <option>Único</option>
                <option>XS</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
              </select>
            </label>
            <label>Estado
              <select name="estado" value={novaPeca.estado} onChange={handleChange}>
                <option value="bom">Bom estado</option>
                <option value="usado">Usado</option>
                <option value="reparacao">Precisa reparação</option>
              </select>
            </label>
          </div>
          <button type="submit" className="btn-guardar">Guardar Peça</button>
        </form>
      )}

      <div className="inventario-grid">
        {pecasFiltradas.length === 0 && (
          <p className="empty-text">Nenhuma peça encontrada.</p>
        )}
        {pecasFiltradas.map(p => (
          <div key={p.id} className={`peca-card ${p.disponivel ? 'peca-disponivel' : 'peca-indisponivel'}`}>
            <div className="peca-card-top">
              <div className="peca-emoji">
                {p.tipo === 'figurino' ? '👗' : p.tipo === 'acessorio' ? '👑' : '🎭'}
              </div>
              <span className={`disp-tag ${p.disponivel ? 'disp-sim' : 'disp-nao'}`}>
                {p.disponivel ? '✓ Disponível' : '✕ Indisponível'}
              </span>
            </div>
            <div className="peca-info">
              <strong>{p.nome}</strong>
              <span>{p.espetaculo} · Tam. {p.tamanho}</span>
            </div>
            <div className="peca-tags">
              <span className={`inv-tag ${p.tipo}`}>{p.tipo}</span>
              <span className={`inv-tag ${p.estado}`}>{p.estado}</span>
            </div>
            <div className="peca-acoes">
              <button
                className={`btn-toggle-disp ${p.disponivel ? 'btn-tornar-indisponivel' : 'btn-tornar-disponivel'}`}
                onClick={() => toggleDisponivel(p.id)}
              >
                {p.disponivel ? 'Marcar Indisponível' : 'Marcar Disponível'}
              </button>
              <button
                className="btn-eliminar-peca"
                onClick={() => eliminarPeca(p.id)}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inventario;