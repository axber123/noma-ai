import { useState, type FormEvent } from "react";
import { login, register } from "../services/auth";
import "./Login.css";

type ModalType = "login" | "register" | null;

interface LoginProps {
  /** 点击「进入学院」后的回调，由 App 决定跳转到 Home 页面 */
  onEnter?: () => void;
}

/** 密码正则：必须同时包含数字和字母，且仅限字母数字、至少 6 位 */
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

export default function Login({ onEnter }: LoginProps) {
  const [modal, setModal] = useState<ModalType>(null);
  // ---- 受控组件：表单值由 React state 统一管理 ----
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // 登录成功后保存 { username, token }，后续可直接交给 Context 广播给各组件
  const [session, setSession] = useState<{
    username: string;
    token: string;
  } | null>(null);

  const closeModal = () => {
    setModal(null);
    setError("");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!account.trim() || !password) {
      setError("请输入账号和密码");
      return;
    }
    setLoading(true);
    try {
      const result = await login(account.trim(), password);
      setSession({ username: result.username, token: result.token });
      setPassword("");
      // 登录成功：token 与用户名已就绪，可交给 Context 广播
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const name = account.trim();
    if (!name) {
      setError("请输入用户名");
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setError("密码需为 6 位以上，且同时包含数字和字母");
      return;
    }
    if (password !== rePassword) {
      setError("两次输入的密码不一致，请重新输入");
      return;
    }
    setLoading(true);
    try {
      await register(name, password);
      // 注册成功：清空表单并自动切换到登录弹窗，方便直接登录
      setPassword("");
      setRePassword("");
      setAccount(name);
      setModal("login");
      alert("注册成功，请使用新账号登录");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 背景视频铺满整个屏幕 */}
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="/zulong.mp4" type="video/mp4" />
        您的浏览器不支持 video 标签
      </video>
      {/* 黑红暗色遮罩，衬托文字并营造龙族的神秘氛围 */}
      <div className="bg-overlay" />

      <main className="login-content">
        <p className="login-kicker">CASSEL COLLEGE · 秘之边陲</p>
        <h1 className="login-title">
          欢迎来到
          <span>卡塞尔学院</span>
        </h1>
        <p className="login-subtitle">
          这里沉睡着龙族的血脉，也将是你命运的起点
        </p>

        <div className="login-actions">
          <button className="btn-ghost" onClick={() => setModal("login")}>
            登 录
          </button>
          <button className="btn-ghost" onClick={() => setModal("register")}>
            注 册
          </button>
        </div>
      </main>

      {/* 登录弹窗 */}
      {modal === "login" && (
        <div className="modal-mask" onClick={closeModal}>
          {session ? (
            /* 登录成功：弹出录取通知书风格弹窗（token 保存在内存中，不向界面暴露） */
            <div className="admission-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="关闭"
              >
                ×
              </button>
              <div className="admission-paper">
                <p className="admission-greet">亲爱的{session.username}同学：</p>
                <div className="admission-body">
                  <p>
                    祝贺你通过层层选拔与考核，展现出卓越的潜质与坚定的信念。
                  </p>
                  <p>我们非常高兴地通知你，你已被卡塞尔学院正式录取！</p>
                  <p>
                    在此，你将与来自世界各地的优秀伙伴共同探索知识的奥秘，
                  </p>
                  <p>锤炼意志，守护真理，书写属于你的传奇。</p>
                  <p>愿你在卡塞尔学院的旅程中，超越自我，成就非凡。</p>
                </div>
              </div>
              <button className="btn-enter" type="button" onClick={onEnter}>
                进入学院
              </button>
            </div>
          ) : (
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="关闭"
              >
                ×
              </button>
              <form onSubmit={handleLogin} noValidate>
                <h2 className="modal-title">登 录</h2>
                <label htmlFor="login-account">账号</label>
                <input
                  id="login-account"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入账号"
                  autoComplete="username"
                  required
                />
                <label htmlFor="login-password">密码</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  required
                />
                {error && <p className="form-error">{error}</p>}
                <button className="btn-solid" type="submit" disabled={loading}>
                  {loading ? "登录中…" : "进入学院"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 注册弹窗 */}
      {modal === "register" && (
        <div className="modal-mask" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="关闭"
            >
              ×
            </button>
            <form onSubmit={handleRegister} noValidate>
              <h2 className="modal-title">入学申请表</h2>
              <label htmlFor="reg-account">用户名</label>
              <input
                id="reg-account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="请输入用户名"
                autoComplete="username"
                required
              />
              <label htmlFor="reg-password">密码</label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="数字与字母组合，至少 6 位"
                autoComplete="new-password"
                required
              />
              <label htmlFor="reg-repassword">确认密码</label>
              <input
                id="reg-repassword"
                type="password"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                placeholder="请再次输入密码"
                autoComplete="new-password"
                required
              />
              {error && <p className="form-error">{error}</p>}
              <button className="btn-solid" type="submit" disabled={loading}>
                {loading ? "注册中…" : "注 册"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
