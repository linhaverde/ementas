import { useEffect, useState } from 'react';
import './App.css';
import { Ementa } from './lib/types';
import { buscarEmentas, copyToClipboard, highlightTerms, openTJMGSite, parseEmentas } from './lib/ementasUtils';

function App() {
  const [ementas, setEmentas] = useState<Ementa[]>([]);
  const [searchTerms, setSearchTerms] = useState('');
  const [searchResults, setSearchResults] = useState<Ementa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEmentas, setTotalEmentas] = useState(0);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  // Carrega o arquivo de ementas automaticamente ao iniciar
  useEffect(() => {
    const fetchEmentas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/ementas.txt');
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar o arquivo de ementas: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        const parsedEmentas = parseEmentas(text);
        setEmentas(parsedEmentas);
        setTotalEmentas(parsedEmentas.length);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar ementas:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar ementas');
        setIsLoading(false);
      }
    };

    fetchEmentas();
  }, []);

  // Função para realizar a busca
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerms.trim()) {
      setSearchResults([]);
      return;
    }
    
    const terms = searchTerms
      .split(',')
      .map(term => term.trim())
      .filter(term => term.length > 0);
    
    const results = buscarEmentas(ementas, terms);
    setSearchResults(results);
  };

  // Função para copiar o número do processo e perguntar se deseja abrir o site do TJMG
  const handleProcessoClick = async (numeroProcesso: string) => {
    const success = await copyToClipboard(numeroProcesso);
    
    if (success) {
      setCopyMessage(`Número do processo ${numeroProcesso} copiado!`);
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => {
        setCopyMessage(null);
      }, 3000);
      
      // Pergunta se deseja abrir o site do TJMG
      if (confirm(`Deseja abrir o site do TJMG com o processo ${numeroProcesso}?`)) {
        openTJMGSite(numeroProcesso);
      }
    }
  };

  // Função para destacar os termos pesquisados no texto
  const highlightSearchTerms = (text: string) => {
    if (!searchTerms.trim()) return text;
    
    const terms = searchTerms
      .split(',')
      .map(term => term.trim())
      .filter(term => term.length > 0);
    
    return highlightTerms(text, { terms, highlightClass: 'highlight-term' });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Busca de Ementas</h1>
        <p className="status-text">
          {isLoading 
            ? "Carregando ementas..." 
            : error 
              ? "Erro ao carregar ementas" 
              : `${totalEmentas} ementas disponíveis para busca`}
        </p>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
            placeholder="Digite os termos de busca separados por vírgula"
            className="search-input"
            disabled={isLoading || !!error}
          />
          <button
            type="submit"
            className="search-button"
            disabled={isLoading || !!error}
          >
            Buscar
          </button>
        </form>
      </div>

      {copyMessage && (
        <div className="copy-message">
          <p>{copyMessage}</p>
        </div>
      )}

      {searchResults.length > 0 ? (
        <div className="results-container">
          <h2 className="results-title">Resultados da Busca ({searchResults.length})</h2>
          <div className="results-list">
            {searchResults.map((ementa, index) => (
              <div key={index} className="ementa-card">
                <h3 className="processo-title">
                  <button 
                    className="processo-button"
                    onClick={() => handleProcessoClick(ementa.numeroProcesso)}
                    title="Clique para copiar e abrir no TJMG"
                  >
                    Processo: {ementa.numeroProcesso}
                  </button>
                </h3>
                
                {ementa.desembargador && (
                  <p className="desembargador-info">Relator(a): {ementa.desembargador}</p>
                )}
                
                {ementa.dataJulgamento && (
                  <p className="date-info">Data de Julgamento: {ementa.dataJulgamento}</p>
                )}
                
                {ementa.dataPublicacao && (
                  <p className="date-info">Data de Publicação: {ementa.dataPublicacao}</p>
                )}
                
                <div className="ementa-text">
                  <p dangerouslySetInnerHTML={{ __html: highlightSearchTerms(ementa.ementaTexto) }}></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchTerms.trim() !== '' && !isLoading ? (
        <div className="no-results">
          <p>Nenhuma ementa encontrada para os termos informados.</p>
        </div>
      ) : null}
    </div>
  );
}

export default App;
