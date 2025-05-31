# Ementas App - Aplicação de Busca de Ementas

Este projeto é uma aplicação React que permite buscar ementas jurídicas a partir de um arquivo de texto pré-carregado.

## Características

- Carregamento automático do arquivo de ementas ao iniciar a aplicação
- Interface de busca por termos (separados por vírgula)
- Exibição dos resultados com informações detalhadas de cada ementa
- Design responsivo para desktop e dispositivos móveis

## Estrutura do Projeto

```
ementas-app/
├── public/
│   ├── data/
│   │   └── ementas.txt       # Arquivo de ementas pré-carregado
│   └── index.html            # HTML principal
├── src/
│   ├── lib/
│   │   ├── types.ts          # Definições de tipos
│   │   └── ementasUtils.ts   # Funções utilitárias (parser, busca)
│   ├── App.tsx               # Componente principal
│   └── main.tsx              # Ponto de entrada
└── package.json              # Dependências
```

## Como Usar

1. A aplicação carrega automaticamente o arquivo de ementas ao iniciar
2. Digite os termos de busca na caixa de texto, separados por vírgula
3. Clique em "Buscar" para encontrar ementas que contenham todos os termos informados
4. Os resultados serão exibidos abaixo, com todas as informações de cada ementa

## Atualização das Ementas

Para atualizar o arquivo de ementas:

1. Edite o arquivo `public/data/ementas.txt` no repositório
2. Faça commit das alterações para o GitHub
3. A Vercel detectará automaticamente as alterações e fará um novo deploy

## Desenvolvimento Local

Para executar o projeto localmente:

```bash
# Navegar até o diretório do projeto
cd ementas-app

# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm run dev
```

## Deploy na Vercel

Este projeto está configurado para ser facilmente implantado na Vercel:

1. Conecte seu repositório GitHub à Vercel
2. A Vercel detectará automaticamente que é um projeto React
3. Não são necessárias configurações adicionais
4. Cada push para o repositório resultará em um novo deploy automático

## Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- Vite
