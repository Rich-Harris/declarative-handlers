import type { Handle, RequestEvent } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// maximum flexibility — provide a predicate function that determines whether
// a given handler should run
function conditional_handler(fn: Handle, predicate: (event: RequestEvent) => boolean) {
	const handle: Handle = ({ event, resolve }) => {
		if (predicate(event)) {
			return fn({ event, resolve });
		}

		return resolve(event);
	};

	return handle;
}

// less flexibility but easier to use — provide a list of applicable route IDs
function route_specific_handler(routes: string[], fn: Handle) {
	return conditional_handler(fn, (event) =>
		event.route.id ? routes.includes(event.route.id) : false
	);
}

// run this handler for bravo/charlie routes
const foo = route_specific_handler(['/bravo', '/charlie'], ({ event, resolve }) => {
	event.locals.foo = true;
	return resolve(event);
});

// run this handler for charlie/delta routes
const bar = route_specific_handler(['/charlie', '/delta'], ({ event, resolve }) => {
	event.locals.bar = true;
	return resolve(event);
});

export const handle = sequence(foo, bar);
