/** 诺玛角色状态机 */
export type NomaState = "welcome" | "idle" | "thinking" | "speaking" | "error";

export interface NomaCharacterProps {
  /** 当前状态：welcome 播放欢迎动画，其余对应不同表现 */
  state: NomaState;
  /** 欢迎动画播放完毕（或用户跳过）后回调，由父组件切到 idle */
  onWelcomeDone?: () => void;
  /** 欢迎语打字机文本（两行，依次显示） */
  welcomeLines?: [string, string];
}

export const DEFAULT_WELCOME_LINES: [string, string] = [
  "欢迎来到卡塞尔学院。",
  "我是诺玛，很高兴见到你。",
];
