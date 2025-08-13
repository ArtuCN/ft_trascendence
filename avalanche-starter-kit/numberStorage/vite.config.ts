import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request to /rpc will be forwarded…
      "/rpc": {
        target: "http:/RqqzuZQfYZwdwZKCxyUFEd59GMavof325DfkUtckXDCEebz1q/127.0.0.1:9650",
        changeOrigin: true,
        rewrite: (path) =>
          // …and the path /rpc gets rewritten to your real JSON‑RPC endpoint
          path.replace(
            /^\/rpc/,
            "/ext/bc//rpc"
          ),
      },
    },
  },
})
