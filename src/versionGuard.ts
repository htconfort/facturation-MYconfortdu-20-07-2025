const KEY = 'last_build_commit';

export async function ensureFreshBuild(commit: string) {
  try {
    const prev = localStorage.getItem(KEY);
    if (prev && prev !== commit) {
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
      } catch {}
      try {
        const anyIndexed = (indexedDB as any);
        const dbs = typeof anyIndexed?.databases === 'function' ? await anyIndexed.databases() : [];
        if (dbs?.length) {
          await Promise.all(
            dbs.map((d: any) => d?.name && indexedDB.deleteDatabase(d.name))
          );
        }
      } catch {}
      localStorage.setItem(KEY, commit);
      location.reload();
      return;
    }
    localStorage.setItem(KEY, commit);
  } catch {
    // Si localStorage indisponible, ignorer
  }
}
