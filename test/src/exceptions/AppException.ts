import { composeExceptionHandler } from '@gaman/core';

export default composeExceptionHandler((er) => {
	console.error(er);
});
