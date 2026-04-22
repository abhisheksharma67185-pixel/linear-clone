import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  devIndicators: false,
  serverExternalPackages: [],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  async redirects() {
    return [
      {
        source: "/jira",
        destination: "/projects/SCRUM/board",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
