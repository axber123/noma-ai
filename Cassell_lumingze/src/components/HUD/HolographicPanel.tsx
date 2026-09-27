import type { ReactNode } from "react";
import "./HUD.css";

interface HolographicPanelProps {
  title?: string;
  className?: string;
  accent?: "cyan" | "amber" | "red";
  children: ReactNode;
}

/** 通用全息玻璃面板：四角 HUD 括号 + 标题栏 + 内容区 */
export default function HolographicPanel({
  title,
  className = "",
  accent = "cyan",
  children,
}: HolographicPanelProps) {
  return (
    <section className={`holo-panel holo-${accent} ${className}`}>
      <span className="holo-corner hc-tl" aria-hidden="true" />
      <span className="holo-corner hc-tr" aria-hidden="true" />
      <span className="holo-corner hc-bl" aria-hidden="true" />
      <span className="holo-corner hc-br" aria-hidden="true" />
      {title && (
        <header className="holo-header">
          <span className="holo-title-mark">◈</span>
          <h3 className="holo-title">{title}</h3>
          <span className="holo-title-line" />
        </header>
      )}
      <div className="holo-body">{children}</div>
    </section>
  );
}
