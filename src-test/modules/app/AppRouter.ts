import { composeRouter } from 'gaman/compose';
import AppController from './controllers/AppController';
import { AppService } from './services/AppService';

export default composeRouter((r) => {
	r.mountService({
		appService: AppService(),
	});

	r.get('/', [AppController, 'index']);
	r.get('/sync', [AppController, 'sync']);
	r.post('/create', [AppController, 'createUser']);
});
