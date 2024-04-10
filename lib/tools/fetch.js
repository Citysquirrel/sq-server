export async function fetch_(input, options) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), options.timeout || 5000);
	const res = await fetch(input, {
		...options,
		signal: controller.signal,
	});
	clearTimeout(id);

	const { headers, status, statusText } = res;
	const response = {
		data: await res.json(),
		headers,
		status,
		statusText,
	};

	return response;
}
