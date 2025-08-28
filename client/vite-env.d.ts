/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
  // add more env variables here if you have them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
