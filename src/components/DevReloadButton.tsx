export default function DevReloadButton() {
  async function hardReload() {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch {
      // Ignore cache deletion errors
    }
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch {
      // Ignore cache deletion errors
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore cache deletion errors
    }
    location.reload();
  }

  if (!import.meta.env.DEV) return null;

  return (
    <button onClick={hardReload} className="fixed bottom-2 right-2 px-3 py-2 rounded bg-black/70 text-white text-xs">
      Reload hard
    </button>
  );
}
