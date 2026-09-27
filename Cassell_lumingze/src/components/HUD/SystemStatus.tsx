import { useEffect, useState } from "react";
import HolographicPanel from "./HolographicPanel";
import "./HUD.css";

/** 左侧：学院信息 / 系统状态 / 简单导航 */
export default function SystemStatus() {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const iv = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(iv);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(clock.getHours())}:${pad(clock.getMinutes())}:${pad(clock.getSeconds())}`;

  return (
    <div className="system-status">
      <HolographicPanel title="学院信息 · ACADEMY" accent="cyan">
        <p className="ss-name">CASSELL COLLEGE</p>
        <p className="ss-sub">卡塞尔学院 · 诺玛主系统</p>
        <ul className="ss-nav">
          <li>
            <a href="#/library">▸ 学院数据库</a>
          </li>
          <li>
            <a href="#/archive">▸ 任务档案</a>
          </li>
          <li>
            <a href="#/memo">▸ 秘密备忘</a>
          </li>
        </ul>
      </HolographicPanel>

      <HolographicPanel title="系统状态 · STATUS" accent="cyan">
        <div className="ss-row">
          <span>SYSTEM</span>
          <b className="ss-on">● ONLINE</b>
        </div>
        <div className="ss-row">
          <span>NOMA CORE</span>
          <b className="ss-on">● ACTIVE</b>
        </div>
        <div className="ss-row">
          <span>DATA LINK</span>
          <b className="ss-on">● STABLE</b>
        </div>
        <div className="ss-meter">
          <span>AI CORE</span>
          <div className="ss-bar">
            <i style={{ width: "92%" }} />
          </div>
        </div>
        <div className="ss-meter">
          <span>MEMORY</span>
          <div className="ss-bar">
            <i style={{ width: "76%" }} />
          </div>
        </div>
        <div className="ss-meter">
          <span>SIGNAL</span>
          <div className="ss-bar">
            <i style={{ width: "88%" }} />
          </div>
        </div>
        <p className="ss-clock">LOCAL TIME · {time}</p>
      </HolographicPanel>
    </div>
  );
}
