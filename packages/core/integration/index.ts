import { Integration } from '@gaman/common';

export function defineIntegration(factory: Integration): () => Integration {
	return () => factory;
}
