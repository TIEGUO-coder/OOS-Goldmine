import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  ArrowRight,
  Copy,
  ShieldAlert,
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
  "github",
  "version",
  "problem",
  "example",
  "project",
  "repo",
  "repository",
  "user-images",
  "githubusercontent",
  "image",
  "images",
  "http",
  "https",
  "com",
  "png",
  "jpg",
  "jpeg",
  "default",
  "info",
  "width",
  "src",
]);

const DEMAND_WORDS = [
  "feature",
  "support",
  "integration",
  "migration",
  "export",
  "import",
  "plugin",
  "api",
  "openapi",
  "typescript",
  "react",
  "chrome",
  "firefox",
  "docker",
  "self-hosted",
  "local",
  "offline",
  "ci",
  "cli",
  "generate",
  "convert",
  "compatibility",
];

const BUG_WORDS = ["bug", "error", "crash", "broken", "fail", "exception", "cannot", "doesn't", "not working"];
const INSTALL_WORDS = ["install", "setup", "build", "dependency", "npm", "yarn", "docker", "windows", "macos", "linux"];

const CATEGORY_RULES = [
  {
    match: ["api", "openapi", "postman", "rest", "graphql"],
    wedge: "API collection migration diff",
    wedgeZh: "API 集合迁移差异报告",
    risk: "High competition / 竞争强",
    alternatives: ["Postman", "Insomnia", "Hoppscotch", "Bruno"],
    why: "完整 API 客户端竞争很强。更好的切口是迁移差异、响应对比、回归测试报告，而不是重做客户端。",
  },
  {
    match: ["react", "frontend", "performance", "render", "profiler"],
    wedge: "React performance audit companion",
    wedgeZh: "React 性能审计配套工具",
    risk: "Medium competition / 竞争中等",
    alternatives: ["React DevTools Profiler", "Chrome Performance Panel", "Lighthouse"],
    why: "完整 devtool 不容易打，但 issue 驱动的性能审计、迁移建议、报告生成更适合小团队。",
  },
  {
    match: ["browser", "extension", "chrome", "firefox"],
    wedge: "extension compatibility checker",
    wedgeZh: "浏览器扩展兼容性检查器",
    risk: "Medium competition / 竞争中等",
    alternatives: ["Chrome Extension Manifest tools", "browser-extension-template"],
    why: "浏览器平台变化会制造兼容性缺口，适合做迁移和检测工具，而不是重做整个扩展。",
  },
  {
    match: ["debugger", "debugging", "node-inspector"],
    wedge: "modern debugger migration guide",
    wedgeZh: "现代调试器迁移指南",
    risk: "Likely obsolete / 可能已被平台替代",
    alternatives: ["Chrome DevTools", "Node.js inspector", "VS Code debugger"],
    why: "这类需求可能已经被官方调试能力覆盖，更适合做迁移指南或跳过，不适合复刻老工具。",
  },
];

const QUERY_STOP_WORDS = new Set(["tool", "tools", "app", "apps", "project", "projects", "open", "source", "oss"]);

function monthsSince(dateString) {
  if (!dateString) return 0;
  const then = new Date(dateString).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24 * 30)));
}

function compactNumber(value) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value || 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function issueAgeMonths(issue) {
  return monthsSince(issue.updated_at || issue.created_at);
}

function issueText(issue) {
  return `${issue.title || ""} ${issue.body || ""} ${(issue.labels || []).map((label) => label.name).join(" ")}`.toLowerCase();
}

function slimIssue(issue) {
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    html_url: issue.html_url,
    state: issue.state,
    comments: issue.comments || 0,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    labels: (issue.labels || []).map((label) => ({ name: label.name, color: label.color })),
  };
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function topicTerms(topic) {
  return (
    topic
      .toLowerCase()
      .match(/[a-z][a-z0-9-]{2,}/g)
      ?.filter((word) => !QUERY_STOP_WORDS.has(word)) || []
  );
}

function relevanceScore(repo, topic) {
  const terms = topicTerms(topic);
  if (!terms.length) return 1;
  const text = `${repo.name} ${repo.full_name} ${repo.description || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();
  return terms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0);
}

function isLikelyPersonalConfigRepo(repo) {
  const name = (repo.name || "").toLowerCase();
  const fullName = (repo.full_name || "").toLowerCase();
  const description = (repo.description || "").toLowerCase();
  return (
    name.startsWith(".") ||
    ["dotfiles", "config", "configs", "settings", "profile"].includes(name) ||
    fullName.includes("/dotfiles") ||
    description.includes("dotfiles") ||
    description.includes("personal config")
  );
}

function scoreRepo(repo, analysis = null) {
  const monthsQuiet = monthsSince(repo.pushed_at);
  const starSignal = Math.min(30, Math.log10((repo.stargazers_count || 0) + 1) * 9);
  const issueSignal = Math.min(30, Math.log2((repo.open_issues_count || 0) + 1) * 5);
  const maintenanceGap = Math.min(25, monthsQuiet * 1.35);
  const forkSignal = Math.min(15, Math.log10((repo.forks_count || 0) + 1) * 6);
  const demandSignal = analysis ? Math.min(18, analysis.demandIssues * 2.4 + analysis.clusterCount * 2.2) : 0;
  const staleIssueSignal = analysis ? Math.min(12, analysis.staleOpenIssues * 1.6) : 0;
  const activeMaintainerPenalty = analysis?.recentCommitCount > 8 ? 18 : analysis?.recentCommitCount > 2 ? 8 : 0;
  const evidencePenalty = analysis?.evidenceStatus === "limited" ? 25 : 0;
  const archivedPenalty = repo.archived ? 28 : 0;
  const emptyIssuePenalty = repo.open_issues_count === 0 ? 14 : 0;
  const obsoletePenalty = analysis?.obsoleteRisk === "high" ? 18 : 0;
  const score = Math.round(
    clamp(
      starSignal +
        issueSignal +
        maintenanceGap +
        forkSignal +
        demandSignal +
        staleIssueSignal -
        activeMaintainerPenalty -
        evidencePenalty -
        archivedPenalty -
        emptyIssuePenalty -
        obsoletePenalty,
      0,
      100
    )
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

function analyzeIssueClusters(issues) {
  const realIssues = issues.filter((issue) => !issue.pull_request);
  const openIssues = realIssues.filter((issue) => issue.state === "open");
  const demandItems = [];
  const bugItems = [];
  const installItems = [];
  const staleOpenItems = [];

  realIssues.forEach((issue) => {
    const text = issueText(issue);
    if (hasAny(text, DEMAND_WORDS)) demandItems.push(issue);
    if (hasAny(text, BUG_WORDS)) bugItems.push(issue);
    if (hasAny(text, INSTALL_WORDS)) installItems.push(issue);
    if (issue.state === "open" && issueAgeMonths(issue) >= 6) staleOpenItems.push(issue);
  });

  const counts = new Map();
  realIssues.forEach((issue) => {
    const words = (issueText(issue).match(/[a-z][a-z0-9-]{3,}/g) || []).filter((word) => !STOP_WORDS.has(word));
    for (let index = 0; index < words.length; index += 1) {
      const one = words[index];
      counts.set(one, (counts.get(one) || 0) + 1);
      if (words[index + 1]) {
        const two = `${one} ${words[index + 1]}`;
        counts.set(two, (counts.get(two) || 0) + 1.8);
      }
    }
  });

  const clusters = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      count: Math.round(count),
      examples: realIssues.filter((issue) => issueText(issue).includes(name.split(" ")[0])).slice(0, 2).map(slimIssue),
    }));

  return {
    issues: realIssues,
    openIssues,
    demandItems,
    bugItems,
    installItems,
    staleOpenItems,
    clusters,
    themes: clusters.slice(0, 5).map((cluster) => cluster.name),
  };
}

function categoryFor(repo, themes) {
  const text = `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")} ${themes.join(" ")}`.toLowerCase();
  return CATEGORY_RULES.find((rule) => rule.match.some((word) => text.includes(word))) || null;
}

function classifyOpportunity(repo, themes, score, analysis = null) {
  const category = categoryFor(repo, themes);
  if (analysis?.evidenceStatus === "limited" && analysis.demandIssues === 0 && analysis.clusterCount === 0) {
    return {
      verdict: "Watch",
      wedge: category?.wedge || "evidence-first exploration",
      wedgeZh: category?.wedgeZh || "证据优先探索",
      why: "GitHub 证据抓取受限，当前不能证明需求仍然活跃。先补 token 或稍后重试，再决定是否改造。",
      alternatives: category?.alternatives || [],
      risk: "Evidence limited / 证据受限",
    };
  }
  if (analysis?.obsoleteRisk === "high") {
    return {
      verdict: "Skip",
      wedge: category?.wedge || "migration note, not a product",
      wedgeZh: category?.wedgeZh || "迁移说明，不建议做产品",
      why: "维护缺口很明显，但平台或成熟替代品可能已经解决核心需求。更适合写迁移指南或跳过。",
      alternatives: category?.alternatives || [],
      risk: category?.risk || "Likely obsolete / 可能过时",
    };
  }
  if (category) {
    return {
      verdict: "Adapt",
      wedge: category.wedge,
      wedgeZh: category.wedgeZh,
      why: category.why,
      alternatives: category.alternatives,
      risk: category.risk,
    };
  }
  if (score >= 75) {
    return {
      verdict: "Adapt",
      wedge: "narrow companion tool",
      wedgeZh: "窄切口配套工具",
      why: "需求和维护缺口都明显，但建议先做周边小工具，避免复刻整个项目。",
      alternatives: [],
      risk: "Needs competitor check / 需要竞品检查",
    };
  }
  return {
    verdict: "Watch",
    wedge: "evidence-first exploration",
    wedgeZh: "证据优先探索",
    why: "信号还不够强，应该先看 issue 聚类和替代品，再决定是否开工。",
    alternatives: [],
    risk: "Low confidence / 低置信度",
  };
}

function buildAnalysis(repo, issueBundle, pulls = [], commits = [], releases = [], evidenceErrors = []) {
  const category = categoryFor(repo, issueBundle.themes);
  const recentCommitCount = commits.length;
  const staleOpenIssues = issueBundle.staleOpenItems.length;
  const demandIssues = issueBundle.demandItems.length;
  const clusterCount = issueBundle.clusters.length;
  const openPulls = pulls.filter((pull) => pull.state === "open");
  const stalePulls = openPulls.filter((pull) => issueAgeMonths(pull) >= 3);
  const lastRelease = releases[0]?.published_at || releases[0]?.created_at || null;
  const obsoleteRisk =
    category?.risk?.includes("obsolete") || (repo.name || "").toLowerCase().includes("inspector")
      ? "high"
      : "normal";
  const confidence = clamp(
    36 +
      Math.min(24, demandIssues * 3) +
      Math.min(18, clusterCount * 3) +
      Math.min(12, staleOpenIssues * 1.2) +
      (recentCommitCount === 0 ? 8 : recentCommitCount > 8 ? -12 : 0) -
      (obsoleteRisk === "high" ? 18 : 0) -
      (evidenceErrors.length ? 24 : 0),
    0,
    100
  );

  return {
    demandIssues,
    bugIssues: issueBundle.bugItems.length,
    installIssues: issueBundle.installItems.length,
    staleOpenIssues,
    clusterCount,
    clusters: issueBundle.clusters,
    recentCommitCount,
    openPulls: openPulls.length,
    stalePulls: stalePulls.length,
    lastRelease,
    obsoleteRisk,
    evidenceStatus: evidenceErrors.length ? "limited" : "complete",
    evidenceErrors,
    confidence: Math.round(confidence),
  };
}

function aiPlan(repo, opportunity, themes, analysis = null) {
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
- Demand-like issues: ${analysis?.demandIssues ?? "unknown"}
- Stale open issues: ${analysis?.staleOpenIssues ?? "unknown"}
- Recent commits in 90 days: ${analysis?.recentCommitCount ?? "unknown"}
- Open PRs: ${analysis?.openPulls ?? "unknown"}
- Known alternatives to check: ${(opportunity.alternatives || []).join(", ") || "unknown"}

Do not build:
- Do not clone the full original project.
- Do not frame this as replacing the maintainer.
- Do not skip competitor checks just because the repository is old.

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
    const issueBundle = analyzeIssueClusters([
      {
        id: `${repo.id}-issue-1`,
        state: "open",
        title: "Sample evidence: repeated requests need live issue clustering",
        html_url: `${repo.html_url}/issues`,
        updated_at: "2024-01-01T00:00:00Z",
        labels: [{ name: "feature" }],
      },
      {
        id: `${repo.id}-issue-2`,
        state: "open",
        title: "Sample evidence: maintenance gap should be checked against alternatives",
        html_url: `${repo.html_url}/issues`,
        updated_at: "2023-01-01T00:00:00Z",
        labels: [{ name: "support" }],
      },
    ]);
    const analysis = buildAnalysis(repo, issueBundle, [], [], []);
    const scored = scoreRepo(repo, analysis);
    const opportunity = classifyOpportunity(repo, themes, scored.score, analysis);

    return {
      repo,
      issues: issueBundle.issues.slice(0, 4),
      themes,
      score: scored.score,
      monthsQuiet: scored.monthsQuiet,
      maintenanceLevel: scored.maintenanceLevel,
      analysis,
      opportunity,
      plan: aiPlan(repo, opportunity, themes, analysis),
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

async function safeGithubFetch(url, token, fallback, errors = [], label = "github") {
  try {
    return await githubFetch(url, token);
  } catch (error) {
    errors.push({ label, message: error.message });
    return fallback;
  }
}

async function fetchRepoEvidence(repo, token) {
  const base = `https://api.github.com/repos/${repo.full_name}`;
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString();
  const errors = [];
  const [openIssues, closedIssues, openPulls, recentCommits, releases] = await Promise.all([
    safeGithubFetch(`${base}/issues?state=open&per_page=30&sort=comments&direction=desc`, token, [], errors, "open issues"),
    safeGithubFetch(`${base}/issues?state=closed&per_page=20&sort=updated&direction=desc`, token, [], errors, "closed issues"),
    safeGithubFetch(`${base}/pulls?state=open&per_page=20&sort=updated&direction=desc`, token, [], errors, "open pull requests"),
    safeGithubFetch(`${base}/commits?since=${encodeURIComponent(since)}&per_page=20`, token, [], errors, "recent commits"),
    safeGithubFetch(`${base}/releases?per_page=5`, token, [], errors, "recent releases"),
  ]);

  const allIssues = [...openIssues, ...closedIssues].filter((issue) => !issue.pull_request);
  const issueBundle = analyzeIssueClusters(allIssues);
  const analysis = buildAnalysis(repo, issueBundle, openPulls, recentCommits, releases, errors);
  return { issueBundle, analysis };
}

async function findOpportunities(topic, token, page) {
  const query = encodeURIComponent(`${topic} stars:>300 archived:false pushed:<2025-01-01`);
  const searchUrl = `https://api.github.com/search/repositories?q=${query}&sort=updated&order=asc&per_page=12&page=${page}`;
  const data = await githubFetch(searchUrl, token);
  const repos = (data.items || [])
    .filter((repo) => relevanceScore(repo, topic) > 0)
    .filter((repo) => !isLikelyPersonalConfigRepo(repo));

  const cards = await Promise.all(
    repos.slice(0, 6).map(async (repo) => {
      const { issueBundle, analysis } = await fetchRepoEvidence(repo, token);
      const themes = issueBundle.themes.length ? issueBundle.themes : extractThemes(issueBundle.issues);
      const scored = scoreRepo(repo, analysis);
      const opportunity = classifyOpportunity(repo, themes, scored.score, analysis);

      return {
        repo,
        issues: issueBundle.issues.slice(0, 4).map(slimIssue),
        themes,
        score: scored.score,
        monthsQuiet: scored.monthsQuiet,
        maintenanceLevel: scored.maintenanceLevel,
        analysis,
        opportunity,
        plan: aiPlan(repo, opportunity, themes, analysis),
      };
    })
  );

  return cards.sort((a, b) => b.score - a.score).slice(0, 3);
}

async function findOpportunitiesViaServer(topic, token, page) {
  const params = new URLSearchParams({ topic, page: String(page) });
  const response = await fetch(`/api/opportunities?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server API failed: ${text.slice(0, 180)}`);
  }
  const data = await response.json();
  return data.cards || [];
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

function SignalGrid({ card }) {
  const analysis = card.analysis || {};
  return (
    <div className="signalGrid">
      <div>
        <span>Confidence / 置信度</span>
        <strong>{analysis.confidence ?? "n/a"}</strong>
      </div>
      <div>
        <span>Demand issues / 需求型 issue</span>
        <strong>{analysis.demandIssues ?? 0}</strong>
      </div>
      <div>
        <span>Stale issues / 过期 issue</span>
        <strong>{analysis.staleOpenIssues ?? 0}</strong>
      </div>
      <div>
        <span>90d commits / 90 天提交</span>
        <strong>{analysis.recentCommitCount ?? 0}</strong>
      </div>
      <div>
        <span>Open PRs / open PR</span>
        <strong>{analysis.openPulls ?? 0}</strong>
      </div>
      <div>
        <span>Stale PRs / 过期 PR</span>
        <strong>{analysis.stalePulls ?? 0}</strong>
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

      {card.analysis?.evidenceStatus === "limited" && (
        <div className="limitedEvidence">
          <AlertCircle size={16} />
          <span>Evidence limited / 证据受限：GitHub rate limit or partial fetch failure. Add a token for deeper analysis.</span>
        </div>
      )}

      <SignalGrid card={card} />

      <section>
        <h3>Why this may spread / 为什么可能传播</h3>
        <p>{card.opportunity.why}</p>
      </section>

      <section>
        <h3>Risk check / 风险检查</h3>
        <div className="riskBox">
          <ShieldAlert size={16} />
          <span>{card.opportunity.risk || "Needs competitor check / 需要竞品检查"}</span>
        </div>
        {(card.opportunity.alternatives || []).length > 0 && (
          <div className="alternatives">
            {card.opportunity.alternatives.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3>Demand clusters / 需求聚类</h3>
        {card.analysis?.clusters?.length ? (
          <div className="clusterList">
            {card.analysis.clusters.slice(0, 4).map((cluster) => (
              <div key={cluster.name} className="cluster">
                <strong>{cluster.name}</strong>
                <span>{cluster.count} hits</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No clusters found. Add a GitHub token or try a broader topic.</p>
        )}
      </section>

      <section>
        <h3>Evidence links / 证据链接</h3>
        <div className="issueList">
          {card.issues.length ? (
            card.issues.map((issue) => (
              <a href={issue.html_url} target="_blank" rel="noreferrer" key={issue.id}>
                <span>{issue.title}</span>
                {issue.state === "open" && <em>open</em>}
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

function ScoreMethod() {
  return (
    <section className="scoreMethod">
      <div>
        <span className="eyebrow">Scoring model / 评分模型</span>
        <h2>Demand Gap Score is transparent by design.</h2>
        <p>
          The score is a practical signal, not a magic verdict. It rewards visible demand and penalizes weak evidence.
        </p>
      </div>
      <div className="formula">
        <code>stars + open issues + quiet months + forks - penalties</code>
        <div className="formulaGrid">
          <span>Stars / star 数</span>
          <strong>historical demand / 历史需求</strong>
          <span>Open issues / open issue 数</span>
          <strong>unresolved demand / 未解决需求</strong>
          <span>Quiet months / 静默月份</span>
          <strong>maintenance gap / 维护缺口</strong>
          <span>Forks / fork 数</span>
          <strong>revival interest / 接手兴趣</strong>
          <span>Penalties / 扣分项</span>
          <strong>archived or no issues / 已归档或无 issue</strong>
        </div>
      </div>
    </section>
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
      let results = [];
      try {
        results = await findOpportunitiesViaServer(topic.trim(), token.trim(), nextPage);
      } catch {
        results = await findOpportunities(topic.trim(), token.trim(), nextPage);
      }
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

        <ScoreMethod />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
