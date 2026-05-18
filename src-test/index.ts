import { defineBootstrap } from 'gaman';
import { startKameWithGaman } from '../packages/kame/src';
import AppRouter from './modules/app/AppRouter';
defineBootstrap((app) => {
	app.mount(AppRouter('/'));

	app.mountServer({ http: 3431 });
	startKameWithGaman(app, { srcDir: 'src-test' });
});
