import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";


// 환경변수로 Service Worker 내용 치환하는 헬퍼 함수
function replaceEnvVars(content: string): string {
  const envVars = {
    VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY ?? "",
    VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID ?? "",
    VITE_FIREBASE_MESSAGING_SENDER_ID:
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
    VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID ?? "",
  };

  return content
    .replace(/__VITE_FIREBASE_API_KEY__/g, envVars.VITE_FIREBASE_API_KEY)
    .replace(/__VITE_FIREBASE_PROJECT_ID__/g, envVars.VITE_FIREBASE_PROJECT_ID)
    .replace(
      /__VITE_FIREBASE_MESSAGING_SENDER_ID__/g,
      envVars.VITE_FIREBASE_MESSAGING_SENDER_ID
    )
    .replace(/__VITE_FIREBASE_APP_ID__/g, envVars.VITE_FIREBASE_APP_ID);
}




// Service Worker 파일에 환경변수 주입 플러그인
const serviceWorkerEnvPlugin = (): Plugin => {
  return {
    name: "service-worker-env",
    generateBundle(_options) {
      // 빌드 시 Service Worker 파일을 읽어서 환경변수로 치환 후 출력
      const swPath = path.resolve(__dirname, "public/firebase-messaging-sw.js");
      const swContent = readFileSync(swPath, "utf-8");
      const replacedContent = replaceEnvVars(swContent);

      // 빌드된 파일로 출력
      (this as any).emitFile({
        type: "asset",
        fileName: "firebase-messaging-sw.js",
        source: replacedContent,
      });
    },
    configureServer(server) {
      // 개발 서버에서도 Service Worker 파일에 환경변수 주입
      server.middlewares.use(
        "/firebase-messaging-sw.js",
        (_req: IncomingMessage, res: ServerResponse) => {
          const swPath = path.resolve(
            __dirname,
            "public/firebase-messaging-sw.js"
          );
          const swContent = readFileSync(swPath, "utf-8");
          const replacedContent = replaceEnvVars(swContent);

          res.setHeader("Content-Type", "application/javascript");
          res.end(replacedContent);
        }
      );
    },
  };
};


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // styled-components Babel 플러그인 활성화 (대중적 옵션)
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
    serviceWorkerEnvPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000, // 필요시 변경
    open: true,
  },
});
