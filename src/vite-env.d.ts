/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MONGODB_URI: string
  readonly VITE_JWT_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  var mongoose: {
    conn: any;
    promise: any;
  };
}