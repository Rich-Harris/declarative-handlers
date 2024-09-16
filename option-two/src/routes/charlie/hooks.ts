import type { Handle } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) => {
	event.locals.foo = true;
	event.locals.bar = true;
	return resolve(event);
};