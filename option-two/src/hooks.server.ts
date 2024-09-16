import type { Handle, RequestEvent } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const route_specific_hooks = import.meta.glob('./routes/**/hooks.ts');

export async function handle({ event, resolve }) {
	const importer = route_specific_hooks['./routes' + event.route.id + '/hooks.ts'];

	if (importer) {
		const module = (await importer()) as any;
		if (module.handle) {
			return module.handle({ event, resolve });
		}
	}

	return resolve(event);
}
