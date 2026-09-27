import type { RefObject } from "react";
import "./ChatPanel.css";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
}

/** HUD 风格输入框（玻璃拟态 + 蓝色发光边框），Enter 或按钮发送 */
export default function ChatInput({ value, onChange, onSend, disabled, inputRef }: ChatInputProps) {
  return (
    <form
      className="chat-input-wrap"
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
      <input
        ref={inputRef}
        className="chat-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={disabled ? "诺玛正在苏醒，请稍候……" : "输入你的问题，诺玛将为你解答……"}
        disabled={disabled}
        maxLength={500}
        autoComplete="off"
      />
      <button className="chat-send" type="submit" disabled={disabled || !value.trim()}>
        <span className="chat-send-text">发送</span>
        <span className="chat-send-key">ENTER</span>
      </button>
    </form>
  );
}
