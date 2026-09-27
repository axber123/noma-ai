/** 诺玛角色动画素材：由「图片帧序列」升级为「高质量角色动画视频」 */
import nomaVideo from "../../assets/noma/欢迎.mp4";

/**
 * 诺玛角色动画视频（竖版 720×1106，约 5s，24fps，深色星空科技背景 + 冰蓝光环粒子）。
 * 动画为二次元 CG 风，结尾为优雅伸手的欢迎姿态——契合「神秘 / 优雅 / 高级 / 科技」的设定。
 *
 * 默认所有状态（welcome / idle / thinking / speaking）都复用此视频作为“活体”基础动画，
 * 状态差异通过 CSS 叠加层（全息数据流 / 音频波形 / 错误 HUD）与光晕、色调来呈现。
 * 后续如需为 idle / thinking / speaking 配置专属动画，在下方按状态提供不同视频即可，
 * NomaCharacter 会自动取用（未配置时回退到 NOMA_VIDEO）。
 */
export const NOMA_VIDEO = nomaVideo;

/** 按状态映射专属动画（可选；缺省回退到 NOMA_VIDEO） */
export const NOMA_STATE_VIDEOS: Partial<Record<string, string>> = {};

/** 读取某状态应使用的动画视频 */
export function nomaVideoForState(state: string): string {
  return NOMA_STATE_VIDEOS[state] ?? NOMA_VIDEO;
}
