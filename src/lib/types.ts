export interface Ementa {
  numeroProcesso: string;
  ementaTexto: string;
  dataJulgamento?: string | null;
  dataPublicacao?: string | null;
}

export interface EmentasStorage {
  ementas: Ementa[];
  lastUpdated: string;
}
