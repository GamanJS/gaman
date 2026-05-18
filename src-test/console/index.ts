import { Logger } from '../../dist/utils/logger';
import { composeConsole } from '../../packages/kame/src/compose';

export default composeConsole((kame) => {
	kame
		.command('ping', (args, flags) => {
			Logger.info('pong');
		})
		.usage('ping <msg>');
});
