import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = __dirname.includes("/sites/") ? path.resolve(__dirname, "../..") : __dirname

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: [],
  turbopack: {
    root: rootDir,
  },
}

export default nextConfig
