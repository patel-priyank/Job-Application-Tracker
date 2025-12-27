const setup = () => {
  const BASE: string = import.meta.env.VITE_API_URL ?? '';

  if (typeof window !== 'undefined') {
    const originalFetch: typeof window.fetch = window.fetch.bind(window);

    window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      if (typeof input === 'string' && input.startsWith('/api')) {
        const base = BASE.replace(/\/$/, '');
        return originalFetch(`${base}${input}`, init);
      }

      if (input instanceof Request && input.url.startsWith('/api')) {
        const base = BASE.replace(/\/$/, '');
        const rewrittenRequest = new Request(`${base}${input.url}`, input);
        return originalFetch(rewrittenRequest, init);
      }

      return originalFetch(input, init);
    };
  }
};

export default setup;
