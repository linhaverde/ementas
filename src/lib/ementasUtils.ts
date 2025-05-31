import { Ementa } from "./types";

/**
 * Processa o conteúdo do arquivo de ementas e extrai as informações estruturadas
 * 
 * @param content Conteúdo do arquivo de texto com as ementas
 * @returns Array de objetos Ementa
 */
export function parseEmentas(content: string): Ementa[] {
  const ementas: Ementa[] = [];
  
  // Divide o conteúdo em blocos usando "## Processo:" como delimitador
  // Ignora o primeiro elemento se estiver vazio (caso o arquivo comece com o delimitador)
  const blocos = content.split(/\n## Processo:/);
  const blocosValidos = blocos[0].trim() === '' ? blocos.slice(1) : blocos;
  
  for (let i = 0; i < blocosValidos.length; i++) {
    let bloco = blocosValidos[i];
    
    // Se não for o primeiro bloco, adiciona o delimitador de volta para consistência
    if (i > 0 || blocos[0].trim() === '') {
      bloco = "## Processo:" + bloco;
    }
    
    // Extrai o número do processo
    const numeroProcessoMatch = bloco.match(/## Processo:\s*([^\n]*)/);
    const numeroProcesso = numeroProcessoMatch ? numeroProcessoMatch[1].trim() : "Processo Desconhecido";
    
    // Extrai o texto da ementa
    const ementaMatch = bloco.match(/\*\*Ementa:\*\*\s*([\s\S]*?)(?=\n\*\*|\n## Processo:|$)/i);
    const ementaTexto = ementaMatch ? ementaMatch[1].trim() : "";
    
    // Extrai a data de julgamento (opcional)
    const dataJulgamentoMatch = bloco.match(/\*\*Data de Julgamento:\*\*\s*([^\n]*)/i);
    const dataJulgamento = dataJulgamentoMatch ? dataJulgamentoMatch[1].trim() : null;
    
    // Extrai a data de publicação (opcional)
    const dataPublicacaoMatch = bloco.match(/\*\*Data de Publicação da Súmula:\*\*\s*([^\n]*)/i);
    const dataPublicacao = dataPublicacaoMatch ? dataPublicacaoMatch[1].trim() : null;
    
    // Só adiciona se tiver texto de ementa
    if (ementaTexto) {
      ementas.push({
        numeroProcesso,
        ementaTexto,
        dataJulgamento,
        dataPublicacao
      });
    }
  }
  
  return ementas;
}

/**
 * Busca ementas que contenham todos os termos especificados
 * 
 * @param ementas Array de ementas para buscar
 * @param termos Array de termos de busca
 * @returns Array de ementas que contêm todos os termos
 */
export function buscarEmentas(ementas: Ementa[], termos: string[]): Ementa[] {
  // Se não houver termos ou ementas, retorna array vazio
  if (!termos.length || !ementas.length) {
    return [];
  }
  
  // Converte termos para minúsculas para busca case-insensitive
  const termosLower = termos.map(termo => termo.toLowerCase().trim()).filter(termo => termo);
  
  // Se não houver termos válidos após processamento, retorna array vazio
  if (!termosLower.length) {
    return [];
  }
  
  // Filtra ementas que contêm todos os termos
  return ementas.filter(ementa => {
    const ementaTextLower = ementa.ementaTexto.toLowerCase();
    // Verifica se TODOS os termos estão presentes no texto da ementa
    return termosLower.every(termo => ementaTextLower.includes(termo));
  });
}

/**
 * Salva as ementas no localStorage
 * 
 * @param ementas Array de ementas para salvar
 */
export function saveEmentasToLocalStorage(ementas: Ementa[]): void {
  const storage = {
    ementas,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('ementasData', JSON.stringify(storage));
}

/**
 * Carrega as ementas do localStorage
 * 
 * @returns Array de ementas ou array vazio se não houver dados
 */
export function loadEmentasFromLocalStorage(): Ementa[] {
  const storageData = localStorage.getItem('ementasData');
  
  if (!storageData) {
    return [];
  }
  
  try {
    const parsed = JSON.parse(storageData);
    return Array.isArray(parsed.ementas) ? parsed.ementas : [];
  } catch (error) {
    console.error('Erro ao carregar ementas do localStorage:', error);
    return [];
  }
}

/**
 * Retorna a data da última atualização das ementas
 * 
 * @returns String com a data formatada ou null se não houver dados
 */
export function getLastUpdated(): string | null {
  const storageData = localStorage.getItem('ementasData');
  
  if (!storageData) {
    return null;
  }
  
  try {
    const parsed = JSON.parse(storageData);
    if (parsed.lastUpdated) {
      const date = new Date(parsed.lastUpdated);
      return date.toLocaleString();
    }
    return null;
  } catch (error) {
    return null;
  }
}
