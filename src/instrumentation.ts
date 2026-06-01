export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    import('./lib/drive-pdf-cache').then(({ preloadPDFCache, startRefreshLoop }) => {
      preloadPDFCache();
      startRefreshLoop(30);
    });
  }
}
