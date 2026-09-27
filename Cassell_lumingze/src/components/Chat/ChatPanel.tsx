import { useState } from "react";
import type { RefObject } from "react";
import HolographicPanel from "../HUD/HolographicPanel";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { Message } from "./chatTypes";
import "./ChatPanel.css";

interface ChatPanelProps {
  messages: Message[];
  /** 是否正在流式接收 AI 回答 */
  streaming: boolean;
  /** 欢迎动画结束前禁用输入 */
  disabled: boolean;
  /** 发送消息（由 Home 负责请求与诺玛状态联动） */
  onSend: (text: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

/** AI 对话面板：记录列表 + HUD 输入框 */
export default function ChatPanel({
  messages,
  streaming,
  disabled,
  onSend,
  inputRef,
}: ChatPanelProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <HolographicPanel title="AI CHAT · 诺玛通讯频道" accent="cyan" className="chat-panel">
      <MessageList messages={messages} streaming={streaming} />
      <ChatInput
        value={value}
        onChange={setValue}
        onSend={submit}
        disabled={disabled}
        inputRef={inputRef}
      />
    </HolographicPanel>
  );
}
