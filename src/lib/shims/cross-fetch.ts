const nativeFetch = globalThis.fetch.bind(globalThis);

const fetchImpl = (...args: Parameters<typeof nativeFetch>) => nativeFetch(...args);

export default fetchImpl;
export const fetch = fetchImpl;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
