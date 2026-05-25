# CityLine - Product Vision and Consolidation Roadmap

## Product Goal

CityLine is a public transport consultation platform for Sao Francisco do Sul and the surrounding region, focused on urban bus lines, intercity lines, and future water transport routes.

The product must help users answer practical questions quickly:

- Which line should I take?
- Where is the nearest stop?
- What time is the next departure?
- What route does it follow?
- Which stops are served?
- Is there a water transport alternative?

CityLine must work as a public website backed by real data from the backend and database. It should also evolve into an installable PWA with a solid desktop and mobile experience.

Future product paths may include premium features, transport card balance, online recharge, ticket purchase, personalized alerts, AI support, and richer offline use.

## Current State

The project already has a mature technical base:

- TypeScript monorepo.
- Next.js frontend.
- Express backend.
- Shared package with domain types and helpers.
- Prisma with SQLite for development.
- Database with lines, stops, route paths, fares, and schedules.
- Data ingestion pipeline.
- Map with routes and stops.
- Basic JWT authentication.
- `/demo` page consuming real API data.
- Existing automated tests for backend, frontend helpers, and ingestion.
- GitHub Actions pipeline with type-check, lint, tests, build, and protected deploy flow.

The main product gap is that the backend and data layer are more mature than the public site experience.

## Current Problem

There is still a split between:

- `/demo`, which uses real API data.
- `/`, `/linhas`, `/mapa`, and `/horarios`, which still use static data from `apps/frontend/data/cityline.ts`.

This makes the product feel divided:

- one part demonstrates the real system;
- another part behaves like a visual presentation.

The next stage must consolidate the public pages around the real backend data.

## Target Monorepo Shape

```text
Cityline-main/
├─ apps/
│  ├─ backend/
│  └─ frontend/
├─ packages/
│  └─ shared/
├─ docs/
├─ scripts/
├─ package.json
└─ .env
```

The root should remain responsible for orchestration, documentation, and workspace scripts. Active application code should live in `apps/*` and `packages/shared`.

Old MVP leftovers in the repository root should be removed or clearly isolated to avoid confusion.

## Target Frontend Shape

```text
apps/frontend/
├─ app/
│  ├─ page.tsx
│  ├─ linhas/
│  ├─ horarios/
│  ├─ mapa/
│  ├─ hidroviario/
│  ├─ login/
│  ├─ cadastro/
│  ├─ recuperar-senha/
│  └─ premium/
├─ features/
│  ├─ transport/
│  ├─ map/
│  ├─ auth/
│  ├─ favorites/
│  ├─ weather/
│  ├─ premium/
│  └─ i18n/
├─ components/
│  ├─ ui/
│  ├─ layout/
│  └─ shared/
├─ services/
│  ├─ api/
│  ├─ transport/
│  ├─ auth/
│  └─ weather/
├─ hooks/
├─ lib/
└─ types/
```

Responsibilities:

- `features/transport`: lines, schedules, stops, routes, and search.
- `features/map`: map, markers, route paths, and geolocation.
- `features/auth`: login, registration, session, and password recovery.
- `features/favorites`: favorite lines and saved locations.
- `features/weather`: weather summary for the home page.
- `features/premium`: planned advanced capabilities.
- `features/i18n`: Portuguese, English, and Spanish support.
- `components/ui`: reusable buttons, cards, inputs, modals, and primitives.
- `services`: backend and external API communication.

## Public Product

The public version must work without login.

Core features:

- Home with quick search.
- Search by line, neighborhood, stop, or destination.
- Line listing.
- Line detail page.
- Schedules by line and direction.
- Route map.
- Stop list.
- Water transport section, even if initially shallow.
- Weather summary on the home page.
- Simple interface for older users, tourists, locals, and foreigners.
- Future translation to English and Spanish.

The public goal is simple: allow anyone to consult transport information quickly and clearly.

## Logged-In User

Logged-in users should gain personalized features:

- Account creation.
- Login.
- Password recovery.
- Favorite lines.
- Saved locations such as home, work, and school.
- Search history.
- Suggestions based on location.
- Future premium resources.

## Future Premium Area

Premium should start as a planned area, not as a fake active feature.

Possible future features:

- Automatic nearest-stop suggestion.
- Next viable departure based on user location.
- "Leave in X minutes" alert.
- Online ticket purchase.
- Transport card recharge.
- Card balance query.
- Digital ticket.
- Personalized alerts.
- AI support.
- Installable PWA experience.

Payment and ticketing depend on real integrations with transport companies, payment providers, or fare systems. In the MVP, they must be presented as future capabilities.

## Main Public Flow

1. User enters the site.
2. User sees the question: "Para onde voce vai hoje?"
3. User searches by line, neighborhood, stop, or destination.
4. User selects a line.
5. User selects a direction.
6. User sees next departures, route map, stops, fare, and notes.
7. User can switch between outbound and inbound directions.

## Future Premium Flow

1. User logs in.
2. User chooses a line.
3. User allows geolocation.
4. CityLine finds the nearest stop.
5. CityLine compares walking time with upcoming departures.
6. CityLine suggests best stop, viable departure, walking time, and leave-time alert.

## Home Direction

The home page should be useful before it is decorative.

Suggested blocks:

```text
Para onde voce vai hoje?
[Buscar linha, bairro, parada ou destino]

Clima em Sao Francisco do Sul
Hoje pode chover. Leve guarda-chuva.

Acesso rapido
- Ver linhas
- Ver horarios
- Ver mapa
- Hidroviario
- Minha parada mais proxima

Linhas mais buscadas
- Centro
- Enseada via Ubatuba
- Ervino
- Ferry Boat
```

Desired perception:

- simple;
- trustworthy;
- local;
- useful;
- built to solve a real pain.

## Weather

Weather can become a useful home-page differentiator.

Possible data:

- temperature;
- rain;
- feels-like temperature;
- wind;
- UV index;
- storm alerts.

Candidate providers:

- Open-Meteo, for a simple free forecast API.
- INMET, if official Brazilian data fits the product needs.

This should live in `features/weather` and `services/weather`.

## Water Transport

The water transport section should exist now, even if shallow.

First version:

- `/hidroviario` or `/ferry-boat` page.
- Clear message that data is expanding.
- Space for water routes.
- Space for schedules.
- Space for fares.
- Future map integration.

The goal is to keep the domain visible and prepare the architecture for real routes later.

## Transport Card and Online Ticketing

This is a strong product direction but not an immediate MVP feature.

First visual version:

```text
Cartao de Transporte
Em breve:
- consulte saldo;
- recarregue online;
- compre passagem digital;
- salve comprovantes;
- pague com Pix, credito ou debito.
```

It must be clearly marked as future functionality until real integrations exist.

## Accessibility and Audience

CityLine must serve:

- older users;
- tourists;
- local residents;
- people with low technical familiarity;
- people searching for someone else;
- foreign visitors.

Guidelines:

- large buttons;
- short text;
- high contrast;
- avoid excessive information density;
- icons with text;
- simple search;
- do not depend only on the map;
- clear schedule formatting;
- future English and Spanish support.

## AI Support

AI support can be introduced later as a transport guidance assistant.

Example questions:

- "Como vou da Enseada ate o Centro?"
- "Qual linha passa perto de mim?"
- "Que horas tem onibus hoje?"
- "Tem ferry agora?"
- "Qual parada fica mais perto?"

This should wait until the data is reliable enough.

## Fixed Technical Maturity Requirements

These are not optional extras:

- Automated tests for frontend, backend, and shared domain.
- CI/CD pipeline with type-check, lint, tests, and build.
- Deploy protected by the validation pipeline.
- Functional PWA for desktop and mobile.
- Correct web app manifest.
- Service Worker with safe caching strategy.
- Offline or partially offline experience for useful pages.
- Tests for the main app behavior.

## Consolidation Priorities

### Priority 1 - Real Data on Public Pages

- Identify all public pages still using mocks.
- Migrate `/linhas` to the real API.
- Migrate `/horarios` to the real API.
- Migrate `/mapa` to the real API.
- Decide whether `/demo` becomes the main product base.

### Priority 2 - Architecture Organization

- Review frontend folder structure.
- Create or adjust `features/transport`.
- Create or adjust `features/map`.
- Create `features/weather`.
- Create `features/premium`.
- Isolate or remove old root-level MVP leftovers.

### Priority 3 - Public Experience

- Home with quick search.
- Quick-access cards.
- Weather on the home page.
- Most-searched lines.
- Line detail page.
- Shallow but real water transport page.

### Priority 4 - Logged-In Area

- Login.
- Registration.
- Password recovery.
- Favorites.
- Saved locations.
- Future premium access.

## Strategic Order

CityLine should be treated as a real product with minimum technical maturity guaranteed by tests, CI/CD, and PWA preparation.

The current order is:

1. Real data.
2. Useful flow.
3. Technical organization.
4. Automated tests.
5. CI/CD.
6. PWA base.
7. Accessibility.
8. Visual refinement.
9. Premium and AI.

At this stage, CityLine does not need to look more decorative. It needs to become more trustworthy, useful, real, easy to use, and connected to real data.

