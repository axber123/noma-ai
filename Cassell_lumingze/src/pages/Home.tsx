import { useCallback, useEffect, useRef, useState } from "react";
import Background from "../components/Background";
import NomaCharacter from "../components/Noma/NomaCharacter";
import type { NomaState } from "../components/Noma/nomaTypes";
import SystemStatus from "../components/HUD/SystemStatus";
import ChatPanel from "../components/Chat/ChatPanel";
import type { Message } from "../components/Chat/chatTypes";
import { streamChat, type ChatTurn } from "../services/chat";
import "./Home.css";

/** 卡塞尔学院 NOMA 诺玛 AI 系统首页（龙族 · 未来科技 · 冰蓝全息） */
export default function Home() {
  const [booted, setBooted] = useState(false); // AI 系统启动完成
  const [nomaState, setNomaState] = useState<NomaState>("welcome");
  const [welcomeDone, setWelcomeDone] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // AI 系统启动效果：短暂 boot 后揭开诺玛投影
  useEffect(() => {
    const t = window.setTimeout(() => setBooted(true), 2600);
    return () => window.clearTimeout(t);
  }, []);

  // 欢迎动画结束：诺玛进入待机，输入框获得焦点
  const handleWelcomeDone = useCallback(() => {
    setNomaState("idle");
    setWelcomeDone(true);
    window.setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  // 发送消息 → 诺玛状态联动 → 携带多轮上下文流式接收回答
  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text.trim() };
      const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
      // 多轮上下文：历史消息 + 当前提问（跳过空内容）
      const history: ChatTurn[] = [...messages, userMsg]
        .filter((m) => m.content)
        .map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);
      setNomaState("thinking");

      abortRef.current = new AbortController();
      try {
        // AI 开始流式返回 → speaking
        setNomaState("speaking");
        await streamChat(
          history,
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: m.content + chunk } : m,
              ),
            );
          },
          abortRef.current.signal,
        );
        setNomaState("idle");
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setNomaState("idle");
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: "—— 诺玛暂时无法接入主脑，请确认后端已启动（npm run server）后重试。" }
                : m,
            ),
          );
          setNomaState("error");
          window.setTimeout(() => setNomaState("idle"), 2600);
        }
      } finally {
        setStreaming(false);
      }
    },
    [streaming, messages],
  );

  // 离开页面时中断请求
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  return (
    <div className={`home${booted ? " home-booted" : ""}`}>
      <Background />

      <header className="home-header">
        <h1 className="home-logo">
          <span className="home-logo-cn">卡塞尔学院</span>
          <span className="home-logo-en">CASSELL COLLEGE · NOMA SYSTEM</span>
        </h1>
        <div className="home-header-right">
          <span className="home-status-dot" />
          <span className="home-status-text">SYSTEM ONLINE</span>
        </div>
      </header>

      <div className="home-body">
        <aside className="home-left">
          <SystemStatus />
        </aside>

        <main className="home-center">
          <div className="home-stage">
            <NomaCharacter state={nomaState} onWelcomeDone={handleWelcomeDone} />
            <p className="home-online">NOMA SYSTEM ONLINE</p>
          </div>
        </main>

        <section className="home-right">
          <ChatPanel
            messages={messages}
            streaming={streaming}
            disabled={!welcomeDone}
            onSend={handleSend}
            inputRef={inputRef}
          />
        </section>
      </div>

      {/* AI 系统启动遮罩 */}
      {!booted && (
        <div className="home-boot" aria-hidden="true">
          <div className="home-boot-ring" />
          <div className="home-boot-core">
            <span className="home-boot-label">NOMA · 诺玛核心</span>
            <div className="home-boot-bar">
              <i />
            </div>
            <span className="home-boot-text">SYSTEM BOOTING · 全息投影加载中</span>
          </div>
        </div>
      )}
    </div>
  );
}
