import { useEffect, useRef, useState } from "react";
import type { NomaCharacterProps } from "./nomaTypes";
import { DEFAULT_WELCOME_LINES } from "./nomaTypes";
import { nomaVideoForState } from "./nomaAssets";
import "./NomaCharacter.css";

/**
 * 诺玛角色组件（视频动画版）
 * - 以「高质量角色动画视频」为活体基础，置于全息投影门户内。
 * - welcome：按时间线播放入场光效 + 打字机欢迎语
 * - idle：柔和浮动 + 冰蓝光晕
 * - thinking：全息数据流叠加 + 数据环
 * - speaking：音频波形叠加
 * - error：冻结画面 + 红色警告 HUD
 * 视频只播放一次，播完后停留在最后一帧。
 */

/** 思考态数据流数字（模块级确定值，避免渲染期调用 Math.random） */
const STREAM_BITS = Array.from({ length: 16 }).map((_, i) => ({
  left: ((i * 61) % 92) + 4,
  top: ((i * 37) % 80) + 2,
  delay: (i % 7) * 0.35,
  dur: 1.4 + (i % 4) * 0.5,
  bit: i % 2 === 0 ? "1" : "0",
}));

export default function NomaCharacter({
  state,
  onWelcomeDone,
  welcomeLines = DEFAULT_WELCOME_LINES,
}: NomaCharacterProps) {
  const [welcomePhase, setWelcomePhase] = useState(0);
  const [typed, setTyped] = useState<{ line: number; text: string }>({ line: -1, text: "" });
  const timersRef = useRef<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const pushTimer = (t: number) => {
    timersRef.current.push(t);
  };
  const clearAll = () => {
    timersRef.current.forEach((t) => {
      window.clearTimeout(t);
      window.clearInterval(t);
    });
    timersRef.current = [];
  };

  useEffect(() => () => clearAll(), []);

  const isWelcome = state === "welcome";
  const videoSrc = nomaVideoForState(state);

  // 视频播放策略：error 冻结画面；welcome 播放一次；
  // idle / thinking / speaking 不干预播放——动画自然播完后停留在最后一帧
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (state === "error") {
      v.pause();
    } else if (state === "welcome") {
      const p = v.play();
      if (p !== undefined) p.catch(() => {});
    }
  }, [state]);

  // ---- 欢迎时间线（粒子→显现→抬头→注视→微笑→伸手→打字） ----
  // 初始 state 已与欢迎起始态一致（phase=0 / 未打字），这里只调度阶段推进
  useEffect(() => {
    if (!isWelcome) return;
    const steps: Array<[number, number]> = [
      [0, 1], // 0.0s 冰蓝粒子出现
      [800, 2], // 0.8s 诺玛逐渐显现
      [1500, 3], // 1.5s 抬头
      [2200, 4], // 2.2s 看向用户
      [2800, 5], // 2.8s 微笑
      [3400, 6], // 3.4s 伸手 + 打字机欢迎语
    ];
    steps.forEach(([ms, ph]) => pushTimer(window.setTimeout(() => setWelcomePhase(ph), ms)));
    return clearAll;
  }, [isWelcome]);

  // 欢迎文字打字机效果（两行依次显示）
  useEffect(() => {
    if (!isWelcome || welcomePhase < 6) return;
    let line = 0;
    let char = 0;
    const iv = window.setInterval(() => {
      if (char < welcomeLines[line].length) {
        setTyped({ line, text: welcomeLines[line].slice(0, char + 1) });
        char += 1;
      } else {
        line += 1;
        char = 0;
        if (line >= welcomeLines.length) {
          window.clearInterval(iv);
          setTyped({ line: -1, text: "" });
          onWelcomeDone?.();
        } else {
          setTyped({ line, text: "" });
        }
      }
    }, 105);
    pushTimer(iv);
    // 安全兜底：最长 7.5 秒强制结束欢迎动画
    pushTimer(window.setTimeout(() => onWelcomeDone?.(), 7500));
    return () => window.clearInterval(iv);
  }, [isWelcome, welcomePhase, welcomeLines, onWelcomeDone]);

  return (
    <div className={`noma-character noma-${state}${isWelcome ? ` noma-wp-${welcomePhase}` : ""}`}>
      <div className="noma-halo" aria-hidden="true" />
      <div className="noma-aurora" aria-hidden="true" />
      <div className="noma-particles" aria-hidden="true" />

      {/* 全息投影门户 */}
      <div className="noma-portal">
        <video
          ref={videoRef}
          className="noma-video"
          src={videoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          draggable={false}
        />
        {/* 统一冰蓝色调 + 边缘暗角 */}
        <div className="noma-video-shade" aria-hidden="true" />
        {/* 全息扫描线 */}
        <div className="noma-scan" aria-hidden="true" />
        {/* HUD 四角括号 */}
        <span className="noma-bracket nb-tl" aria-hidden="true" />
        <span className="noma-bracket nb-tr" aria-hidden="true" />
        <span className="noma-bracket nb-bl" aria-hidden="true" />
        <span className="noma-bracket nb-br" aria-hidden="true" />
        <span className="noma-caption" aria-hidden="true">
          NOMA · 全息投影
        </span>

        {state === "thinking" && (
          <div className="noma-overlay noma-data-stream" aria-hidden="true">
            <div className="noma-holo-ring" />
            {STREAM_BITS.map((s, i) => (
              <span
                key={i}
                className="noma-ds-bit"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${s.dur}s`,
                }}
              >
                {s.bit}
              </span>
            ))}
          </div>
        )}

        {state === "speaking" && (
          <div className="noma-overlay noma-waveform" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="noma-wave-bar" style={{ animationDelay: `${i * 0.11}s` }} />
            ))}
          </div>
        )}

        {state === "error" && (
          <div className="noma-overlay noma-error-hud" role="alert">
            <span className="noma-warn-triangle">⚠</span>
            <p className="noma-warn-text">SIGNAL LOST · 与主脑连接异常</p>
          </div>
        )}
      </div>

      {isWelcome && typed.line >= 0 && (
        <div className="noma-welcome-bubble">
          <p className="noma-wtext">{typed.line === 0 ? typed.text : welcomeLines[0]}</p>
          {typed.line === 1 && (
            <p className="noma-wtext">
              {typed.text}
              <span className="noma-caret">▍</span>
            </p>
          )}
          {typed.line === 0 && <span className="noma-caret">▍</span>}
        </div>
      )}

      {isWelcome && (
        <button className="noma-skip" type="button" onClick={() => onWelcomeDone?.()}>
          SKIP ▸ 跳过欢迎
        </button>
      )}
    </div>
  );
}
