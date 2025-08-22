/// <reference types="vite/client" />

// Support des assets
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}

// Variables globales
declare global {
  interface Window {
    __N8N_WEBHOOK_URL__?: string;
    __MYCONFORT_LOGO__?: string;
  }
}
