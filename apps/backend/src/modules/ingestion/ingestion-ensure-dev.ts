import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../../shared/database/prisma.js';
import { parseNormalizedManifest } from './ingestion-manifest.js';
import { ingestionService } from './ingestion.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../../');
const normalizedDir = path.join(backendRoot, 'data', 'normalized', 'sao-francisco-do-sul');
const minimumLineCount = Number(process.env.CITYLINE_MIN_LINES ?? 20);

const readJson = async (filePath: string) => JSON.parse(await readFile(filePath, 'utf8')) as unknown;

async function main() {
  const currentLineCount = await prisma.transportLine.count();

  if (currentLineCount >= minimumLineCount) {
    console.info(
      `[ingestion] Base de transporte já está completa (${currentLineCount} linhas). Nenhuma ação necessária.`
    );
    return;
  }

  console.info(
    `[ingestion] Base reduzida detectada (${currentLineCount} linhas). Recarregando manifests normalizados...`
  );

  const files = (await readdir(normalizedDir))
    .filter((name) => /^line-.*\.json$/i.test(name) || /^ferry-.*\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  if (files.length === 0) {
    throw new Error(`Nenhum manifest encontrado em ${normalizedDir}.`);
  }

  for (const fileName of files) {
    const fullPath = path.join(normalizedDir, fileName);
    const manifest = parseNormalizedManifest(await readJson(fullPath));
    await ingestionService.importNormalized(manifest.dataset);
    console.info(`[ingestion] Importado ${fileName}`);
  }

  const updatedCount = await prisma.transportLine.count();
  console.info(`[ingestion] Reidratação concluída. Linhas disponíveis: ${updatedCount}.`);
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    console.error(`[ingestion] Falha ao garantir base de transporte: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

