import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import type { CollectedFerryRoute, CollectedLine, NormalizedTransportDataset } from '@cityline/shared';
import { env } from '../../config/env.js';
import { ingestionService } from './ingestion.service.js';
import {
  parseCollectedManifest,
  parseNormalizedManifest,
  type CollectedManifestFile,
  type NormalizedManifestFile,
} from './ingestion-manifest.js';
import { OpenRouteServicePathProvider } from './route-path-enricher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../../');
const defaultNormalizedRoot = path.join(backendRoot, 'data', 'normalized');

type IngestionCommand = 'normalize' | 'import' | 'enrich-paths';

interface ParsedArgs {
  command: IngestionCommand;
  input: string;
  output?: string;
  provider?: 'openrouteservice';
  profile?: string;
  force?: boolean;
}

interface CityBundle {
  citySlug: string;
  lines: CollectedLine[];
  ferryRoutes: CollectedFerryRoute[];
  sourceFiles: string[];
}

const parseArgs = (argv: string[]): ParsedArgs => {
  const [command, ...rest] = argv;

  if (command !== 'normalize' && command !== 'import' && command !== 'enrich-paths') {
    throw new Error('Comando invalido. Use "normalize", "import" ou "enrich-paths".');
  }

  let input: string | undefined;
  let output: string | undefined;
  let provider: ParsedArgs['provider'];
  let profile: string | undefined;
  let force = false;

  for (let index = 0; index < rest.length; index += 1) {
    const current = rest[index];
    const next = rest[index + 1];

    if (current === '--force') {
      force = true;
      continue;
    }

    if (current === '--input' && next) {
      input = next;
      index += 1;
      continue;
    }

    if (current === '--output' && next) {
      output = next;
      index += 1;
      continue;
    }

    if (current === '--provider' && next === 'openrouteservice') {
      provider = next;
      index += 1;
      continue;
    }

    if (current === '--profile' && next) {
      profile = next;
      index += 1;
    }
  }

  if (!input) {
    throw new Error('Parametro obrigatorio ausente: --input');
  }

  return {
    command,
    input,
    output,
    provider,
    profile,
    force,
  };
};

const resolveBackendPath = (target: string) => (path.isAbsolute(target) ? target : path.resolve(backendRoot, target));

const readJson = async (filePath: string) => JSON.parse(await readFile(filePath, 'utf8')) as unknown;

const collectJsonFiles = async (targetPath: string): Promise<string[]> => {
  const targetStat = await stat(targetPath);

  if (targetStat.isFile()) {
    return targetPath.endsWith('.json') ? [targetPath] : [];
  }

  const entries = await readdir(targetPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map((entry) => collectJsonFiles(path.join(targetPath, entry.name))));
  return nestedFiles.flat();
};

const loadCollectedManifests = async (targetPath: string) => {
  const files = await collectJsonFiles(targetPath);

  if (files.length === 0) {
    throw new Error(`Nenhum manifest collected encontrado em ${targetPath}.`);
  }

  return Promise.all(
    files.map(async (filePath) => ({
      filePath,
      manifest: parseCollectedManifest(await readJson(filePath)),
    }))
  );
};

const loadNormalizedManifests = async (targetPath: string) => {
  const files = await collectJsonFiles(targetPath);

  if (files.length === 0) {
    throw new Error(`Nenhum manifest normalized encontrado em ${targetPath}.`);
  }

  return Promise.all(
    files.map(async (filePath) => ({
      filePath,
      manifest: parseNormalizedManifest(await readJson(filePath)),
    }))
  );
};

const groupCollectedByCity = (
  manifests: Array<{ filePath: string; manifest: CollectedManifestFile }>
): CityBundle[] => {
  const bundles = new Map<string, CityBundle>();

  for (const entry of manifests) {
    const { manifest } = entry;
    const current = bundles.get(manifest.citySlug) ?? {
      citySlug: manifest.citySlug,
      lines: [],
      ferryRoutes: [],
      sourceFiles: [],
    };

    current.sourceFiles.push(entry.filePath);

    if (manifest.entityType === 'line') {
      current.lines.push(manifest.data as CollectedLine);
    } else {
      current.ferryRoutes.push(manifest.data as CollectedFerryRoute);
    }

    bundles.set(manifest.citySlug, current);
  }

  return [...bundles.values()];
};

const buildNormalizedManifest = (citySlug: string, dataset: NormalizedTransportDataset): NormalizedManifestFile => ({
  manifestVersion: '1.0',
  citySlug,
  dataset,
});

const ensureDirectoryForFile = async (filePath: string) => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

const isJsonFilePath = (targetPath: string) => path.extname(targetPath).toLowerCase() === '.json';

const getDefaultNormalizedOutputFile = (citySlug: string, datasetId: string) =>
  path.join(defaultNormalizedRoot, citySlug, `${datasetId}.json`);

const writeNormalizedOutputs = async (
  bundles: Array<{ citySlug: string; manifest: NormalizedManifestFile }>,
  explicitOutput?: string
) => {
  if (bundles.length === 1) {
    const only = bundles[0];

    if (!only) {
      return [];
    }

    const filePath = explicitOutput
      ? isJsonFilePath(explicitOutput)
        ? explicitOutput
        : path.join(explicitOutput, only.citySlug, `${only.manifest.dataset.metadata.datasetId}.json`)
      : getDefaultNormalizedOutputFile(only.citySlug, only.manifest.dataset.metadata.datasetId);

    await ensureDirectoryForFile(filePath);
    await writeFile(filePath, `${JSON.stringify(only.manifest, null, 2)}\n`, 'utf8');
    return [filePath];
  }

  if (explicitOutput && isJsonFilePath(explicitOutput)) {
    throw new Error('Quando houver multiplos bundles, --output deve apontar para uma pasta.');
  }

  const outputRoot = explicitOutput ?? defaultNormalizedRoot;
  const writtenFiles: string[] = [];

  for (const bundle of bundles) {
    const filePath = path.join(outputRoot, bundle.citySlug, `${bundle.manifest.dataset.metadata.datasetId}.json`);
    await ensureDirectoryForFile(filePath);
    await writeFile(filePath, `${JSON.stringify(bundle.manifest, null, 2)}\n`, 'utf8');
    writtenFiles.push(filePath);
  }

  return writtenFiles;
};

const resolveCollectedOutputPath = (sourceFilePath: string, inputPath: string, explicitOutput?: string) => {
  if (!explicitOutput) {
    return sourceFilePath;
  }

  if (isJsonFilePath(explicitOutput)) {
    return explicitOutput;
  }

  return path.join(explicitOutput, path.relative(inputPath, sourceFilePath));
};

const writeCollectedOutputs = async (
  manifests: Array<{ filePath: string; manifest: CollectedManifestFile }>,
  inputPath: string,
  explicitOutput?: string
) => {
  if (manifests.length > 1 && explicitOutput && isJsonFilePath(explicitOutput)) {
    throw new Error('Quando houver multiplos manifests collected, --output deve apontar para uma pasta.');
  }

  const writtenFiles: string[] = [];

  for (const entry of manifests) {
    const filePath = resolveCollectedOutputPath(entry.filePath, inputPath, explicitOutput);
    await ensureDirectoryForFile(filePath);
    await writeFile(filePath, `${JSON.stringify(entry.manifest, null, 2)}\n`, 'utf8');
    writtenFiles.push(filePath);
  }

  return writtenFiles;
};

const runNormalize = async (inputPath: string, outputPath?: string) => {
  const collectedEntries = await loadCollectedManifests(inputPath);
  const cityBundles = groupCollectedByCity(collectedEntries);

  console.info(`[ingestion] Collected manifests encontrados: ${collectedEntries.length}`);

  const normalizedBundles = cityBundles.map((bundle) => {
    console.info(
      `[ingestion] Normalizando cidade "${bundle.citySlug}" com ${bundle.lines.length} linha(s) e ${bundle.ferryRoutes.length} ferry route(s).`
    );

    const dataset = ingestionService.normalizeCollected({
      lines: bundle.lines,
      ferryRoutes: bundle.ferryRoutes,
    });

    console.info(
      `[ingestion] Dataset ${dataset.metadata.datasetId}: ${dataset.transportLines.length} linha(s), ${dataset.stops.length} parada(s), ${dataset.schedules.length + dataset.ferrySchedules.length} schedule(s).`
    );

    return {
      citySlug: bundle.citySlug,
      manifest: buildNormalizedManifest(bundle.citySlug, dataset),
    };
  });

  const writtenFiles = await writeNormalizedOutputs(normalizedBundles, outputPath);

  for (const filePath of writtenFiles) {
    console.info(`[ingestion] Normalized gravado em ${filePath}`);
  }
};

const runEnrichPaths = async (inputPath: string, outputPath: string | undefined, parsed: ParsedArgs) => {
  const collectedEntries = await loadCollectedManifests(inputPath);

  if ((parsed.provider ?? 'openrouteservice') !== 'openrouteservice') {
    throw new Error('Provider de rota invalido. No momento, apenas openrouteservice esta disponivel.');
  }

  if (!env.OPENROUTESERVICE_API_KEY) {
    throw new Error('OPENROUTESERVICE_API_KEY ausente. Configure a chave no ambiente antes de rodar enrich-paths.');
  }

  const provider = new OpenRouteServicePathProvider({
    apiKey: env.OPENROUTESERVICE_API_KEY,
    baseUrl: env.OPENROUTESERVICE_BASE_URL,
    profile: parsed.profile ?? env.OPENROUTESERVICE_PROFILE,
  });

  console.info(`[ingestion] Collected manifests encontrados: ${collectedEntries.length}`);
  console.info(
    `[ingestion] Enriquecendo mapPath com provider "${parsed.provider ?? 'openrouteservice'}" no profile "${parsed.profile ?? env.OPENROUTESERVICE_PROFILE}".`
  );

  const enrichedEntries = await Promise.all(
    collectedEntries.map(async (entry) => {
      const beforeCount =
        entry.manifest.entityType === 'line'
          ? entry.manifest.data.directions.reduce((total, direction) => total + direction.mapPath.length, 0)
          : 0;

      const manifest = await ingestionService.enrichCollectedPaths(entry.manifest, {
        provider,
        force: parsed.force,
      });

      const afterCount =
        manifest.entityType === 'line'
          ? manifest.data.directions.reduce((total, direction) => total + direction.mapPath.length, 0)
          : 0;

      console.info(
        `[ingestion] ${entry.filePath}: ${beforeCount} -> ${afterCount} ponto(s) de mapPath${parsed.force ? ' (force)' : ''}.`
      );

      return {
        filePath: entry.filePath,
        manifest,
      };
    })
  );

  const writtenFiles = await writeCollectedOutputs(enrichedEntries, inputPath, outputPath);

  for (const filePath of writtenFiles) {
    console.info(`[ingestion] Collected enriquecido gravado em ${filePath}`);
  }
};

const runImport = async (inputPath: string) => {
  const normalizedEntries = await loadNormalizedManifests(inputPath);

  console.info(`[ingestion] Normalized manifests encontrados: ${normalizedEntries.length}`);

  for (const entry of normalizedEntries) {
    const result = await ingestionService.importNormalized(entry.manifest.dataset);

    console.info(`[ingestion] Importado dataset ${result.datasetId} (${entry.filePath})`);
    console.info(
      `[ingestion] Linhas importadas: ${result.counts.transportLines} (${result.created.transportLines} criada(s), ${result.updated.transportLines} atualizada(s))`
    );
    console.info(
      `[ingestion] Paradas upsertadas: ${result.counts.stops} (${result.created.stops} criada(s), ${result.updated.stops} atualizada(s))`
    );
    console.info(`[ingestion] Schedules inseridos: ${result.counts.schedules}`);
    console.info(`[ingestion] Route directions inseridas: ${result.counts.routeDirections}`);
    console.info(`[ingestion] Line stops inseridos: ${result.counts.lineStops}`);
    console.info(`[ingestion] Route paths inseridos: ${result.counts.routePaths}`);
    console.info(`[ingestion] Fares inseridas: ${result.counts.fares}`);
    console.info(`[ingestion] Stop time predictions inseridas: ${result.counts.stopTimePredictions}`);
  }
};

const main = async () => {
  try {
    const parsed = parseArgs(process.argv.slice(2));
    const inputPath = resolveBackendPath(parsed.input);
    const outputPath = parsed.output ? resolveBackendPath(parsed.output) : undefined;

    if (parsed.command === 'normalize') {
      await runNormalize(inputPath, outputPath);
      return;
    }

    if (parsed.command === 'enrich-paths') {
      await runEnrichPaths(inputPath, outputPath, parsed);
      return;
    }

    await runImport(inputPath);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('[ingestion] Erro de validacao do manifest:');
      for (const issue of error.issues) {
        console.error(`- ${issue.path.join('.')} :: ${issue.message}`);
      }
      process.exitCode = 1;
      return;
    }

    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    console.error(`[ingestion] ${message}`);
    if (typeof message === 'string' && message.includes('Conflito de identidade')) {
      console.error('[ingestion] Em desenvolvimento, rode o reset do dominio de transporte e reimporte os manifests canonicos.');
      console.error('[ingestion] Sugestao: npm run ingestion:reset-dev --workspace @cityline/backend');
    }
    process.exitCode = 1;
  }
};

void main();
