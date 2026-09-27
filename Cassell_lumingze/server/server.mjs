/**
 * 卡塞尔学院 NOMA AI 后端
 *
 * Node.js + Express + OpenAI SDK
 *
 * 接口：
 * POST /api/chat
 * GET  /api/health
 */

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

dotenv.config({ quiet: true });

/* =========================
   基础配置
========================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number(process.env.PORT || 3001);

const DIST = path.join(__dirname, "..", "dist");

/* =========================
   AI 配置
========================= */

const AI_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

const AI_BASE = (
  process.env.OPENAI_BASE_URL ||
  process.env.AI_BASE_URL ||
  "https://api.openai.com/v1"
).replace(/\/+$/, "");

const AI_MODEL =
  process.env.OPENAI_MODEL || process.env.AI_MODEL || "deepseek-v41-flash";

/* =========================
   OpenAI Client
========================= */

const client = new OpenAI({
  apiKey: AI_KEY || "not-configured",
  baseURL: AI_BASE,
});

/* =========================
   Middleware
========================= */

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

/* =========================
   Health Check
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "noma",
    time: new Date().toISOString(),
    ai: {
      configured: Boolean(AI_KEY),
      model: AI_MODEL,
    },
  });
});

/* =========================
   Mock AI
========================= */

function buildMockAnswer(question) {
  return [
    `关于「${question}」，我的数据库中检索到了相关线索。`,
    "作为卡塞尔学院的诺玛系统，我的职责是为你检索、分析与守护信息。",
    "秘之边陲藏着许多尚未解开的谜题，如果你愿意，我们可以一起深入探索。",
    "以上为初步检索结果，更精确的结论还需要交叉验证与推理。",
    "——诺玛 · NOMA SYSTEM",
  ].join("\n");
}

/* =========================
   SSE 初始化
========================= */

function initSSE(res) {
  res.status(200);

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");

  res.setHeader("Cache-Control", "no-cache, no-transform");

  res.setHeader("Connection", "keep-alive");

  res.setHeader("X-Accel-Buffering", "no");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }
}

/* =========================
   SSE 发送
========================= */

function sendSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/* =========================
   Mock Streaming
========================= */

async function streamMock(res, question) {
  initSSE(res);

  const text = buildMockAnswer(question);

  let index = 0;

  while (index < text.length) {
    const size = 6 + Math.floor(Math.random() * 11);

    const chunk = text.slice(index, index + size);

    index += size;

    if (chunk) {
      sendSSE(res, {
        content: chunk,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 46));
  }

  res.write("data: [DONE]\n\n");
  res.end();
}

/* =========================
   AI Streaming
========================= */

async function streamAI(res, messages) {
  try {
    const stream = await client.chat.completions.create({
      model: AI_MODEL,
      stream: true,
      messages,
    });

    initSSE(res);

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content ?? "";

      if (!content) continue;

      sendSSE(res, {
        content,
      });
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("[NOMA AI ERROR]", error);

    if (res.headersSent) {
      res.end();
      return;
    }

    res.status(502).json({
      error: "AI upstream error",
      detail:
        error instanceof Error ? error.message.slice(0, 400) : String(error),
    });
  }
}

/* =========================
   Chat API
========================= */

app.post("/api/chat", async (req, res) => {
  try {
    const body = req.body || {};

    let messages = [];

    /* -------------------------
       多轮消息
    ------------------------- */

    if (Array.isArray(body.messages)) {
      messages = body.messages

        .filter(
          (message) =>
            message &&
            typeof message.content === "string" &&
            message.content.trim(),
        )

        .map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",

          content: String(message.content).trim().slice(0, 4000),
        }))

        .slice(-20);
    } else {
      /* -------------------------
       兼容旧格式
    ------------------------- */
      const message = String(body.message || "")
        .trim()
        .slice(0, 2000);

      if (message) {
        messages = [
          {
            role: "user",
            content: message,
          },
        ];
      }
    }

    /* -------------------------
       参数校验
    ------------------------- */

    if (!messages.length) {
      return res.status(400).json({
        error: "message is required",
      });
    }

    /* -------------------------
       AI / Mock
    ------------------------- */

    if (AI_KEY) {
      await streamAI(res, messages);
    } else {
      const lastUser = [...messages]
        .reverse()
        .find((message) => message.role === "user");

      await streamMock(res, lastUser?.content || "");
    }
  } catch (error) {
    console.error("[NOMA SERVER ERROR]", error);

    if (!res.headersSent) {
      res.status(400).json({
        error: error instanceof Error ? error.message : String(error),
      });
    } else {
      res.end();
    }
  }
});

/* =========================
   静态文件
========================= */

if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));

  /* React SPA fallback（非 /api 的 GET 一律返回 index.html） */
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api/")) {
      res.sendFile(path.join(DIST, "index.html"));
      return;
    }
    next();
  });
}

/* =========================
   404
========================= */

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
  });
});

/* =========================
   全局错误
========================= */

app.use((error, req, res, next) => {
  console.error("[NOMA ERROR]", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    error: "Internal Server Error",
  });
});

/* =========================
   启动
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[NOMA] 诺玛系统启动 → http://0.0.0.0:${PORT}`);

  console.log(`[NOMA] AI: ${AI_KEY ? "已配置" : "未配置，使用 Mock"}`);

  console.log(`[NOMA] Model: ${AI_MODEL}`);

  console.log(`[NOMA] BaseURL: ${AI_BASE}`);
});
