import type { CollectedFerryRoute, CollectedLine, NormalizedTransportDataset } from '@cityline/shared';
import type { CollectedManifestFile } from './ingestion-manifest.js';
import { normalizedDatasetImporter, type NormalizedImportResult } from './ingestion-importer.js';
import { normalizeCollectedTransport } from './ingestion-normalizer.js';
import { enrichCollectedManifestPaths, type EnrichCollectedPathsOptions } from './route-path-enricher.js';

export interface IngestionManifestBundle {
  lines?: CollectedLine[];
  ferryRoutes?: CollectedFerryRoute[];
}

export class IngestionService {
  normalizeCollected(bundle: IngestionManifestBundle): NormalizedTransportDataset {
    return normalizeCollectedTransport(bundle);
  }

  async enrichCollectedPaths(manifest: CollectedManifestFile, options: EnrichCollectedPathsOptions): Promise<CollectedManifestFile> {
    return enrichCollectedManifestPaths(manifest, options);
  }

  async importNormalized(dataset: NormalizedTransportDataset): Promise<NormalizedImportResult> {
    return normalizedDatasetImporter.importDataset(dataset);
  }
}

export const ingestionService = new IngestionService();
