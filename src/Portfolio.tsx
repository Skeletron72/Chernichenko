import React, { useMemo, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import {
  Github,
  Mail,
  Download,
  ArrowRight,
  Database,
  BarChart2,
  Gamepad2,
  Award,
  Code2,
  Send,
  ArrowLeft,
} from "lucide-react";

// ------------------- SIMPLE RUNTIME TESTS -------------------
// Mini self-checks to catch data shape errors at runtime (harmless in production)
function runSelfTests({ skills, projects }: { skills: any[]; projects: any[] }) {
  console.assert(Array.isArray(skills) && skills.length >= 4, "[TEST] skills array must have items");
  console.assert(skills.every((s) => s && s.label), "[TEST] each skill must have a label");
  console.assert(Array.isArray(projects) && projects.length >= 3, "[TEST] projects must include 3 items");
  const ids = new Set(projects.map((p) => p.id));
  console.assert(ids.has("crm") && ids.has("game") && ids.has("etl"), "[TEST] expected project ids: crm, game, etl");
}

// ------------------- CUSTOM CURSOR (ARROW, AUTO-CONTRAST) -------------------
function FancyCursor() {
  // Arrow cursor that inverts on dark backgrounds and spawns radial lines from the tip on click.
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [down, setDown] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number; dist: number }[]>([]);

  useEffect(() => {
    // Heuristic: climb up from element under cursor and detect a dark section by classnames
    const isDarkBg = (el: HTMLElement | null): boolean => {
      let n: HTMLElement | null = el;
      while (n) {
        const cls = n.classList?.value || "";
        if (cls.includes("bg-black") || cls.includes("text-white") || cls.includes("bg-neutral-900")) return true;
        n = n.parentElement;
      }
      return false;
    };

    const mm = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      setIsDark(isDarkBg(el));
    };
    const md = () => setDown(true);
    const mu = () => setDown(false);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
    };
  }, []);

  // Spawn particles from the ARROW TIP on click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const count = 10;
      const created: { id: number; x: number; y: number; angle: number; dist: number }[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4; // небольшой рандом
        const dist = 36 + Math.random() * 28;
        created.push({ id: Date.now() + i, x: e.clientX, y: e.clientY, angle, dist });
      }
      setParticles((p) => [...p, ...created]);
      setTimeout(() => setParticles((p) => p.filter((pt) => !created.some((c) => c.id === pt.id))), 750);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const color = isDark ? "#fff" : "#000";
  const shadowFilter = isDark
    ? "drop-shadow(0 0 2px rgba(0,0,0,0.6))"
    : "drop-shadow(0 0 2px rgba(255,255,255,0.4))";

  return (
    <>
      {/* Click particles (auto-contrast) */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1 }}
            animate={{ x: p.x + Math.cos(p.angle) * p.dist, y: p.y + Math.sin(p.angle) * p.dist, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none fixed z-[60] block"
            style={{ left: 0, top: 0 }}
          >
            <span
              className="block"
              style={{
                width: 30,
                height: 2,
                borderRadius: 2,
                backgroundColor: color,
                transformOrigin: "left center",
                transform: `rotate(${(p.angle * 180) / Math.PI}deg) translateX(-6px)`,
                filter: shadowFilter,
              }}
            />
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Arrow cursor (auto-contrast) */}
      <motion.div
        className="pointer-events-none fixed z-[70]"
        style={{ left: pos.x, top: pos.y }}
        animate={{ scale: down ? 0.95 : 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 28 }}
      >
        {/* TIP at (0,0) to align with mouse coords */}
        <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ filter: shadowFilter }}>
          <path d="M0 0 L0 18 L5 13 L8 21 L11 20 L8 12 L16 12 Z" fill={color} stroke={color} strokeWidth="1" />
        </svg>
      </motion.div>
    </>
  );
}

// ------------------- ROOT -------------------
export default function Portfolio() {
  const [route, setRoute] = useState<{ page: "home" | "project"; id?: string }>({ page: "home" });

  // -------- DATA --------
  const skills = useMemo(
    () => [
      { icon: <Database className="h-5 w-5" />, label: "SQL" },
      { icon: <BarChart2 className="h-5 w-5" />, label: "Power BI" },
      { icon: <Code2 className="h-5 w-5" />, label: "Python (pandas)" },
      { icon: <Code2 className="h-5 w-5" />, label: "Excel (модели)" },
      { icon: <Github className="h-5 w-5" />, label: "Git / GitHub" },
      { icon: <Award className="h-5 w-5" />, label: "Командная работа" },
      { icon: <Gamepad2 className="h-5 w-5" />, label: "Игровые прототипы" },
      { icon: <Mail className="h-5 w-5" />, label: "Коммуникации" },
    ],
    []
  );

  const projects = useMemo(
    () => [
      { id: "crm", title: "Мини‑CRM для отдела продаж", desc: "Список сделок, статусы, воронка, задачи.", tag: "CRM" },
      { id: "game", title: "Игровой прототип (2D)", desc: "Экономика, баланс, сохранения, базовая ИИ‑логика.", tag: "Game" },
      { id: "etl", title: "ETL‑пайплайн данных", desc: "Парсинг → очистка → витрина; отчётность в Power BI.", tag: "Data" },
    ],
    []
  );

  useEffect(() => runSelfTests({ skills, projects }), [skills, projects]);

  // -------- HERO tilt (parallax-ish) --------
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rX = useTransform(y, [-30, 30], [6, -6]);
  const rY = useTransform(x, [-30, 30], [-6, 6]);
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-30, Math.min(30, dx / 6)));
    y.set(Math.max(-30, Math.min(30, dy / 6)));
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans cursor-none [*]:cursor-none">
      <FancyCursor />
      {route.page === "home" ? (
        <Home
          onOpen={(id) => setRoute({ page: "project", id })}
          skills={skills}
          projects={projects}
          handleMouseMove={handleMouseMove}
          rX={rX}
          rY={rY}
        />
      ) : (
        <ProjectPage id={route.id!} onBack={() => setRoute({ page: "home" })} />
      )}
    </div>
  );
}

// ------------------- HOME PAGE -------------------
function Home({ onOpen, skills, projects, handleMouseMove, rX, rY }: any) {
  return (
    <>
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-black/10">
        <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <a href="#top" className="text-xl font-semibold tracking-tight">Портфолио</a>
          <ul className="hidden md:flex items-center gap-8 text-sm">
            <li><a className="hover:underline" href="#skills">Навыки</a></li>
            <li><a className="hover:underline" href="#projects">Проекты</a></li>
            <li><a className="hover:underline" href="#experience">Опыт</a></li>
            <li><a className="hover:underline" href="#contact">Контакты</a></li>
          </ul>
          <a href="#resume" className="inline-flex items-center gap-2 rounded-2xl border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors">
            <Download className="h-4 w-4" /> Resume
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section id="top" className="mx-auto max-w-6xl px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl font-semibold leading-tight">
            Привет, я{' '}<span className="underline underline-offset-8 decoration-black">Андрей Черниченко</span>.
            <br />
            <span className="font-extrabold">Бизнес‑аналитик / Аналитик данных</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }} className="mt-5 max-w-xl text-sm md:text-base text-black/70">
            Магистрант Финансового университета («Бизнес‑информатика», 1 курс). Стажировка в Nestlé (аналитика продаж). Увлекаюсь спортом и разработкой игр.
          </motion.p>

          <div className="mt-6 flex items-center gap-3">
            <a href="#projects" className="inline-flex items-center gap-2 rounded-2xl bg-black text-white px-4 py-2 text-sm">Смотреть проекты <ArrowRight className="h-4 w-4" /></a>
            <a aria-label="GitHub" href="#" className="group grid place-items-center h-10 w-10 border border-black rounded-xl hover:bg-black hover:text-white transition-colors"><Github className="h-5 w-5 group-hover:scale-110 transition-transform" /></a>
            <a aria-label="Telegram" href="https://t.me/andrey_chernichenko" className="group grid place-items-center h-10 w-10 border border-black rounded-xl hover:bg-black hover:text-white transition-colors"><Send className="h-5 w-5 group-hover:rotate-12 transition-transform" /></a>
            <a aria-label="Mail" href="#contact" className="group grid place-items-center h-10 w-10 border border-black rounded-xl hover:bg-black hover:text-white transition-colors"><Mail className="h-5 w-5 group-hover:-rotate-6 transition-transform" /></a>
          </div>
        </div>

        {/* Illustration: provided PNG with subtle 3D tilt */}
        <motion.div className="relative" style={{ rotateX: rX, rotateY: rY }} onMouseMove={handleMouseMove}>
          <div className="w-full aspect-[4/3] grid place-items-center">
            <img src="./img/andrey-hero.png" alt="Андрей с ноутбуком" className="w-full max-h-96 object-contain" />
          </div>
        </motion.div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl font-semibold text-center"><span className="italic">Навыки</span></h2>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {skills.map((s: any, i: number) => {
            const rotation = i % 2 === 0 ? -2 : 2; // alternate tilt left/right on hover
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                whileHover={{ scale: 1.05, rotate: rotation }}
                className="rounded-2xl border border-black/30 p-4 hover:border-black transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 h-9 w-9 grid place-items-center rounded-xl border border-black/30">{s.icon}</span>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* EXPERIENCE (dark) */}
      <section id="experience" className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-semibold text-center"><span className="italic">Опыт</span></h2>
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {[
              { title: "Стажёр‑аналитик продаж — Nestlé", period: "6 месяцев", text: "Подготовка отчётности, визуализация, поддержка отдела продаж." },
              { title: "Бакалавриат — Финансовый университет", period: "2021 – 2025", text: "Бизнес‑информатика: проекты, кейсы." },
              { title: "Магистратура — Финансовый университет", period: "2025 – наст. время", text: "Цифровая трансформация, аналитика, проекты." },
              { title: "Хобби‑проекты", period: "ongoing", text: "Игры, хакатоны, аналитические пет‑проекты." },
            ].map((e, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{e.title}</h3>
                  <span className="text-xs text-white/70">{e.period}</span>
                </div>
                <p className="mt-2 text-sm text-white/80">{e.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-semibold text-center">Выбранные <span className="italic">проекты</span></h2>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {projects.map((p: any) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
              onClick={() => onOpen(p.id)}
              whileHover={{ scale: 1.02 }}
              className="group text-left rounded-2xl border border-black/20 p-5 hover:border-black transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs border border-black/30 rounded-full px-2 py-0.5">{p.tag}</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="mt-3 font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-black/70">{p.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-3xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border-2 border-black p-8 md:p-10"
        >
          <h2 className="text-2xl md:text-3xl font-semibold">Связаться</h2>
          <p className="mt-2 text-sm text-black/70">Открыт к стажировкам, junior‑позициям и совместным проектам.</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <a href="mailto:andrewche2003@gmail.com" className="rounded-2xl border border-black px-4 py-3 flex items-center gap-2 hover:bg-black hover:text-white transition-colors">
              <Mail className="h-4 w-4" /> andrewche2003@gmail.com
            </a>
            <a href="https://t.me/andrey_chernichenko" className="rounded-2xl border border-black px-4 py-3 flex items-center gap-2 hover:bg-black hover:text-white transition-colors">
              <Send className="h-4 w-4" /> @andrey_chernichenко
            </a>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 py-8">
        <div className="mx-auto max-w-6xl px-6 text-sm text-black/60 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Андрей Черниченко</span>
          <a id="resume" href="#" className="underline">Скачать резюме (PDF)</a>
        </div>
      </footer>
    </>
  );
}

// ------------------- PROJECT PAGE -------------------
function ProjectPage({ id, onBack }: { id: string; onBack: () => void }) {
  // Per-project content (title, bullet points, tech stack, screens)
  const content = React.useMemo(() => {
    switch (id) {
      case "crm":
        return {
          title: "Мини‑CRM для отдела продаж",
          bullets: [
            "Сделки: статусы, ответственные",
            "Воронка: стадии, конверсии",
            "Задачи: дедлайны, напоминания",
            "BI‑вью: прогноз и отчётность",
          ],
          tech: "Excel + Python + Power BI",
          screens: ["/screens/crm1.png", "/screens/crm2.png"],
        } as const;
      case "game":
        return {
          title: "Игровой прототип (2D)",
          bullets: ["Экономика ресурсов", "ИИ врагов", "UI‑меню, туториал", "Метрики удержания"],
          tech: "Game Engine + JS/TS",
          screens: ["/screens/game1.png", "/screens/game2.gif"],
        } as const;
      case "etl":
        return {
          title: "ETL‑пайплайн данных",
          bullets: ["Парсинг CSV/HTTP", "Очистка pandas", "Витрина SQLite/Parquet", "Дашборды Power BI"],
          tech: "Python (pandas, requests)",
          screens: ["/screens/etl1.png"],
        } as const;
      default:
        return { title: "Проект", bullets: ["Описание скоро"], tech: "", screens: [] } as const;
    }
  }, [id]);

  // extra guard tests (non-breaking)
  useEffect(() => {
    console.assert(content && content.title, "[TEST] project content must exist");
    console.assert(Array.isArray(content.screens), "[TEST] project screens must be array");
  }, [content]);

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white text-black">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-black/10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-black px-3 py-2 text-sm hover:bg-black hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Назад
          </button>
          <a href="#resume" className="inline-flex items-center gap-2 rounded-2xl border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white">
            <Download className="h-4 w-4" />
            Resume
          </a>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <motion.h1 initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl md:text-4xl font-semibold">
          {content.title}
        </motion.h1>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <ul className="space-y-2 text-sm">
            {content.bullets.map((b, i) => (
              <motion.li key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="pl-2">
                — {b}
              </motion.li>
            ))}
          </ul>
          <div className="rounded-2xl border-2 border-black p-5">
            <h3 className="font-semibold">Технологии</h3>
            <p className="mt-2 text-sm text-black/70">{content.tech}</p>
          </div>
        </div>

        {/* SCREENS GRID */}
        {content.screens.length > 0 && (
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {content.screens.map((src, i) => (
              <motion.div key={i} whileHover={{ scale: 1.03 }} className="rounded-2xl overflow-hidden border border-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${content.title} — скриншот ${i + 1}`} className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105" />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 py-8">
        <div className="mx-auto max-w-6xl px-6 text-sm text-black/60 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Андрей Черниченко</span>
          <a id="resume" href="#" className="underline">Скачать резюме (PDF)</a>
        </div>
      </footer>
    </motion.main>
  );
}
