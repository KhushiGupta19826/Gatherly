import { useCallback, useEffect, useMemo, useState } from "react";
import {
  analyticsApi,
  authApi,
  checkinsApi,
  getToken,
  goalsApi,
  roomsApi,
  sessionsApi,
  setOnUnauthorized,
  setToken,
} from "./services/api";

const paths = {
  arrow: (
    <>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </>
  ),
  bars: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),
  chevron: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
  door: (
    <>
      <path d="M4 21h16M6 21V4h12v17M14 13h.01" />
    </>
  ),
  edit: (
    <>
      <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10zM14 7l3 3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4M5 5h11l-2 4 2 4H5" />
    </>
  ),
  goals: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  minus: (
    <>
      <path d="M5 12h14" />
    </>
  ),
  pause: (
    <>
      <path d="M9 7v10M15 7v10" />
    </>
  ),
  play: (
    <>
      <path d="m9 7 8 5-8 5z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5zM18 16l.7 2.3L21 19l-2.3.7L18 22l-.7-2.3L15 19l2.3-.7z" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9 2h6M12 5V2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M16 5a3 3 0 0 1 0 6M18 13a4 4 0 0 1 4 4v2" />
    </>
  ),
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Logo({ light = false }) {
  return (
    <div className={`logo ${light ? "logo-light" : ""}`}>
      <span className="logo-mark">
        <i />
        <i />
        <i />
      </span>
      <span>FocusCircle</span>
    </div>
  );
}

function ArrowButton({
  children,
  onClick,
  secondary = false,
  className = "",
}) {
  return (
    <button
      className={`btn ${secondary ? "btn-secondary" : "btn-primary"} ${className}`}
      onClick={onClick}
    >
      <span>{children}</span>
      <Icon name="arrow" />
    </button>
  );
}

function Tag({
  children,
  tone = "green",
}) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

function Scene({
  kind = "library",
  label,
}) {
  if (kind === "timer")
    return (
      <div className="timer-sculpture" aria-label="Ambient 3D timer placeholder">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="sphere">
          <span />
        </div>
        <p>Ambient focus object · Canvas ready</p>
      </div>
    );
  const desks = kind === "library" ? 8 : 6;
  return (
    <div className={`scene scene-${kind}`} aria-label={`${kind} 3D environment placeholder`}>
      <div className="scene-label">
        <span className="live-dot" /> 3D environment · Canvas ready
      </div>
      <div className="scene-window">
        <i />
        <i />
        <i />
      </div>
      <div className="scene-back-wall" />
      <div className="scene-floor" />
      <div className="scene-sun" />
      <div className="scene-shelves">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="desks">
        {Array.from({ length: desks }).map((_, i) => (
          <div className={`desk desk-${i + 1}`} key={i}>
            <span />
            <b />
            <em className={i === 2 || i === 5 ? "dim" : ""} />
          </div>
        ))}
      </div>
      {label && <div className="scene-caption">{label}</div>}
    </div>
  );
}

function Landing({ go }) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <nav>
          <a href="#how">How it works</a>
          <button onClick={() => go("rooms")}>Study rooms</button>
          <a href="#features">Features</a>
        </nav>
        <div className="nav-actions">
          <button className="text-btn" onClick={() => go("login")}>
            Log in
          </button>
          <button className="compact-btn" onClick={() => go("register")}>
            Get started <Icon name="arrow" size={16} />
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span>01</span> ACCOUNTABILITY, BY DESIGN
            </div>
            <h1>
              Make your study
              <br />
              hours <em>count.</em>
            </h1>
            <p>
              Set intentions. Show up. Stay accountable. Turn focused sessions into measurable
              progress.
            </p>
            <div className="hero-actions">
              <ArrowButton onClick={() => go("register")}>Start focusing</ArrowButton>
              <button className="btn-link" onClick={() => go("rooms")}>
                Explore study rooms <Icon name="arrow" />
              </button>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                <span>MJ</span>
                <span>AK</span>
                <span>SR</span>
                <span>+</span>
              </div>
              <p>
                <strong>2,840</strong> students focused this week
              </p>
            </div>
          </div>
          <div className="hero-visual">
            <Scene kind="library" label="A quiet place to do the work." />
          </div>
          <div className="hero-note">
            <span>FOCUS PRINCIPLE № 01</span>
            <p>Make the commitment visible, then make the work inevitable.</p>
          </div>
        </section>

        <section className="manifesto">
          <p className="section-index">02 / THE IDEA</p>
          <p className="manifesto-text">
            Motivation changes daily.
            <br />A clear commitment <em>doesn’t.</em>
          </p>
          <p className="manifesto-aside">
            FocusCircle closes the gap between what you plan and what you actually do — without
            noise, pressure, or performative productivity.
          </p>
        </section>

        <section className="workflow" id="how">
          <div className="section-heading">
            <div>
              <p className="section-index">03 / THE METHOD</p>
              <h2>
                One deliberate loop.
                <br />
                Repeated daily.
              </h2>
            </div>
            <p>
              A simple five-step rhythm that turns good intentions into an honest record of
              progress.
            </p>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Set a goal",
                "Define exactly what you intend to finish and how long you’ll focus.",
              ],
              ["02", "Enter a room", "Choose a quiet shared space with students doing the same."],
              ["03", "Focus deeply", "Start the clock. One goal, one session, zero distractions."],
              ["04", "Check in", "Record what happened — honestly, quickly, without judgment."],
              [
                "05",
                "See the pattern",
                "Compare commitment to reality and improve your next session.",
              ],
            ].map((s, i) => (
              <article className={`step ${i === 2 ? "featured-step" : ""}`} key={s[0]}>
                <span>{s[0]}</span>
                <div className="step-icon">
                  <Icon
                    name={["flag", "door", "timer", "check", "chart"][i]}
                    size={24}
                  />
                </div>
                <h3>{s[1]}</h3>
                <p>{s[2]}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="comparison">
          <div className="comparison-copy">
            <p className="section-index light">04 / HONEST PROGRESS</p>
            <h2>
              The gap is
              <br />
              where growth lives.
            </h2>
            <p>
              We don’t reward perfect plans. We help you understand the difference between your
              intention and your outcome.
            </p>
            <div className="quote">
              “I planned five problems. I solved four. Tomorrow’s plan will be better because I know
              why.”<span>— Alex, 14 day focus streak</span>
            </div>
          </div>
          <div className="comparison-card">
            <div className="comparison-top">
              <div>
                <span>TODAY’S COMMITMENT</span>
                <h3>Dynamic Programming</h3>
              </div>
              <Tag>Completed</Tag>
            </div>
            <div className="commit-numbers">
              <div>
                <small>PLANNED</small>
                <strong>5</strong>
                <span>DSA problems</span>
              </div>
              <div className="versus">VS</div>
              <div>
                <small>ACTUAL</small>
                <strong>4</strong>
                <span>DSA problems</span>
              </div>
            </div>
            <div className="commit-bar">
              <span style={{ width: "80%" }} />
            </div>
            <div className="commit-footer">
              <span>
                <Icon name="clock" /> 45 of 50 minutes
              </span>
              <b>80% achieved</b>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <div className="section-heading">
            <div>
              <p className="section-index">05 / THE SYSTEM</p>
              <h2>
                Everything you need.
                <br />
                Nothing you don’t.
              </h2>
            </div>
          </div>
          <div className="feature-grid">
            {[
              [
                "goals",
                "Goals with edges",
                "Quantity, duration, and a clear finish line. No vague to-do lists.",
              ],
              [
                "users",
                "Quiet study rooms",
                "Work alongside others without turning focus into a social feed.",
              ],
              [
                "timer",
                "Purposeful sessions",
                "A restrained timer that keeps the goal — not the clock — in view.",
              ],
              [
                "check",
                "Honest check-ins",
                "A brief reflection creates an accurate record of every session.",
              ],
              [
                "chart",
                "Readable analytics",
                "See consistency, focus time, and commitment accuracy at a glance.",
              ],
            ].map((f, i) => (
              <article className={`feature f-${i}`} key={f[1]}>
                <span className="feature-number">0{i + 1}</span>
                <div className="feature-icon">
                  <Icon name={f[0]} size={26} />
                </div>
                <h3>{f[1]}</h3>
                <p>{f[2]}</p>
                {i === 0 && (
                  <div className="mini-goal">
                    <span>REVISION</span>
                    <strong>30 pages</strong>
                    <i>
                      <b />
                    </i>
                  </div>
                )}
                {i === 4 && (
                  <div className="mini-chart">
                    {[30, 55, 42, 77, 68, 90, 82].map((v, j) => (
                      <i key={j} style={{ height: `${v}%` }} />
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <span className="circle-copy">FC</span>
          <p className="section-index light">06 / BEGIN</p>
          <h2>
            Your next focused hour
            <br />
            starts with one <em>clear intention.</em>
          </h2>
          <ArrowButton onClick={() => go("register")} className="light-button">
            Create your focus plan
          </ArrowButton>
        </section>
      </main>
      <footer>
        <Logo />
        <p>Quiet accountability for meaningful work.</p>
        <div>
          <a href="#how">Method</a>
          <button onClick={() => go("rooms")}>Rooms</button>
          <a href="#features">Features</a>
          <button onClick={() => go("login")}>Sign in</button>
        </div>
        <span>© 2026 FocusCircle</span>
      </footer>
    </div>
  );
}

function Auth({ mode, go, onAuthSuccess }) {
  const register = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (register && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = register
        ? await authApi.register({ name, email, password })
        : await authApi.login({ email, password });
      setToken(res.token);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <button className="auth-logo" onClick={() => go("landing")}>
        <Logo />
      </button>
      <div className="auth-art">
        <div className="auth-quote">
          <span>FOCUS NOTE № 04</span>
          <blockquote>“The secret of getting ahead is getting started.”</blockquote>
          <p>MARK TWAIN</p>
        </div>
        <div className="auth-geometry">
          <i />
          <i />
          <i />
          <i />
        </div>
        <p className="auth-caption">A quieter way to build momentum.</p>
      </div>
      <div className="auth-panel">
        <button className="back-button" onClick={() => go("landing")}>
          <Icon name="arrow" /> Back to home
        </button>
        <form className="auth-form" onSubmit={submit}>
          <p className="section-index">{register ? "NEW ACCOUNT" : "WELCOME BACK"}</p>
          <h1>{register ? "Start with intention." : "Continue your work."}</h1>
          <p>
            {register
              ? "Create your space for quiet, accountable study."
              : "Your goals and study rooms are waiting."}
          </p>
          {error && (
            <p style={{ color: "#b66b48", fontSize: "13px", marginBottom: "12px", fontWeight: 500 }}>
              {error}
            </p>
          )}
          {register && (
            <label>
              Full name
              <input
                required
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <div className="password-wrap">
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Icon name="eye" />
            </div>
          </label>
          {register && (
            <label>
              Confirm password
              <input
                required
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          )}
          {!register && (
            <div className="form-options">
              <label className="checkbox">
                <input type="checkbox" />
                <span>
                  <Icon name="check" size={13} />
                </span>
                Remember me
              </label>
              <button type="button">Forgot password?</button>
            </div>
          )}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait..." : register ? "Create account" : "Log in"}{" "}
            <Icon name="arrow" />
          </button>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to FocusCircle?"}{" "}
            <button type="button" onClick={() => go(register ? "login" : "register")}>
              {register ? "Log in" : "Create an account"}
            </button>
          </p>
        </form>
        <p className="terms">
          {register
            ? "By creating an account, you agree to our Terms and Privacy Policy."
            : "Protected by thoughtful security, not distractions."}
        </p>
      </div>
    </div>
  );
}

const navItems = [
  ["dashboard", "grid", "Overview"],
  ["goals", "goals", "My goals"],
  ["rooms", "users", "Study rooms"],
  ["focus", "timer", "Focus sessions"],
  ["analytics", "chart", "Analytics"],
  ["settings", "settings", "Settings"],
];

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("") || "FC";
}

function AppShell({
  page,
  go,
  user,
  weeklyMinutes = 0,
  children,
}) {
  const [menu, setMenu] = useState(false);
  const initials = getInitials(user?.name);
  const hrs = Math.floor(weeklyMinutes / 60);
  const mins = weeklyMinutes % 60;
  const pct = Math.min(100, Math.round((weeklyMinutes / 600) * 100));
  return (
    <div className="app-shell">
      <aside className={menu ? "open" : ""}>
        <div className="side-logo">
          <Logo />
          <button onClick={() => setMenu(false)}>
            <Icon name="close" />
          </button>
        </div>
        <nav>
          {navItems.map(([p, icon, label]) => (
            <button
              key={p}
              className={
                page === p ||
                (page === "room" && p === "rooms") ||
                (page === "checkin" && p === "focus")
                  ? "active"
                  : ""
              }
              onClick={() => {
                go(p);
                setMenu(false);
              }}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-focus">
          <span>WEEKLY FOCUS</span>
          <div>
            <strong>{hrs}h {mins}m</strong>
            <small>of 10h goal</small>
          </div>
          <i>
            <b style={{ width: `${pct}%` }} />
          </i>
          <p>{pct}% of your 10h goal</p>
        </div>
        <button className="profile" onClick={() => go("settings")}>
          <span>{initials}</span>
          <div>
            <strong>{user?.name || "Student"}</strong>
            <small>{user?.email || ""}</small>
          </div>
          <Icon name="chevron" />
        </button>
      </aside>
      {menu && <button className="sidebar-scrim" onClick={() => setMenu(false)} />}
      <main className="app-main">
        <header className="mobile-header">
          <button onClick={() => setMenu(true)}>
            <Icon name="bars" />
          </button>
          <Logo />
          <span>{initials}</span>
        </header>
        {children}
      </main>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}) {
  return (
    <header className="page-header">
      <div>
        <p className="section-index">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

function Metric({
  label,
  value,
  note,
  icon,
  tone = "",
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <Icon name={icon} />
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

const sessions = [
  {
    subject: "Data Structures",
    goal: "Solve 5 dynamic programming problems",
    time: "45 min",
    score: "4 / 5",
    date: "Today, 10:20",
  },
  {
    subject: "DBMS",
    goal: "Complete normalization chapter",
    time: "52 min",
    score: "Completed",
    date: "Yesterday, 16:10",
  },
  {
    subject: "Operating Systems",
    goal: "Revise process scheduling notes",
    time: "38 min",
    score: "24 / 30 pages",
    date: "Mon, 09:30",
  },
];

function formatDuration(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

function Dashboard({ go, user, onSummaryLoaded }) {
  const [analytics, setAnalytics] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([analyticsApi.me(), goalsApi.list()])
      .then(([analyticsData, goalsData]) => {
        if (!active) return;
        setAnalytics(analyticsData);
        setGoals(goalsData);
        if (onSummaryLoaded && analyticsData?.summary) {
          onSummaryLoaded(analyticsData.summary);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [onSummaryLoaded]);

  const summary = analytics?.summary || {
    totalGoals: 0,
    completedGoals: 0,
    totalSessions: 0,
    totalCheckIns: 0,
    totalStudyTimeMinutes: 0,
  };
  const activeGoals = goals.filter((g) => !g.completed);
  const nextGoal = activeGoals[0];
  const completionRate =
    summary.totalGoals > 0
      ? Math.round((summary.completedGoals / summary.totalGoals) * 100)
      : 0;
  const firstName = user?.name?.split(" ")[0] || "there";
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).toUpperCase();

  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow={todayStr}
        title={`Good afternoon, ${firstName}.`}
        subtitle={
          loading
            ? "Loading your focus summary..."
            : activeGoals.length > 0
              ? `You have ${activeGoals.length} active goal${activeGoals.length > 1 ? "s" : ""} to focus on.`
              : "Create a goal or join a study room to begin."
        }
        action={
          <button className="icon-button" onClick={() => go("analytics")}>
            <Icon name="calendar" />
          </button>
        }
      />
      <section className="today-card">
        <div className="today-meta">
          <span>TODAY’S COMMITMENT</span>
          <Tag tone="orange">{nextGoal ? "Ready to focus" : "No active goal"}</Tag>
        </div>
        <div className="today-content">
          <div className="today-number">01</div>
          <div>
            <small>FOCUS GOAL</small>
            <h2>
              {nextGoal ? nextGoal.title : "Set your next study goal"}
            </h2>
            <p>
              <Icon name="clock" />{" "}
              {nextGoal?.targetDate
                ? `Target: ${new Date(nextGoal.targetDate).toLocaleDateString()}`
                : "No target date set"}
            </p>
          </div>
        </div>
        <button className="start-focus" onClick={() => go(nextGoal ? "rooms" : "goals")}>
          <span>
            <Icon name="play" />
          </span>{" "}
          {nextGoal ? "Enter a study room" : "Create a goal"} <Icon name="arrow" />
        </button>
        <div className="today-decor">FOCUS</div>
      </section>
      <section className="metrics-grid">
        <Metric
          label="TOTAL FOCUS"
          value={formatDuration((summary.totalStudyTimeMinutes || 0) * 60)}
          note={`${summary.totalSessions} session${summary.totalSessions === 1 ? "" : "s"} joined`}
          icon="clock"
        />
        <Metric
          label="COMPLETION RATE"
          value={`${completionRate}%`}
          note={`${summary.completedGoals} of ${summary.totalGoals} goals`}
          icon="check"
        />
        <Metric
          label="CHECK-INS"
          value={`${summary.totalCheckIns}`}
          note="Completed reflections"
          icon="spark"
          tone="olive"
        />
        <Metric
          label="ACTIVE GOALS"
          value={`${activeGoals.length}`}
          note={`${summary.completedGoals} completed`}
          icon="flag"
        />
      </section>
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <span>RECENT WORK</span>
            <h3>Your latest sessions</h3>
          </div>
          <button onClick={() => go("analytics")}>
            View all <Icon name="arrow" />
          </button>
        </div>
        <SessionTable recentSessions={analytics?.recentSessions || []} />
      </section>
    </div>
  );
}

function SessionTable({ recentSessions = [] }) {
  if (!recentSessions.length) {
    return (
      <p style={{ color: "var(--muted)", padding: "16px 0", fontSize: "14px" }}>
        No study sessions recorded yet. Join a room and start a focus session to see your history.
      </p>
    );
  }
  return (
    <div className="session-table">
      <div className="table-row table-head">
        <span>ROOM</span>
        <span>FOCUS TIME</span>
        <span>CHECK-IN</span>
        <span>WHEN</span>
      </div>
      {recentSessions.map((p, i) => (
        <div className="table-row" key={p._id || i}>
          <span>
            <i className={`subject-dot dot-${i % 3}`} />
            <span>
              <small>{p.session?.room?.code || "ROOM"}</small>
              <strong>{p.session?.room?.name || "Study Session"}</strong>
            </span>
          </span>
          <span>{formatDuration(p.session?.duration || 0)}</span>
          <span>
            <Tag tone={p.checkIn ? "green" : "gray"}>
              {p.checkIn ? "Checked in" : "Pending"}
            </Tag>
          </span>
          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}

const initialGoals = [
  {
    id: 1,
    subject: "DATA STRUCTURES",
    title: "Solve 5 DSA problems",
    target: "5 problems",
    duration: "50 min",
    progress: 80,
    status: "In progress",
    color: "green",
  },
  {
    id: 2,
    subject: "DATABASE SYSTEMS",
    title: "Complete 2 DBMS chapters",
    target: "2 chapters",
    duration: "90 min",
    progress: 50,
    status: "In progress",
    color: "orange",
  },
  {
    id: 3,
    subject: "OPERATING SYSTEMS",
    title: "Revise 30 pages of notes",
    target: "30 pages",
    duration: "60 min",
    progress: 100,
    status: "Completed",
    color: "olive",
  },
];

function Goals() {
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState("active");
  const [modal, setModal] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await goalsApi.list();
      setGoals(data);
    } catch (err) {
      setError(err.message || "Failed to load goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const toggleComplete = async (goal) => {
    try {
      await goalsApi.update(goal._id, { completed: !goal.completed });
      fetchGoals();
    } catch (err) {
      setError(err.message || "Failed to update goal.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await goalsApi.remove(id);
      fetchGoals();
    } catch (err) {
      setError(err.message || "Failed to delete goal.");
    }
  };

  const activeCount = goals.filter((g) => !g.completed).length;
  const completedCount = goals.filter((g) => g.completed).length;
  const visibleGoals = goals.filter((g) => {
    if (filter === "active") return !g.completed;
    if (filter === "completed") return g.completed;
    return true;
  });

  return (
    <div className="page goals-page">
      <PageHeader
        eyebrow="GOALS / PERSONAL"
        title="My goals"
        subtitle="Define the work before you begin it."
        action={
          <button
            className="primary-action"
            onClick={() => {
              setEditingGoal(null);
              setModal("create");
            }}
          >
            <Icon name="plus" /> Create goal
          </button>
        }
      />
      <div className="filter-row">
        <div>
          <button
            className={filter === "active" ? "selected" : ""}
            onClick={() => setFilter("active")}
          >
            Active <span>{activeCount}</span>
          </button>
          <button
            className={filter === "completed" ? "selected" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed <span>{completedCount}</span>
          </button>
          <button
            className={filter === "all" ? "selected" : ""}
            onClick={() => setFilter("all")}
          >
            All goals
          </button>
        </div>
      </div>
      {error && (
        <p style={{ color: "#b66b48", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
      )}
      <section className="goals-list">
        {loading ? (
          <p style={{ color: "var(--muted)", padding: "16px 0" }}>Loading goals...</p>
        ) : visibleGoals.length === 0 ? (
          <p style={{ color: "var(--muted)", padding: "16px 0" }}>
            No goals in this view yet.
          </p>
        ) : (
          visibleGoals.map((g, i) => (
            <article
              className={`goal-row goal-${g.completed ? "olive" : i % 2 === 0 ? "green" : "orange"}`}
              key={g._id}
            >
              <div className="goal-index">0{i + 1}</div>
              <div className="goal-main">
                <div>
                  <span>GOAL</span>
                  {g.completed && <Tag>Completed</Tag>}
                </div>
                <h2>{g.title}</h2>
                <div className="goal-details">
                  <span>
                    <Icon name="calendar" />{" "}
                    {g.targetDate
                      ? `Target: ${new Date(g.targetDate).toLocaleDateString()}`
                      : "No target date"}
                  </span>
                </div>
              </div>
              <div className="goal-progress">
                <div>
                  <span>STATUS</span>
                  <strong>{g.completed ? "100%" : "0%"}</strong>
                </div>
                <i>
                  <b style={{ width: g.completed ? "100%" : "0%" }} />
                </i>
                <small>{g.completed ? "Completed" : "In progress"}</small>
              </div>
              <div className="goal-actions">
                <button
                  aria-label={g.completed ? "Mark active" : "Mark completed"}
                  title={g.completed ? "Mark active" : "Mark completed"}
                  onClick={() => toggleComplete(g)}
                >
                  <Icon name="check" />
                </button>
                <button
                  aria-label="Edit goal"
                  onClick={() => {
                    setEditingGoal(g);
                    setModal("edit");
                  }}
                >
                  <Icon name="edit" />
                </button>
                <button
                  aria-label="Delete goal"
                  title="Delete goal"
                  onClick={() => handleDelete(g._id)}
                >
                  <Icon name="close" />
                </button>
              </div>
            </article>
          ))
        )}
        <button
          className="new-goal-row"
          onClick={() => {
            setEditingGoal(null);
            setModal("create");
          }}
        >
          <span>
            <Icon name="plus" />
          </span>
          <div>
            <strong>Create another goal</strong>
            <small>Make your next commitment specific and measurable.</small>
          </div>
          <Icon name="arrow" />
        </button>
      </section>
      {modal && (
        <GoalModal
          mode={modal}
          goal={editingGoal}
          close={() => setModal(null)}
          onSaved={fetchGoals}
        />
      )}
    </div>
  );
}

function GoalModal({ mode, goal, close, onSaved }) {
  const [title, setTitle] = useState(goal?.title || "");
  const [targetDate, setTargetDate] = useState(
    goal?.targetDate ? new Date(goal.targetDate).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (mode === "edit" && goal?._id) {
        await goalsApi.update(goal._id, {
          title,
          targetDate: targetDate || null,
        });
      } else {
        await goalsApi.create({
          title,
          targetDate: targetDate || null,
        });
      }
      onSaved();
      close();
    } catch (err) {
      setError(err.message || "Failed to save goal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <form
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-heading">
          <div>
            <p className="section-index">
              {mode === "create" ? "NEW COMMITMENT" : "EDIT COMMITMENT"}
            </p>
            <h2>{mode === "create" ? "Create a clear goal." : "Refine your goal."}</h2>
          </div>
          <button type="button" onClick={close}>
            <Icon name="close" />
          </button>
        </div>
        {error && (
          <p style={{ color: "#b66b48", fontSize: "13px", marginBottom: "8px" }}>{error}</p>
        )}
        <label>
          Goal title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Solve 5 dynamic programming problems"
          />
        </label>
        <label>
          Target date
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </label>
        <div className="modal-note">
          <Icon name="spark" />
          <p>
            <strong>Make it measurable</strong>
            <br />
            Clear targets make your post-session check-in more useful.
          </p>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : mode === "create" ? "Create goal" : "Save changes"}{" "}
            <Icon name="arrow" />
          </button>
        </div>
      </form>
    </div>
  );
}

const rooms = [
  {
    name: "The Reading Hall",
    subject: "All subjects",
    host: "Maya J.",
    people: 18,
    capacity: 24,
    note: "Long, quiet sessions for deep study.",
    tone: "forest",
  },
  {
    name: "CS Problem Lab",
    subject: "Computer Science",
    host: "Rohan K.",
    people: 9,
    capacity: 12,
    note: "Algorithms, systems, and focused problem solving.",
    tone: "orange",
  },
  {
    name: "Morning Revision",
    subject: "Exam prep",
    host: "Leah S.",
    people: 6,
    capacity: 10,
    note: "Start early. Review deliberately.",
    tone: "olive",
  },
  {
    name: "Library After Dark",
    subject: "All subjects",
    host: "Noah P.",
    people: 21,
    capacity: 30,
    note: "A late session with low ambient noise.",
    tone: "dark",
  },
];

function Rooms({ go, onSelectRoom }) {
  const [roomsList, setRoomsList] = useState([]);
  const [create, setCreate] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await roomsApi.list();
      setRoomsList(data);
    } catch (err) {
      setError(err.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setError("");
    try {
      const room = await roomsApi.join(joinCode.trim());
      setJoinCode("");
      await fetchRooms();
      onSelectRoom(room._id);
      go("room");
    } catch (err) {
      setError(err.message || "Failed to join room.");
    }
  };

  const filteredRooms = roomsList.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase())
  );
  const tones = ["forest", "orange", "olive", "dark"];

  return (
    <div className="page rooms-page">
      <PageHeader
        eyebrow="SHARED FOCUS SPACES"
        title="Study rooms"
        subtitle="A quiet sense of company, without the noise."
        action={
          <button className="primary-action" onClick={() => setCreate(true)}>
            <Icon name="plus" /> Create room
          </button>
        }
      />
      <div className="room-toolbar">
        <div className="search-box">
          <Icon name="search" />
          <input
            placeholder="Search your rooms"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <form onSubmit={handleJoinByCode} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            style={{
              padding: "10px 14px",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              fontSize: "13px",
              textTransform: "uppercase",
            }}
          />
          <button type="submit" className="primary-action">
            Join by code <Icon name="arrow" />
          </button>
        </form>
      </div>
      {error && (
        <p style={{ color: "#b66b48", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
      )}
      {loading ? (
        <p style={{ color: "var(--muted)", padding: "16px 0" }}>Loading rooms...</p>
      ) : filteredRooms.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "16px 0" }}>
          No rooms found. Create a study room or join one using a room code.
        </p>
      ) : (
        <section className="rooms-grid">
          {filteredRooms.map((r, i) => (
            <article className={`room-card ${tones[i % tones.length]}`} key={r._id}>
              <div className="room-card-top">
                <span className="room-no">0{i + 1}</span>
                <span>
                  <i /> Code: {r.code}
                </span>
              </div>
              <div className="room-preview">
                <div className="mini-desks">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <span className="room-subject">STUDY ROOM</span>
              <h3>{r.name}</h3>
              <p>Share code <strong>{r.code}</strong> to invite others.</p>
              <div className="room-card-meta">
                <span>
                  Hosted by <strong>{r.owner?.name || "Member"}</strong>
                </span>
                <span>
                  <Icon name="users" /> {r.members?.length || 1} members
                </span>
              </div>
              <button
                onClick={() => {
                  onSelectRoom(r._id);
                  go("room");
                }}
              >
                Enter room <Icon name="arrow" />
              </button>
            </article>
          ))}
        </section>
      )}
      {create && <RoomModal close={() => setCreate(false)} onCreated={fetchRooms} />}
    </div>
  );
}

function RoomModal({ close, onCreated }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await roomsApi.create({ name });
      onCreated();
      close();
    } catch (err) {
      setError(err.message || "Failed to create room.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <form
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-heading">
          <div>
            <p className="section-index">NEW SHARED SPACE</p>
            <h2>Create a study room.</h2>
          </div>
          <button type="button" onClick={close}>
            <Icon name="close" />
          </button>
        </div>
        {error && (
          <p style={{ color: "#b66b48", fontSize: "13px", marginBottom: "8px" }}>{error}</p>
        )}
        <label>
          Room name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Algorithms Reading Room"
          />
        </label>
        <div className="modal-note">
          <Icon name="spark" />
          <p>
            <strong>Invite code generated automatically</strong>
            <br />
            Share the 6-character code with peers so they can join your room.
          </p>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create room"} <Icon name="arrow" />
          </button>
        </div>
      </form>
    </div>
  );
}

function RoomDetail({ go, roomId, onStartSession }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }
    let active = true;
    roomsApi
      .get(roomId)
      .then((data) => {
        if (active) setRoom(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load room.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [roomId]);

  const handleStartFocus = async () => {
    if (!room) return;
    setStarting(true);
    setError("");
    try {
      const existingSessions = await sessionsApi.byRoom(room._id);
      let session = existingSessions.find((s) => s.status === "active");
      if (!session) {
        session = await sessionsApi.start(room._id);
      }
      try {
        await checkinsApi.join(session._id);
      } catch (joinErr) {
        if (!joinErr.message?.toLowerCase().includes("already joined")) {
          throw joinErr;
        }
      }
      onStartSession(session);
      go("focus");
    } catch (err) {
      setError(err.message || "Could not start focus session.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="page room-detail-page"><p>Loading room...</p></div>;
  }

  if (!room) {
    return (
      <div className="page room-detail-page">
        <p style={{ color: "var(--muted)" }}>No room selected.</p>
        <button className="primary-action" onClick={() => go("rooms")}>
          Back to rooms <Icon name="arrow" />
        </button>
      </div>
    );
  }

  return (
    <div className="page room-detail-page">
      <div className="room-detail-head">
        <button onClick={() => go("rooms")}>
          <Icon name="arrow" /> All rooms
        </button>
        <div>
          <Tag>Code: {room.code}</Tag>
          <span>
            <i className="active-pulse" /> {room.members?.length || 1} members
          </span>
        </div>
      </div>
      <PageHeader
        eyebrow={`ROOM CODE · ${room.code}`}
        title={room.name}
        subtitle={`Hosted by ${room.owner?.name || "Member"}`}
        action={
          <button className="secondary-action" onClick={() => go("rooms")}>
            <Icon name="door" /> Leave view
          </button>
        }
      />
      {error && (
        <p style={{ color: "#b66b48", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
      )}
      <section className="room-environment">
        <Scene kind="room" label={`Shared study environment · Code ${room.code}`} />
        <div className="environment-note">
          <span>ROOM ETIQUETTE</span>
          <p>Set a clear goal. Work quietly. Check in honestly.</p>
        </div>
      </section>
      <section className="room-lower">
        <article className="your-station panel">
          <div className="panel-heading">
            <div>
              <span>YOUR STATION</span>
              <h3>Ready when you are.</h3>
            </div>
            <span className="station-no">{room.code}</span>
          </div>
          <button className="station-start" onClick={handleStartFocus} disabled={starting}>
            <span>
              <Icon name="play" />
            </span>{" "}
            {starting ? "Starting session..." : "Start focus session"} <Icon name="arrow" />
          </button>
        </article>
        <article className="participants panel">
          <div className="panel-heading">
            <div>
              <span>IN THE ROOM</span>
              <h3>{room.members?.length || 1} members</h3>
            </div>
          </div>
          <div className="participant-list">
            {(room.members || []).map((m) => (
              <div key={m._id}>
                <span className="participant-avatar">
                  {getInitials(m.name)}
                  <i className="active" />
                </span>
                <span>
                  <strong>{m.name}</strong>
                  <small>{m.email}</small>
                </span>
                <Tag tone="green">Member</Tag>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function FocusSession({ go, activeSession, onSessionEnded }) {
  const [plannedSeconds, setPlannedSeconds] = useState(50 * 60);
  const [seconds, setSeconds] = useState(50 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const id = window.setInterval(() => {
      setSeconds((s) => s - 1);
      setElapsedSeconds((e) => e + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, seconds]);

  const finishAndCheckin = async () => {
    setEnding(true);
    try {
      if (activeSession?._id && activeSession.status !== "completed") {
        const updated = await sessionsApi.end(activeSession._id);
        onSessionEnded(updated);
      }
    } catch {
      // Session may already be ended by another participant
    } finally {
      setEnding(false);
      go("checkin");
    }
  };

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const progress = plannedSeconds > 0 ? ((plannedSeconds - seconds) / plannedSeconds) * 100 : 0;

  return (
    <div className="focus-page">
      <header className="focus-header">
        <Logo light />
        <div>
          <span className="live-dot" /> {activeSession?.room?.name || "Focus Session"}
        </div>
        <button onClick={() => setConfirm(true)}>Exit session</button>
      </header>
      <main className="focus-layout">
        <div className="focus-context">
          <p className="section-index light">CURRENT SESSION</p>
          <span>{activeSession?.room?.code ? `ROOM ${activeSession.room.code}` : "DEEP WORK"}</span>
          <h1>
            {activeSession?.room?.name || "Focused Study Session"}
          </h1>
          <div className="focus-context-meta">
            <span>
              <Icon name="clock" /> Elapsed: {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
            </span>
          </div>
        </div>
        <div className="timer-area">
          <TimerRing progress={progress} time={time} running={running} />
          <div className="timer-controls">
            <button
              aria-label="Subtract one minute"
              onClick={() => {
                setSeconds((s) => Math.max(60, s - 60));
                setPlannedSeconds((p) => Math.max(60, p - 60));
              }}
              disabled={running}
            >
              <Icon name="minus" />
            </button>
            <button className="main-control" onClick={() => setRunning((r) => !r)}>
              {running ? <Icon name="pause" size={28} /> : <Icon name="play" size={28} />}
            </button>
            <button
              aria-label="Add one minute"
              onClick={() => {
                setSeconds((s) => s + 60);
                setPlannedSeconds((p) => p + 60);
              }}
              disabled={running}
            >
              <Icon name="plus" />
            </button>
          </div>
          <p className="timer-state">
            {running
              ? "Session in progress · Stay with the work"
              : "Session paused · Your progress is saved"}
          </p>
          <button className="finish-session" onClick={finishAndCheckin} disabled={ending}>
            {ending ? "Ending session..." : "Finish session"} <Icon name="arrow" />
          </button>
        </div>
        <div className="ambient-area">
          <TimerSculptureWithNote />
          <div className="focus-note">
            <span>FOCUS NOTE</span>
            <p>
              Do the next clear thing.
              <br />
              Then the next.
            </p>
          </div>
        </div>
      </main>
      <footer className="focus-footer">
        <span>ACTIVE SESSION</span>
        <span>Distractions hidden · Check-in required on finish</span>
      </footer>
      {confirm && (
        <div className="modal-backdrop">
          <div className="confirm-dialog">
            <Icon name="door" size={28} />
            <h2>Leave this session?</h2>
            <p>Your elapsed focus time will be saved, and you’ll continue to the check-in.</p>
            <div>
              <button onClick={() => setConfirm(false)}>Keep focusing</button>
              <button onClick={finishAndCheckin} disabled={ending}>
                {ending ? "Saving..." : "Leave & check in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimerRing({
  progress,
  time,
  running,
}) {
  return (
    <div
      className="timer-ring"
      style={{ "--progress": `${Math.max(progress, 1)}%` }}
    >
      <div>
        <span>{running ? "FOCUSING" : progress > 1 ? "PAUSED" : "PLANNED TIME"}</span>
        <strong>{time}</strong>
        <small>
          {running ? "minutes remaining" : progress > 1 ? "elapsed session" : "50 minute session"}
        </small>
      </div>
    </div>
  );
}

function TimerSculptureWithNote() {
  return <Scene kind="timer" />;
}

function Checkin({ go, activeSession }) {
  const [status, setStatus] = useState("Completed");
  const [accomplishment, setAccomplishment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeSession?._id) {
      go("analytics");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const message = accomplishment.trim()
        ? `[${status}] ${accomplishment.trim()}`
        : status;
      await checkinsApi.submit({
        sessionId: activeSession._id,
        checkInMessage: message,
      });
      go("analytics");
    } catch (err) {
      setError(err.message || "Failed to submit check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page checkin-page">
      <div className="checkin-top">
        <button onClick={() => go("dashboard")}>
          <Icon name="close" /> Back to dashboard
        </button>
        <span>SESSION COMPLETE · {activeSession?.room?.name || "STUDY ROOM"}</span>
      </div>
      <PageHeader
        eyebrow="POST-SESSION CHECK-IN"
        title="Close the loop."
        subtitle="Record what happened. Accuracy matters more than perfection."
      />
      {error && (
        <p style={{ color: "#b66b48", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
      )}
      <section className="checkin-grid">
        <div className="comparison-panel">
          <span className="section-index light">SESSION SUMMARY</span>
          <h2>Your session at a glance.</h2>
          <div className="plan-actual">
            <div>
              <small>ROOM</small>
              <strong>{activeSession?.room?.code || "FC"}</strong>
              <span>{activeSession?.room?.name || "Focus Session"}</span>
            </div>
            <div>
              <small>RECORDED TIME</small>
              <strong>{formatDuration(activeSession?.duration || 0)}</strong>
              <span>Status: {activeSession?.status || "completed"}</span>
            </div>
          </div>
          <blockquote>Progress becomes useful when it becomes visible.</blockquote>
        </div>
        <form className="checkin-form" onSubmit={handleSubmit}>
          <label>
            What did you actually accomplish?
            <textarea
              rows={3}
              required
              value={accomplishment}
              onChange={(e) => setAccomplishment(e.target.value)}
              placeholder="Summarize what you completed during this session..."
            />
          </label>
          <label>
            Completion status
            <div className="status-choices">
              {["Completed", "Mostly complete", "Partially complete"].map((s) => (
                <button
                  type="button"
                  key={s}
                  className={status === s ? "selected" : ""}
                  onClick={() => setStatus(s)}
                >
                  <span>{status === s && <Icon name="check" size={14} />}</span>
                  {s}
                </button>
              ))}
            </div>
          </label>
          <button type="submit" className="submit-checkin" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit check-in"} <Icon name="arrow" />
          </button>
        </form>
      </section>
    </div>
  );
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    analyticsApi
      .me()
      .then((data) => {
        if (active) setAnalytics(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const summary = analytics?.summary || {
    totalGoals: 0,
    completedGoals: 0,
    totalSessions: 0,
    totalCheckIns: 0,
    totalStudyTime: 0,
    totalStudyTimeMinutes: 0,
    totalStudyTimeHours: 0,
  };
  const completionRate =
    summary.totalGoals > 0
      ? Math.round((summary.completedGoals / summary.totalGoals) * 100)
      : 0;
  const avgMinutes =
    summary.totalSessions > 0
      ? Math.round(summary.totalStudyTimeMinutes / summary.totalSessions)
      : 0;

  return (
    <div className="page analytics-page">
      <PageHeader
        eyebrow="YOUR FOCUS RECORD"
        title="Analytics"
        subtitle="Patterns, not pressure. Use what you learn."
      />
      {loading ? (
        <p style={{ color: "var(--muted)", padding: "16px 0" }}>Loading analytics...</p>
      ) : (
        <>
          <section className="analytics-hero">
            <div className="analytic-main">
              <span>TOTAL FOCUS TIME</span>
              <div>
                <strong>{summary.totalStudyTimeHours} hrs</strong>
                <Tag>{summary.totalStudyTimeMinutes} min</Tag>
              </div>
              <p>Across {summary.totalSessions} study sessions.</p>
            </div>
            <div className="accuracy-ring">
              <span>GOAL COMPLETION</span>
              <div className="donut">
                <div>
                  <strong>{completionRate}%</strong>
                  <small>
                    {summary.completedGoals} of {summary.totalGoals} goals
                  </small>
                </div>
              </div>
            </div>
          </section>
          <section className="analytics-cards">
            <Metric
              label="CHECK-INS"
              value={`${summary.totalCheckIns}`}
              note="Completed reflections"
              icon="spark"
              tone="olive"
            />
            <Metric
              label="TOTAL SESSIONS"
              value={`${summary.totalSessions}`}
              note="Sessions joined"
              icon="timer"
            />
            <Metric
              label="AVERAGE SESSION"
              value={`${avgMinutes} min`}
              note="Average focus duration"
              icon="clock"
            />
          </section>
          <section className="panel recent-panel">
            <div className="panel-heading">
              <div>
                <span>SESSION HISTORY</span>
                <h3>Recent work</h3>
              </div>
            </div>
            <SessionTable recentSessions={analytics?.recentSessions || []} />
          </section>
        </>
      )}
    </div>
  );
}

function Settings({ user, onLogout }) {
  return (
    <div className="page settings-page">
      <PageHeader
        eyebrow="ACCOUNT / PREFERENCES"
        title="Settings"
        subtitle="Keep your workspace simple and personal."
        action={
          <button className="secondary-action" onClick={onLogout}>
            <Icon name="door" /> Log out
          </button>
        }
      />
      <section className="settings-layout">
        <nav>
          <button className="active">Profile</button>
        </nav>
        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="profile-edit">
            <span>{getInitials(user?.name)}</span>
            <div>
              <h3>Profile details</h3>
              <p>This is how you appear in shared study rooms.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Full name
              <input readOnly value={user?.name || ""} />
            </label>
            <label>
              Email address
              <input readOnly value={user?.email || ""} />
            </label>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(getToken()));
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);

  const go = useCallback((next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setPage("login");
    });

    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }

    authApi
      .me()
      .then((res) => {
        setUser(res.user);
        setPage((prev) =>
          prev === "landing" || prev === "login" || prev === "register" ? "dashboard" : prev
        );
      })
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    go("dashboard");
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setActiveSession(null);
    setSelectedRoomId(null);
    go("landing");
  };

  const isPublicPage = page === "landing" || page === "login" || page === "register";

  const content = useMemo(() => {
    switch (page) {
      case "dashboard":
        return (
          <Dashboard
            go={go}
            user={user}
            onSummaryLoaded={(s) => setWeeklyMinutes(s.totalStudyTimeMinutes || 0)}
          />
        );
      case "goals":
        return <Goals />;
      case "rooms":
        return <Rooms go={go} onSelectRoom={setSelectedRoomId} />;
      case "room":
        return (
          <RoomDetail
            go={go}
            roomId={selectedRoomId}
            onStartSession={setActiveSession}
          />
        );
      case "focus":
        return (
          <FocusSession
            go={go}
            activeSession={activeSession}
            onSessionEnded={setActiveSession}
          />
        );
      case "checkin":
        return <Checkin go={go} activeSession={activeSession} />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings user={user} onLogout={handleLogout} />;
      default:
        return null;
    }
  }, [page, user, selectedRoomId, activeSession, go]);

  if (authLoading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", color: "var(--muted)" }}>
        Loading FocusCircle...
      </div>
    );
  }

  if (!user && !isPublicPage) {
    return <Auth mode="login" go={go} onAuthSuccess={handleAuthSuccess} />;
  }

  if (page === "landing") return <Landing go={go} />;
  if (page === "login" || page === "register") {
    return <Auth mode={page} go={go} onAuthSuccess={handleAuthSuccess} />;
  }
  if (page === "focus") return content;

  return (
    <AppShell page={page} go={go} user={user} weeklyMinutes={weeklyMinutes}>
      {content}
    </AppShell>
  );
}
