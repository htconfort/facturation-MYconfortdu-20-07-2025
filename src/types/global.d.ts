// src/types/global.d.ts
/// <reference types="vite/client" />

declare module 'jspdf-autotable';

declare global {
  interface Window {
    __MYCONFORT_LOGO__?: string;
    __N8N_WEBHOOK_URL__?: string;
  }
}

declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
