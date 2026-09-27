import { useEffect, useRef } from "react";
import "./Background.css";

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  alpha: number;
  angle: number;
  radius: number;
}

interface EnergyPoint {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
}

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particles: Particle[] = [];
    const energyPoints: EnergyPoint[] = [];

    const PARTICLE_COUNT = 180;
    const ENERGY_COUNT = 36;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    window.addEventListener("resize", resize);

    /*
     * 创建空间粒子
     */
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random(),
        size: 0.5 + Math.random() * 2,
        speed: 0.0004 + Math.random() * 0.001,
        alpha: 0.15 + Math.random() * 0.7,
        angle: Math.random() * Math.PI * 2,
        radius: 0.25 + Math.random() * 0.8,
      });
    }

    /*
     * 创建 AI 能量轨道节点
     */
    for (let i = 0; i < ENERGY_COUNT; i++) {
      energyPoints.push({
        angle: (Math.PI * 2 * i) / ENERGY_COUNT,
        radius: 0.55 + Math.random() * 0.35,
        speed: 0.0004 + Math.random() * 0.001,
        size: 1 + Math.random() * 2,
        alpha: 0.25 + Math.random() * 0.6,
      });
    }

    /*
     * 星空 / 数据粒子
     */
    const drawParticles = (time: number) => {
      particles.forEach((p) => {
        p.z -= p.speed;

        if (p.z <= 0) {
          p.z = 1;
        }

        const perspective = 1 / (p.z * 2);

        const centerX = width / 2;
        const centerY = height * 0.46;

        const x = centerX + p.x * width * 0.55 * perspective;
        const y = centerY + p.y * height * 0.55 * perspective;

        if (x < -50 || x > width + 50 || y < -50 || y > height + 50) {
          return;
        }

        const size = p.size * perspective;

        const pulse = 0.65 + Math.sin(time * 0.002 + p.angle) * 0.35;

        ctx.beginPath();

        ctx.arc(x, y, size, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(100, 210, 255, ${p.alpha * pulse})`;

        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(60, 190, 255, 0.8)";

        ctx.fill();

        ctx.shadowBlur = 0;
      });
    };

    /*
     * 巨型 AI 能量环
     */
    const drawEnergyRings = (time: number) => {
      const cx = width / 2;
      const cy = height * 0.46;

      const base = Math.min(width, height) * 0.26;

      for (let i = 0; i < 4; i++) {
        const radius = base + i * Math.min(width, height) * 0.075;

        const rotation =
          time * (0.00008 + i * 0.00003) * (i % 2 === 0 ? 1 : -1);

        ctx.save();

        ctx.translate(cx, cy);

        ctx.rotate(rotation);

        ctx.beginPath();

        ctx.ellipse(
          0,
          0,
          radius,
          radius * (0.27 + i * 0.035),
          0,
          0,
          Math.PI * 2,
        );

        ctx.strokeStyle =
          i === 0 ? "rgba(100,220,255,0.20)" : "rgba(60,180,255,0.10)";

        ctx.lineWidth = i === 0 ? 1.5 : 1;

        ctx.setLineDash(i % 2 === 0 ? [3, 10 + i * 4] : [1, 16]);

        ctx.shadowBlur = 18;

        ctx.shadowColor = "rgba(50,180,255,0.35)";

        ctx.stroke();

        ctx.restore();
      }
    };

    /*
     * AI 神经网络
     */
    const drawNeuralNetwork = (time: number) => {
      const cx = width / 2;
      const cy = height * 0.46;

      const points: {
        x: number;
        y: number;
        r: number;
      }[] = [];

      const count = 42;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;

        const radius = Math.min(width, height) * (0.22 + (i % 4) * 0.035);

        const wave = Math.sin(time * 0.0008 + i * 0.7) * 12;

        points.push({
          x: cx + Math.cos(angle) * (radius + wave),
          y: cy + Math.sin(angle) * (radius * 0.48 + wave * 0.4),
          r: 1 + (i % 3) * 0.5,
        });
      }

      /*
       * 连线
       */
      for (let i = 0; i < points.length; i++) {
        const a = points[i];

        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 145) continue;

          const alpha = (1 - distance / 145) * 0.13;

          ctx.beginPath();

          ctx.moveTo(a.x, a.y);

          ctx.lineTo(b.x, b.y);

          ctx.strokeStyle = `rgba(70,190,255,${alpha})`;

          ctx.lineWidth = 0.7;

          ctx.stroke();
        }
      }

      /*
       * 节点
       */
      points.forEach((p, i) => {
        const pulse = 0.7 + Math.sin(time * 0.002 + i) * 0.3;

        ctx.beginPath();

        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(130,235,255,${0.4 * pulse})`;

        ctx.shadowBlur = 12;

        ctx.shadowColor = "rgba(80,210,255,0.8)";

        ctx.fill();

        ctx.shadowBlur = 0;
      });
    };

    /*
     * 能量节点沿轨道运行
     */
    const drawEnergyNodes = (time: number) => {
      const cx = width / 2;
      const cy = height * 0.46;

      const radius = Math.min(width, height) * 0.31;

      energyPoints.forEach((p) => {
        const angle = p.angle + time * p.speed;

        const x = cx + Math.cos(angle) * radius;

        const y = cy + Math.sin(angle) * radius * 0.32;

        ctx.beginPath();

        ctx.arc(x, y, p.size, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(110,225,255,${p.alpha})`;

        ctx.shadowBlur = 18;

        ctx.shadowColor = "rgba(60,200,255,0.9)";

        ctx.fill();

        ctx.shadowBlur = 0;
      });
    };

    /*
     * 底部未来科技地面
     */
    const drawFloor = () => {
      const horizon = height * 0.66;

      const gradient = ctx.createLinearGradient(0, horizon, 0, height);

      gradient.addColorStop(0, "rgba(20,100,170,0)");

      gradient.addColorStop(1, "rgba(10,80,150,0.16)");

      ctx.fillStyle = gradient;

      ctx.fillRect(0, horizon, width, height - horizon);

      /*
       * 横向网格
       */
      for (let i = 0; i < 12; i++) {
        const progress = i / 12;

        const y = horizon + Math.pow(progress, 1.8) * (height - horizon);

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(width, y);

        ctx.strokeStyle = `rgba(60,180,255,${0.025 + progress * 0.035})`;

        ctx.lineWidth = 1;

        ctx.stroke();
      }

      /*
       * 透视线
       */
      for (let i = -12; i <= 12; i++) {
        const bottomX = width / 2 + i * 100;

        ctx.beginPath();

        ctx.moveTo(width / 2, horizon);

        ctx.lineTo(bottomX, height);

        ctx.strokeStyle = "rgba(60,180,255,0.035)";

        ctx.lineWidth = 1;

        ctx.stroke();
      }
    };

    /*
     * 中央 AI 核心
     */
    const drawCore = (time: number) => {
      const cx = width / 2;
      const cy = height * 0.46;

      const radius = Math.min(width, height) * 0.11;

      const pulse = 1 + Math.sin(time * 0.0015) * 0.08;

      /*
       * 外部光晕
       */
      const gradient = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        radius * 2.2,
      );

      gradient.addColorStop(0, "rgba(100,225,255,0.17)");

      gradient.addColorStop(0.3, "rgba(50,160,255,0.08)");

      gradient.addColorStop(1, "rgba(0,50,120,0)");

      ctx.beginPath();

      ctx.arc(cx, cy, radius * 2.2 * pulse, 0, Math.PI * 2);

      ctx.fillStyle = gradient;

      ctx.fill();

      /*
       * 核心
       */
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

      coreGradient.addColorStop(0, "rgba(190,250,255,0.85)");

      coreGradient.addColorStop(0.08, "rgba(90,220,255,0.5)");

      coreGradient.addColorStop(0.35, "rgba(30,130,220,0.15)");

      coreGradient.addColorStop(1, "rgba(10,50,120,0)");

      ctx.beginPath();

      ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);

      ctx.fillStyle = coreGradient;

      ctx.fill();

      /*
       * 核心垂直光束
       */
      const beam = ctx.createLinearGradient(
        0,
        cy - radius * 3,
        0,
        cy + radius * 3,
      );

      beam.addColorStop(0, "rgba(80,210,255,0)");

      beam.addColorStop(0.5, "rgba(100,220,255,0.08)");

      beam.addColorStop(1, "rgba(80,210,255,0)");

      ctx.fillStyle = beam;

      ctx.fillRect(cx - 1, cy - radius * 3, 2, radius * 6);
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      drawFloor();

      drawParticles(time);

      drawNeuralNetwork(time);

      drawEnergyRings(time);

      drawEnergyNodes(time);

      drawCore(time);

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="bg-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="bg-canvas" />

      {/* CSS 光效 */}
      <div className="bg-top-glow" />

      <div className="bg-side-glow bg-side-glow-left" />

      <div className="bg-side-glow bg-side-glow-right" />

      {/* 巨型全息结构 */}
      <div className="bg-mega-ring bg-mega-ring-left" />

      <div className="bg-mega-ring bg-mega-ring-right" />

      {/* 中央扫描光 */}
      <div className="bg-center-beam" />

      {/* 顶部 HUD */}
      <div className="bg-hud-line bg-hud-line-left" />
      <div className="bg-hud-line bg-hud-line-right" />

      {/* 暗角 */}
      <div className="bg-vignette" />
    </div>
  );
}
