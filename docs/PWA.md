# CityLine PWA

## Implementado

- Manifest nativo do Next em `apps/frontend/app/manifest.ts`.
- Nome, short name, cores, `display: standalone`, `start_url`, `scope` e icones 192/512/maskable.
- Registro client-side do service worker em `apps/frontend/components/pwa-service-worker.tsx`.
- Service worker estatico em `apps/frontend/public/sw.js`.
- Pagina offline simples em `apps/frontend/public/offline.html`.
- Cache seguro para assets estaticos do Next, imagens, fontes, scripts, estilos e icones.
- Navegacao usa rede primeiro e cai para a pagina offline quando nao houver conexao.

## Estrategia de cache

O service worker nao cacheia respostas dinamicas da API nem HTML de paginas publicas com dados reais. Isso evita mostrar horarios, linhas ou rotas desatualizadas como se fossem atuais.

Nesta primeira base, o objetivo e permitir instalacao no desktop/mobile e melhorar carregamento de assets estaticos. A experiencia offline completa ainda nao esta habilitada.

## Fica para depois

- Pagina offline integrada ao layout do app.
- Cache versionado de consultas realmente seguras.
- Indicador visual de conexao.
- Testes especificos de PWA.
- Icones PNG adicionais caso algum alvo mobile exija formato raster.
- Estrategia offline parcial para ultimas consultas quando houver regra de validade dos dados.
