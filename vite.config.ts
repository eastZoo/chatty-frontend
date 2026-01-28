import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";

/** env 객체로 Service Worker 플레이스홀더 치환 (loadEnv 결과 사용) */
function replaceEnvVars(
  content: string,
  env: Record<string, string>
): string {
  return content
    .replace(/__VITE_FIREBASE_API_KEY__/g, env.VITE_FIREBASE_API_KEY ?? "")
    .replace(/__VITE_FIREBASE_PROJECT_ID__/g, env.VITE_FIREBASE_PROJECT_ID ?? "")
    .replace(
      /__VITE_FIREBASE_MESSAGING_SENDER_ID__/g,
      env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? ""
    )
    .replace(/__VITE_FIREBASE_APP_ID__/g, env.VITE_FIREBASE_APP_ID ?? "");
}

/** Service Worker 파일에 환경변수 주입 플러그인 (loadEnv로 로드한 env 전달) */
const serviceWorkerEnvPlugin = (env: Record<string, string>): Plugin => {
  return {
    name: "service-worker-env",
    generateBundle(_options) {
      const swPath = path.resolve(__dirname, "public/firebase-messaging-sw.js");
      const swContent = readFileSync(swPath, "utf-8");
      const replacedContent = replaceEnvVars(swContent, env);

      (this as any).emitFile({
        type: "asset",
        fileName: "firebase-messaging-sw.js",
        source: replacedContent,
      });
    },
    configureServer(server) {
      server.middlewares.use(
        "/firebase-messaging-sw.js",
        (_req: IncomingMessage, res: ServerResponse) => {
          const swPath = path.resolve(
            __dirname,
            "public/firebase-messaging-sw.js"
          );
          const swContent = readFileSync(swPath, "utf-8");
          const replacedContent = replaceEnvVars(swContent, env);

          res.setHeader("Content-Type", "application/javascript");
          res.end(replacedContent);
        }
      );
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 빌드/ dev 시 mode에 맞는 .env 파일 로드 (process.env는 빌드 시 비어 있을 수 있음)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            [
              "babel-plugin-styled-components",
              {
                displayName: true,
                fileName: true,
                pure: true,
              },
            ],
          ],
        },
      }),
      serviceWorkerEnvPlugin(env),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});
