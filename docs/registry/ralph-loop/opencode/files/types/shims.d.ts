// Minimal ambient types to keep .opencode TypeScript self-contained.
// This repo may not have Node/Bun type packages installed.

declare type Buffer = Uint8Array;
declare type BufferEncoding =
  | "ascii"
  | "utf8"
  | "utf-8"
  | "utf16le"
  | "ucs2"
  | "ucs-2"
  | "base64"
  | "base64url"
  | "latin1"
  | "binary"
  | "hex";

type FsStats = {
  isFile(): boolean;
};

type FsPromises = {
  realpath(path: string): Promise<string>;
  stat(path: string): Promise<FsStats>;
  readFile(path: string, encoding: BufferEncoding): Promise<string>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<string | undefined>;
  writeFile(path: string, data: string, encoding: BufferEncoding): Promise<void>;
};

declare module "fs/promises" {
  const fs: FsPromises;
  export default fs;
}

declare module "node:fs/promises" {
  const fs: FsPromises;
  export default fs;
}

type PathModule = {
  join(...paths: string[]): string;
  isAbsolute(path: string): boolean;
  resolve(...paths: string[]): string;
  relative(from: string, to: string): string;
  dirname(path: string): string;
  sep: string;
};

declare module "path" {
  const path: PathModule;
  export default path;
}

declare module "node:path" {
  const path: PathModule;
  export default path;
}
