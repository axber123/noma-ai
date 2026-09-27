/** 对话消息结构 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
