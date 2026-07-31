import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  Github,
  Loader2,
  Pickaxe,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import "./styles.css";

const SAMPLE_TOPICS = [
  "API testing tools",
  "React performance tools",
  "browser developer extensions",
  "OpenAPI security",
  "AI coding tools",
];

const DEMO_REPOS = [
  {
    id: "demo-hitchhiker",
    full_name: "brookshi/Hitchhiker",
    name: "Hitchhiker",
    html_url: "https://github.com/brookshi/Hitchhiker",
    description:
      "RESTful API integrated testing tool with team collaboration, schedule runs, response comparison, stress test, and local deployment.",
    stargazers_count: 2214,
    forks_count: 399,
    open_issues_count: 93,
    pushed_at: "2019-02-09T00:00:00Z",
    archived: false,
    topics: ["api", "testing", "postman", "collaboration"],
  },
  {
    id: "demo-react-perf",
    full_name: "nitin42/react-perf-devtool",
    name: "react-perf-devtool",
    html_url: "https://github.com/nitin42/react-perf-devtool",
    description:
      "Browser developer tool for inspecting React component performance and rendering behavior.",
    stargazers_count: 2300,
    forks_count: 160,
    open_issues_count: 31,
    pushed_at: "2022-12-08T00:00:00Z",
    archived: false,
    topics: ["react", "performance", "devtools"],
  },
  {
    id: "demo-node-inspector",
    full_name: "node-inspector/node-inspector",
    name: "node-inspector",
    html_url: "https://github.com/node-inspector/node-inspector",
    description:
      "Legacy debugger interface for Node.js applications, useful as a skip example because platform-native debugging improved.",
    stargazers_count: 12600,
    forks_count: 1100,
    open_issues_count: 243,
    pushed_at: "2018-01-18T00:00:00Z",
    archived: false,
    topics: ["node", "debugging", "devtools"],
  },
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "when",
  "what",
  "how",
  "why",
  "can",
  "could",
  "would",
  "should",
  "about",
  "issue",
  "error",
  "bug",
  "support",
  "please",
  "feature",
  "request",
  "add",
  "new",
  "not",
  "use",
  "using",
  "does",
  "work",
  "working",
]);

function monthsSince(dateString) {
  if (!dateString) return 0;
  const then = new Date(dateString).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24 * 30)));
}

function compactNumber(value) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value || 0);
}

function scoreRepo(repo) {
  const monthsQuiet = monthsSince(repo.pushed_at);
  const starSignal = Math.min(30, Math.log10((repo.stargazers_count || 0) + 1) * 9);
  const issueSignal = Math.min(30, Math.log2((repo.open_issues_count || 0) + 1) * 5);
  const maintenanceGap = Math.min(25, monthsQuiet * 1.35);
  const forkSignal = Math.min(15, Math.log10((repo.forks_count || 0) + 1) * 6);
  const archivedPenalty = repo.archived ? 28 : 0;
  const emptyIssuePenalty = repo.open_issues_count === 0 ? 14 : 0;
  const score = Math.round(
    Math.max(0, Math.min(100, starSignal + issueSignal + maintenanceGap + forkSignal - archivedPenalty - emptyIssuePenalty))
  );

  return {
    score,
    monthsQuiet,
    maintenanceLevel: monthsQuiet >= 36 ? "High" : monthsQuiet >= 12 ? "Medium" : "Low",
  };
}

function extractThemes(issues) {
  const counts = new Map();
  issues.forEach((issue) => {
    const text = `${issue.title || ""} ${issue.body || ""}`.toLowerCase();
    const words = text.match(/[a-z][a-z0-9-]{3,}/g) || [];
    words.forEach((word) => {
      if (STOP_WORDS.has(word)) return;
      counts.set(word, (counts.get(word) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function classifyOpportunity(repo, themes, score) {
  const text = `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")} ${themes.join(" ")}`.toLowerCase();

  if (text.includes("api") || text.includes("openapi") || text.includes("postman")) {
    return {
      verdict: "Adapt",
      wedge: "API collection migration diff",
      wedgeZh: "API 集合迁移差异报告",
      why: "完整 API 客户端竞争很强，但集合迁移、响应差异、回归测试这些周边切口更小、更适合 AI builder。",
    };
  }
  if (text.includes("react") || text.includes("frontend") || text.includes("performance")) {
    return {
      verdict: "Adapt",
      wedge: "React performance audit companion",
      wedgeZh: "React 性能审计配套工具",
      why: "不要重做完整 devtool，可以做 issue 驱动的性能检查、迁移建议或报告生成器。",
    };
  }
  if (text.includes("browser") || text.includes("extension") || text.includes("chrome")) {
    return {
      verdict: "Adapt",
      wedge: "extension compatibility checker",
      wedgeZh: "浏览器扩展兼容性检查器",
      why: "浏览器扩展容易因为平台变化变慢维护，适合做迁移、兼容性和替代路线工具。",
    };
  }
  if (score >= 75) {
    return {
      verdict: "Adapt",
      wedge: "narrow companion tool",
      wedgeZh: "窄切口配套工具",
      why: "需求和维护缺口都明显，但建议先做周边小工具，避免复刻整个项目。",
    };
  }
  return {
    verdict: "Watch",
    wedge: "evidence-first exploration",
    wedgeZh: "证据优先探索",
    why: "信号还不够强，应该先看 issue 聚类和替代品，再决定是否开工。",
  };
}

function aiPlan(repo, opportunity, themes) {
  const themeLine = themes.length ? themes.join(", ") : "open issues, stale requests, migration pain";
  return `Build brief for ${repo.full_name}

Positioning:
Create a ${opportunity.wedge} (${opportunity.wedgeZh}) inspired by unmet demand around ${repo.name}.

Evidence to inspect:
- GitHub repo: ${repo.html_url}
- Open issues: ${repo.open_issues_count}
- Stars: ${repo.stargazers_count}
- Last push: ${repo.pushed_at?.slice(0, 10) || "unknown"}
- Repeated themes: ${themeLine}

Do not build:
- Do not clone the full original project.
- Do not frame this as replacing the maintainer.

Build the smallest useful wedge:
1. Research agent: summarize the top 30 open issues and group repeated requests.
2. Competitor agent: check current alternatives and mark what they already solve.
3. Builder agent: implement the smallest companion tool around "${opportunity.wedge}".
4. QA agent: create fixtures from real-world examples and verify output quality.
5. Writer agent: produce README, demo GIF script, and launch post.

Launch angle:
"Demand is alive, maintenance is fading. Here is the smallest useful tool builders can ship next."`;
}

function demoCards() {
  return DEMO_REPOS.map((repo) => {
    const themes =
      repo.name === "Hitchhiker"
        ? ["postman", "response", "stress", "schedule", "team"]
        : repo.name === "react-perf-devtool"
          ? ["react", "render", "performance", "chrome", "profiler"]
          : ["debugger", "chrome", "node", "legacy", "migration"];
    const scored = scoreRepo(repo);
    const opportunity = classifyOpportunity(repo, themes, scored.score);

    return {
      repo,
      issues: [
        {
          id: `${repo.id}-issue-1`,
          title: "Sample evidence: repeated requests need live issue clustering",
          html_url: `${repo.html_url}/issues`,
        },
        {
          id: `${repo.id}-issue-2`,
          title: "Sample evidence: maintenance gap should be checked against alternatives",
          html_url: `${repo.html_url}/issues`,
        },
      ],
      themes,
      score: scored.score,
      monthsQuiet: scored.monthsQuiet,
      maintenanceLevel: scored.maintenanceLevel,
      opportunity,
      plan: aiPlan(repo, opportunity, themes),
      sample: true,
    };
  });
}

async function githubFetch(url, token) {
  const response = await fetch(url, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        }
      : { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 180)}`);
  }
  return response.json();
}

async function findOpportunities(topic, token, page) {
  const query = encodeURIComponent(`${topic} stars:>300 archived:false`);
  const searchUrl = `https://api.github.com/search/repositories?q=${query}&sort=updated&order=asc&per_page=12&page=${page}`;
  const data = await githubFetch(searchUrl, token);
  const repos = data.items || [];

  const cards = await Promise.all(
    repos.slice(0, 8).map(async (repo) => {
      let issues = [];
      try {
        issues = await githubFetch(
          `https://api.github.com/repos/${repo.full_name}/issues?state=open&per_page=15&sort=comments&direction=desc`,
          token
        );
      } catch {
        issues = [];
      }
      const realIssues = issues.filter((issue) => !issue.pull_request);
      const themes = extractThemes(realIssues);
      const scored = scoreRepo(repo);
      const opportunity = classifyOpportunity(repo, themes, scored.score);

      return {
        repo,
        issues: realIssues.slice(0, 4),
        themes,
        score: scored.score,
        monthsQuiet: scored.monthsQuiet,
        maintenanceLevel: scored.maintenanceLevel,
        opportunity,
        plan: aiPlan(repo, opportunity, themes),
      };
    })
  );

  return cards.sort((a, b) => b.score - a.score).slice(0, 3);
}

function Evidence({ card }) {
  return (
    <div className="evidence">
      <div>
        <span>Stars</span>
        <strong>{compactNumber(card.repo.stargazers_count)}</strong>
      </div>
      <div>
        <span>Forks</span>
        <strong>{compactNumber(card.repo.forks_count)}</strong>
      </div>
      <div>
        <span>Open issues</span>
        <strong>{compactNumber(card.repo.open_issues_count)}</strong>
      </div>
      <div>
        <span>Quiet for</span>
        <strong>{card.monthsQuiet} mo</strong>
      </div>
    </div>
  );
}

function OpportunityCard({ card }) {
  const [copied, setCopied] = useState(false);

  async function copyPlan() {
    await navigator.clipboard.writeText(card.plan);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article className="card">
      <div className="cardHead">
        <div>
          <div className="repoLine">
            <Github size={18} />
            <a href={card.repo.html_url} target="_blank" rel="noreferrer">
              {card.repo.full_name}
            </a>
            {card.sample && <span className="sampleBadge">sample</span>}
          </div>
          <h2>{card.opportunity.wedge}</h2>
          <p>{card.opportunity.wedgeZh}</p>
        </div>
        <div className="score">
          <span>{card.score}</span>
          <small>Demand Gap</small>
        </div>
      </div>

      <p className="description">{card.repo.description || "No repository description available."}</p>

      <Evidence card={card} />

      <div className="diagnosis">
        <div>
          <span>Verdict / 判断</span>
          <strong>{card.opportunity.verdict}</strong>
        </div>
        <div>
          <span>Maintenance gap / 维护缺口</span>
          <strong>{card.maintenanceLevel}</strong>
        </div>
      </div>

      <section>
        <h3>Why this may spread / 为什么可能传播</h3>
        <p>{card.opportunity.why}</p>
      </section>

      <section>
        <h3>Repeated issue themes / issue 重复主题</h3>
        {card.themes.length ? (
          <div className="themes">
            {card.themes.map((theme) => (
              <span key={theme}>{theme}</span>
            ))}
          </div>
        ) : (
          <p className="muted">No issue themes fetched. Add a GitHub token for deeper evidence.</p>
        )}
      </section>

      <section>
        <h3>Evidence links / 证据链接</h3>
        <div className="issueList">
          {card.issues.length ? (
            card.issues.map((issue) => (
              <a href={issue.html_url} target="_blank" rel="noreferrer" key={issue.id}>
                <span>{issue.title}</span>
                <ExternalLink size={14} />
              </a>
            ))
          ) : (
            <p className="muted">Issue details unavailable in this run.</p>
          )}
        </div>
      </section>

      <button className="secondaryButton" onClick={copyPlan}>
        <Copy size={16} />
        {copied ? "Copied / 已复制" : "Copy AI Build Plan / 复制 AI 开工计划"}
      </button>
    </article>
  );
}

function App() {
  const [topic, setTopic] = useState("API testing tools");
  const [token, setToken] = useState("");
  const [cards, setCards] = useState(() => demoCards());
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSearch = topic.trim().length >= 2 && !loading;
  const subtitle = useMemo(
    () => "Find open-source projects where demand is alive but maintenance is fading.",
    []
  );

  async function runSearch(nextPage = 1) {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setPage(nextPage);
    try {
      const results = await findOpportunities(topic.trim(), token.trim(), nextPage);
      setCards(results);
      if (!results.length) {
        setError("No strong opportunities found. Try a broader topic.");
      }
    } catch (err) {
      setError(err.message.includes("rate limit") || err.message.includes("403")
        ? "GitHub rate limit hit. Add a free read-only GitHub token and search again."
        : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="brand">
          <Pickaxe size={22} />
          <span>OSS Goldmine / 开源金矿</span>
        </div>
        <div className="heroGrid">
          <div>
            <h1>Find buildable OSS opportunities before the crowd does.</h1>
            <p>{subtitle}</p>
          </div>
          <form
            className="searchPanel"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch(1);
            }}
          >
            <label>
              Topic / 方向
              <div className="inputRow">
                <Search size={18} />
                <input value={topic} onChange={(event) => setTopic(event.target.value)} />
              </div>
            </label>
            <label>
              GitHub token / 可选
              <input
                className="tokenInput"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Optional, read-only token for higher rate limit"
                type="password"
              />
            </label>
            <button className="primaryButton" disabled={!canSearch}>
              {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
              Find gold / 挖机会
              <ArrowRight size={18} />
            </button>
            <div className="chips">
              {SAMPLE_TOPICS.map((item) => (
                <button type="button" key={item} onClick={() => setTopic(item)}>
                  {item}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      <section className="results">
        <div className="sectionHead">
          <div>
            <h2>Opportunity cards / 机会卡</h2>
            <p>Each card recommends a small wedge, not a full clone. Sample cards are replaced after live search.</p>
          </div>
          <div className="sectionActions">
            <button className="secondaryButton" onClick={() => setCards(demoCards())}>
              <Sparkles size={16} />
              Load samples / 看样例
            </button>
            <button className="secondaryButton" onClick={() => runSearch(page + 1)} disabled={!canSearch}>
              <RefreshCw size={16} />
              Explore another batch / 换一批
            </button>
          </div>
        </div>

        {error && (
          <div className="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="cards">
          {cards.map((card) => (
            <OpportunityCard key={card.repo.id} card={card} />
          ))}
        </div>

        {!cards.length && !loading && !error && (
          <div className="empty">
            <Pickaxe size={32} />
            <p>Search a builder topic to generate three opportunity cards.</p>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
