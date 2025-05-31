import { useEffect, useState } from 'react';
import './App.css';
import { Ementa } from './lib/types';
import { buscarEmentas, parseEmentas } from './lib/ementasUtils';

function App() {
  const [ementas, setEmentas] = useState<Ementa[]>([]);
  const [searchTerms, setSearchTerms] = useState('');
  const [searchResults, setSearchResults] = useState<Ementa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEmentas, setTotalEmentas] = useState(0);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Busca de Ementas</h1>
        <p className="text-gray-600">
          {isLoading 
            ? "Carregando ementas..." 
            : error 
              ? "Erro ao carregar ementas" 
              : `${totalEmentas} ementas disponíveis para busca`}
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
            placeholder="Digite os termos de busca separados por vírgula"
            className="flex-grow p-2 border rounded"
            disabled={isLoading || !!error}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            disabled={isLoading || !!error}
          >
            Buscar
          </button>
        </form>
      </div>

      {searchResults.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resultados da Busca ({searchResults.length})</h2>
          <div className="space-y-6">
            {searchResults.map((ementa, index) => (
              <div key={index} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Processo: {ementa.numeroProcesso}</h3>
                {ementa.dataJulgamento && (
                  <p className="text-sm text-gray-600">Data de Julgamento: {ementa.dataJulgamento}</p>
                )}
                {ementa.dataPublicacao && (
                  <p className="text-sm text-gray-600">Data de Publicação: {ementa.dataPublicacao}</p>
                )}
                <div className="mt-2">
                  <p className="whitespace-pre-line">{ementa.ementaTexto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchTerms.trim() !== '' && !isLoading ? (
        <div className="text-center py-8">
          <p>Nenhuma ementa encontrada para os termos informados.</p>
        </div>
      ) : null}
    </div>
  );
}

export default App;
