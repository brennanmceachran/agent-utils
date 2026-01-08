// Minimal ambient types to keep .opencode TypeScript self-contained.
// This repo may not have Node/Bun type packages installed.

declare type Buffer = any;
declare type BufferEncoding = any;

declare module 'fs/promises' {
  const fs: any;
  export default fs;
}

declare module 'path' {
  const path: any;
  export default path;
}
