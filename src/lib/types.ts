export interface Ementa {
  numeroProcesso: string;
  ementaTexto: string;
  dataJulgamento?: string | null;
  dataPublicacao?: string | null;
  desembargador?: string | null;
}

export interface EmentasStorage {
  ementas: Ementa[];
  lastUpdated: string;
}

export interface HighlightOptions {
  terms: string[];
  highlightClass: string;
}
