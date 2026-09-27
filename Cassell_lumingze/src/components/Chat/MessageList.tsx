import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "./chatTypes";
import "./ChatPanel.css";

interface MessageListProps {
  messages: Message[];
  /** 是否正在流式接收 AI 回答 */
  streaming: boolean;
}

/** 对话记录列表（内部滚动，不撑破页面）；诺玛回答以 Markdown 渲染 */
export default function MessageList({ messages, streaming }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="msg-list">
      {messages.length === 0 && (
        <div className="msg-empty">
          <span className="msg-empty-dot" />
          正在与诺玛建立通讯连接……
        </div>
      )}
      {messages.map((m) => (
        <div key={m.id} className={`msg ${m.role === "user" ? "msg-user" : "msg-noma"}`}>
          <span className="msg-role">{m.role === "user" ? "YOU" : "NOMA"}</span>
          <div className="msg-bubble">
            {m.role === "assistant" && m.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            ) : m.content ? (
              m.content
            ) : m.role === "assistant" && streaming ? (
              <span className="typing-dots">
                <i />
                <i />
                <i />
              </span>
            ) : null}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
