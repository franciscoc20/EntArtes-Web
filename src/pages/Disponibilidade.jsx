import { useState } from 'react';

export const ESTUDIOS = [
  'Estúdio 1', 'Estúdio 2', 'Estúdio 3', 'Estúdio 4',
  'Estúdio 5', 'Estúdio 6', 'Estúdio 7', 'Estúdio 8',
];

export const HORAS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

export const ocupacaoPorData = {};

export function getSlotsOcupados(horaInicio, duracao) {
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

function getOcupacaoParaData(data) {
  if (ocupacaoPorData[data]) return ocupacaoPorData[data];
  const ocupacaoVazia = {};
  ESTUDIOS.forEach(est => { ocupacaoVazia[est] = {}; });
  return ocupacaoVazia;
}

function Disponibilidade({ pedidos = [], modoProfessor = false }) {
  const [dataAtiva, setDataAtiva] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [ocupacaoExtra, setOcupacaoExtra] = useState({});
  const [selecionado, setSelecionado] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [detalhe, setDetalhe] = useState(null);

  const ocupacaoBase = getOcupacaoParaData(dataAtiva);

  const ocupacaoCoachings = {};
  ESTUDIOS.forEach(est => { ocupacaoCoachings[est] = {}; });

  pedidos
    .filter(p => p.data === dataAtiva && (p.status === 'confirmado' || p.status === 'aceite') && p.estudio && p.hora)
    .forEach(p => {
      if (!ocupacaoCoachings[p.estudio]) return;
      const slots = getSlotsOcupados(p.hora, p.duracao);
      const nomeProf = p.professor.split(' ')[0];
      const nomeAluno = p.aluno.split(' ')[0];
      const texto = modoProfessor ? nomeAluno : nomeProf;
      slots.forEach((slot, i) => {
        ocupacaoCoachings[p.estudio][slot] = {
          texto,
          isInicio: i === 0,
          isFim: i === slots.length - 1,
          pedido: p,
        };
      });
    });

  const ocupacao = ESTUDIOS.reduce((acc, est) => {
    acc[est] = {
      ...ocupacaoBase[est],
      ...ocupacaoCoachings[est],
      ...(ocupacaoExtra[dataAtiva]?.[est] || {}),
    };
    return acc;
  }, {});

  function getCelula(estudio, hora) {
    return ocupacao[estudio]?.[hora] ?? null;
  }

  function handleCelulaClick(estudio, hora) {
    const info = getCelula(estudio, hora);
    if (info && typeof info === 'object') {
      setDetalhe({ estudio, hora, ...info });
      return;
    }
    if (info) return;
    setSelecionado({ estudio, hora });
    setDescricao('');
  }

  function handleMarcar() {
    if (!descricao.trim()) { alert('Escreve uma descrição!'); return; }
    setOcupacaoExtra(prev => ({
      ...prev,
      [dataAtiva]: {
        ...prev[dataAtiva],
        [selecionado.estudio]: {
          ...prev[dataAtiva]?.[selecionado.estudio],
          [selecionado.hora]: { texto: descricao, isInicio: true, isFim: true },
        },
      },
    }));
    setSelecionado(null);
    setDescricao('');
  }

  const totalOcupados = ESTUDIOS.reduce((acc, est) => {
    return acc + Object.keys(ocupacao[est] || {}).length;
  }, 0);

  const totalLivres = ESTUDIOS.length * HORAS.length - totalOcupados;

  return (
    <div>
      <div className="page-header">
        <h1>Disponibilidade</h1>
        <p>Ocupação dos estúdios por hora</p>
      </div>

      <div className="disp-topo">
        <input
          type="date"
          value={dataAtiva}
          onChange={e => setDataAtiva(e.target.value)}
          className="disp-data-input"
        />
        <div className="disp-resumo">
          <span className="disp-resumo-item">🟢 {totalLivres} slots livres</span>
          <span className="disp-resumo-item">🔴 {totalOcupados} ocupados</span>
        </div>
      </div>

      <div className="disp-wrapper">
        <table className="disp-tabela">
          <thead>
            <tr>
              <th className="disp-th-hora">Hora</th>
              {ESTUDIOS.map(est => (
                <th key={est} className="disp-th">{est}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map(hora => (
              <tr key={hora}>
                <td className="disp-hora">{hora}</td>
                {ESTUDIOS.map(est => {
                  const info = getCelula(est, hora);
                  const isSelected = selecionado?.estudio === est && selecionado?.hora === hora;
                  const isCoaching = info && typeof info === 'object';

                  let celulaClass = 'disp-celula ';
                  if (!info) celulaClass += 'livre';
                  else if (isCoaching) {
                    celulaClass += 'coaching-bloco';
                    if (info.isInicio && info.isFim) celulaClass += ' coaching-unico';
                    else if (info.isInicio) celulaClass += ' coaching-inicio';
                    else if (info.isFim) celulaClass += ' coaching-fim';
                    else celulaClass += ' coaching-meio';
                  } else {
                    celulaClass += 'ocupada';
                  }

                  if (isSelected) celulaClass += ' selecionada';

                  return (
                    <td
                      key={est}
                      className={celulaClass}
                      onClick={() => handleCelulaClick(est, hora)}
                      title={info?.texto || info || 'Livre — clica para marcar'}
                    >
                      {info ? (
                        isCoaching && info.isInicio ? (
                          <span className="disp-aula">{info.texto}</span>
                        ) : isCoaching ? null : (
                          <span className="disp-aula">{info}</span>
                        )
                      ) : (
                        <span className="disp-livre">livre</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selecionado && (
        <div className="disp-modal-overlay" onClick={() => setSelecionado(null)}>
          <div className="disp-modal" onClick={e => e.stopPropagation()}>
            <h3>Marcar Slot</h3>
            <p>{selecionado.estudio} · {selecionado.hora}</p>
            <input
              type="text"
              placeholder="Ex: Coaching - Natália Azevedo"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="disp-modal-input"
            />
            <div className="disp-modal-acoes">
              <button onClick={() => setSelecionado(null)} className="btn-cancelar">Cancelar</button>
              <button onClick={handleMarcar} className="btn-marcar">Marcar</button>
            </div>
          </div>
        </div>
      )}

      {detalhe && (
        <div className="disp-modal-overlay" onClick={() => setDetalhe(null)}>
          <div className="disp-modal" onClick={e => e.stopPropagation()}>
            <h3>Detalhe do Coaching</h3>
            <div className="detalhe-grid">
              <div className="detalhe-item">
                <span className="detalhe-label">Aluno</span>
                <span className="detalhe-valor">{detalhe.pedido?.aluno || '—'}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">Professor</span>
                <span className="detalhe-valor">{detalhe.pedido?.professor || '—'}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">Modalidade</span>
                <span className="detalhe-valor">{detalhe.pedido?.modalidade || '—'}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">Estúdio</span>
                <span className="detalhe-valor">{detalhe.estudio}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">Hora</span>
                <span className="detalhe-valor">{detalhe.pedido?.hora || detalhe.hora}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">Duração</span>
                <span className="detalhe-valor">{detalhe.pedido?.duracao || '—'} min</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">Formato</span>
                <span className="detalhe-valor">{detalhe.pedido?.formato || '—'}</span>
              </div>
              <div className="detalhe-item">
                <span className="detalhe-label">Valor</span>
                <span className="detalhe-valor">{detalhe.pedido?.valor ? `${detalhe.pedido.valor}€` : '—'}</span>
              </div>
            </div>
            <div className="disp-modal-acoes">
              <button onClick={() => setDetalhe(null)} className="btn-marcar">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Disponibilidade;