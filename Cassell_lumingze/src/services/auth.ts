/**
 * 模拟后端认证服务
 * 说明：当前项目为纯前端（React + Vite），暂无真实服务器。
 * 因此这里用一个异步模块模拟后端接口（返回 Promise），
 * 用户数据以 JSON 格式持久化到 localStorage。
 * 将来接入真实后端（如 Express）时，只需替换本模块内部实现，
 * 调用方（Login.tsx）无需改动。
 */

export interface User {
  username: string
  password: string
}

const STORAGE_KEY = 'cassell_users'

/** 从 localStorage 读取全部用户（JSON） */
function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch {
    return []
  }
}

/** 将用户列表以 JSON 写入 localStorage */
function writeUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

/** 模拟网络延迟，让调用方更接近真实异步后端的使用方式 */
function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 生成随机 token，用于登录后的身份验证 */
export function generateToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '')
  }
  // 非安全上下文下的回退方案
  const rand = () => Math.random().toString(36).slice(2)
  return `${rand()}${rand()}${Date.now().toString(36)}`
}

/** 注册：用户名不允许重复，成功返回 true；重复则抛出错误 */
export async function register(
  username: string,
  password: string,
): Promise<{ success: true }> {
  await delay()
  const users = readUsers()
  if (users.some((u) => u.username === username)) {
    throw new Error('用户名已存在，请更换后重试')
  }
  users.push({ username, password })
  writeUsers(users)
  return { success: true }
}

/** 登录：校验账号密码，成功后生成随机 token 并返回（token 不落任何存储） */
export async function login(
  username: string,
  password: string,
): Promise<{ username: string; token: string }> {
  await delay()
  const users = readUsers()
  const user = users.find((u) => u.username === username)
  if (!user || user.password !== password) {
    throw new Error('用户名或密码错误')
  }
  // token 仅保存在调用方内存中（如 React state / Context），不写入持久化存储
  const token = generateToken()
  return { username, token }
}
