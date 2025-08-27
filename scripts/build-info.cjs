// scripts/build-info.js
const fs = require("fs");
const path = require("path");

// Vars Netlify (ou fallback local)
const COMMIT = process.env.COMMIT_REF || require("child_process")
  .execSync("git rev-parse --short HEAD")
  .toString()
  .trim();

const BRANCH = process.env.BRANCH || process.env.GIT_BRANCH || "local";
const CONTEXT = process.env.CONTEXT || "dev";
const DEPLOY_URL = process.env.DEPLOY_URL || "http://localhost:5173"; // adapte si CRA/Next
const BUILD_TIME = new Date().toISOString();

const content = `// 🔧 Auto-généré par scripts/build-info.js
export const BUILD_COMMIT = "${COMMIT}";
export const BUILD_BRANCH = "${BRANCH}";
export const BUILD_CONTEXT = "${CONTEXT}";
export const BUILD_URL = "${DEPLOY_URL}";
export const BUILD_TIME_ISO = "${BUILD_TIME}";
`;

const outDir = path.join(process.cwd(), "src");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "buildInfo.ts"), content, "utf8");
console.log("[build-info] buildInfo.ts généré ✅");
