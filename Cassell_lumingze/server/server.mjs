/**
 * 卡塞尔学院 NOMA AI 对话后端（Node 18+，openai SDK）
 *
 * 启动：npm run server  （默认端口 3001）
 *
 * 接口：
 *   POST /api/chat  { message: string }  → SSE 流式返回 AI 回答
 *   GET  /api/health                     → { ok: true }
 *
 * AI 配置（项目根 .env，或 server/.env 或环境变量）：
 *   OPENAI_API_KEY   API Key（不配置时使用本地模拟回答，便于直接演示）
 *   OPENAI_BASE_URL  兼容 OpenAI 的接口地址，默认 https://api.openai.com/v1
 *   OPENAI_MODEL     模型名，默认 deepseek-v41-flash
 *   （兼容旧键名 AI_API_KEY / AI_BASE_URL / AI_MODEL）
 *
 * 调用方式：openai SDK 的 client.chat.completions.create({ stream: true })，
 * 逐块提取 delta.content，以 SSE 透传给前端。
 * API Key 只保存在服务端，前端不接触。
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import OpenAI from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const DIST = join(__dirname, "..", "dist");

// ---- 简易 .env 加载（根目录 .env 优先，server/.env 可覆盖） ----
function loadEnvFile(envPath) {
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}
function loadEnv() {
  loadEnvFile(join(__dirname, "..", ".env")); // 项目根 .env
  loadEnvFile(join(__dirname, ".env")); // server/.env（覆盖）
}
loadEnv(); // 先加载 .env，再读取 AI 配置

// ---- AI 配置（兼容 OPENAI_* 与旧 AI_* 两套键名） ----
const AI_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
const AI_BASE = (process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const AI_MODEL = process.env.OPENAI_MODEL || process.env.AI_MODEL || "deepseek-v41-flash";

// OpenAI 兼容客户端（key 缺失时用占位符，仅在校验通过后才会发起真实请求）
const client = new OpenAI({ apiKey: AI_KEY || "not-configured", baseURL: AI_BASE });

// 静态资源 MIME
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// ---- 读取请求体 ----
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1_000_000) {
        reject(new Error("body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// ---- 本地模拟回答（未配置 API Key 时使用）----
function buildMockAnswer(question) {
  return [
    `关于「${question}」，我的数据库中检索到了相关线索。`,
    "作为卡塞尔学院的诺玛系统，我的职责是为你检索、分析与守护信息。",
    "秘之边陲藏着许多尚未解开的谜题，如果你愿意，我们可以一起深入探索。",
    "以上为初步检索结果，更精确的结论还需要交叉验证与推理。",
    "—— 诺玛 · NOMA SYSTEM",
  ].join("\n");
}

async function streamMock(res, question) {
  const text = buildMockAnswer(question);
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  // 按 6~16 字符分块，模拟流式输出
  let i = 0;
  await new Promise((resolve) => {
    const iv = setInterval(() => {
      const size = 6 + Math.floor(Math.random() * 11);
      const chunk = text.slice(i, i + size);
      i += size;
      if (chunk) res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      if (i >= text.length) {
        clearInterval(iv);
        res.write('data: [DONE]\n\n');
        res.end();
        resolve();
      }
    }, 46);
  });
}

// ---- 调用真实 AI API：openai SDK 流式输出，以 SSE 透传 ----
async function proxyAIStream(res, messages) {
  try {
    const stream = await client.chat.completions.create({
      model: AI_MODEL,
      stream: true,
      messages,
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // 逐块提取 delta.content，以 SSE 事件透传
    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content ?? "";
      if (text) res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    // 已开始响应时无法再改状态码，直接断开
    if (res.headersSent) {
      res.end();
      return;
    }
    const detail = err instanceof Error ? err.message : String(err);
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "AI upstream error", detail: detail.slice(0, 400) }));
  }
}

// ---- 静态文件服务（生产模式：node server 同时托管 dist）----
async function serveStatic(req, res, pathname) {
  if (!existsSync(DIST)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("前端未构建。开发模式请运行 npm run dev；或先 npm run build 再访问。");
    return;
  }
  let filePath = join(DIST, normalize(pathname).replace(/^([/\\])+/, ""));
  if (pathname === "/" || !extname(filePath)) filePath = join(DIST, "index.html");
  try {
    const s = await stat(filePath);
    if (!s.isFile()) throw new Error("not file");
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
}

// ---- 路由 ----
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS（开发模式跨端口访问）
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, service: "noma", time: new Date().toISOString() }));
    return;
  }

  if (pathname === "/api/chat" && req.method === "POST") {
    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      // 多轮上下文：优先取 { messages: [{role, content}, ...] }，兼容旧格式 { message }
      let messages = [];
      if (Array.isArray(body.messages)) {
        messages = body.messages
          .filter((m) => m && typeof m.content === "string" && m.content.trim())
          .map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content).trim().slice(0, 4000),
          }))
          .slice(-20); // 最多保留最近 20 轮
      } else {
        const message = String(body.message || "").trim().slice(0, 2000);
        if (message) messages = [{ role: "user", content: message }];
      }
      if (!messages.length) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "message is required" }));
        return;
      }
      if (AI_KEY) {
        await proxyAIStream(res, messages);
      } else {
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        await streamMock(res, lastUser?.content ?? "");
      }
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: String(err.message || err) }));
    }
    return;
  }

  // 其余 GET → 静态资源
  if (req.method === "GET") {
    await serveStatic(req, res, pathname);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method Not Allowed");
});

server.listen(PORT, () => {
  console.log(`[NOMA] 诺玛后端已启动 → http://localhost:${PORT}`);
  console.log(`[NOMA] ${AI_KEY ? `已接入真实 AI API（${AI_BASE} · ${AI_MODEL}）` : "未配置 API Key，使用本地模拟回答"}`);
});
