export { startKame } from './repl';

import { Gaman } from 'gaman';
import { startKame, type KameConfig } from './repl';

export function startKameWithGaman(
	gaman: Gaman,
	cfg: KameConfig = { srcDir: 'src' },
) {
	return startKame(cfg);
}
