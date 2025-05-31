import { Ementa, HighlightOptions } from "./types";

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
    
    // Extrai o nome do desembargador/relator (opcional)
    // Verifica primeiro o padrão "Relator(a):" e depois "Desembargador:"
    let desembargador = null;
    const relatorMatch = bloco.match(/\*\*Relator\(a\):\*\*\s*([^\n]*)/i);
    if (relatorMatch) {
      desembargador = relatorMatch[1].trim();
    } else {
      const desembargadorMatch = bloco.match(/\*\*Desembargador:\*\*\s*([^\n]*)/i);
      if (desembargadorMatch) {
        desembargador = desembargadorMatch[1].trim();
      }
    }
    
    // Só adiciona se tiver texto de ementa
    if (ementaTexto) {
      ementas.push({
        numeroProcesso,
        ementaTexto,
        dataJulgamento,
        dataPublicacao,
        desembargador
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
 * Destaca os termos de busca no texto
 * 
 * @param text Texto original
 * @param options Opções de destaque (termos e classe CSS)
 * @returns Texto com os termos destacados usando spans HTML
 */
export function highlightTerms(text: string, options: HighlightOptions): string {
  if (!options.terms.length) return text;
  
  let result = text;
  
  // Cria uma expressão regular que busca todos os termos
  // Usa captura para preservar o case original
  const termPattern = options.terms
    .map(term => term.trim())
    .filter(term => term.length > 0)
    .map(term => escapeRegExp(term))
    .join('|');
  
  if (!termPattern) return text;
  
  const regex = new RegExp(`(${termPattern})`, 'gi');
  
  // Substitui todas as ocorrências com spans destacados
  result = result.replace(regex, `<span class="${options.highlightClass}">$1</span>`);
  
  return result;
}

/**
 * Escapa caracteres especiais para uso em expressão regular
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Abre o site do TJMG com o número do processo preenchido
 * 
 * @param numeroProcesso Número do processo a ser preenchido
 */
export function openTJMGSite(numeroProcesso: string): void {
  // Remove caracteres não numéricos para garantir compatibilidade
  const processoCleaned = numeroProcesso.replace(/\D/g, '');
  
  // Abre o site em uma nova aba
  window.open(`https://www5.tjmg.jus.br/jurisprudencia/formEspelhoAcordao.do?numeroRegistro=${processoCleaned}`, '_blank');
}

/**
 * Copia o texto para a área de transferência
 * 
 * @param text Texto a ser copiado
 * @returns Promise que resolve para true se copiado com sucesso
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Falha ao copiar texto:', err);
    return false;
  }
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
