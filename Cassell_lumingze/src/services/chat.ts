/**
 * AI 对话流式客户端（支持多轮上下文）
 * 请求 POST /api/chat，携带完整对话历史 { messages: [{role, content}, ...] }，
 * 读取 response.body 流式数据。
 * 兼容两种返回格式：
 *  - SSE（data: 开头的行，可解析 JSON：content / delta.content / choices[0].delta.content）
 *  - 纯文本流（逐块直接追加）
 */

/** 对话轮次：角色 + 内容 */
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function streamChat(
  turns: ChatTurn[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: turns }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let sse = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    if (!sse) {
      const firstLine = buffer.split("\n")[0] || "";
      sse = firstLine.trimStart().startsWith("data:");
    }

    if (sse) {
      let idx: number;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const json = JSON.parse(payload);
          const content =
            json.content ??
            json.delta?.content ??
            json.choices?.[0]?.delta?.content ??
            json.choices?.[0]?.message?.content ??
            "";
          if (content) onChunk(content);
        } catch {
          // 非 JSON 的 data 负载：直接作为文本
          if (payload) onChunk(payload);
        }
      }
    } else {
      if (buffer) onChunk(buffer);
      buffer = "";
    }
  }
}
