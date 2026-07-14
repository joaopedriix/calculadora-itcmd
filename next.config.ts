import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O rastreamento automático de arquivos da Vercel (@vercel/nft) não
  // detecta arquivos não-JS carregados dinamicamente por `playwright-core`
  // (ex.: `browsers.json`) nem o binário compactado do `@sparticuz/chromium`
  // — sem isso, a rota de importação (app/api/ufesp/importar) quebra em
  // produção com "Cannot find module '.../playwright-core/browsers.json'".
  outputFileTracingIncludes: {
    "/api/ufesp/importar": [
      "./node_modules/playwright-core/**",
      "./node_modules/@sparticuz/chromium/**",
    ],
  },
};

export default nextConfig;
