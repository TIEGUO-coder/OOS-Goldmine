import http from "node:http";
import fs from "node:fs";
import path from "node:path";

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadLocalEnv();

const PORT = Number(process.env.PORT || 8787);
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

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

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, content-type",
  });
  res.end(JSON.stringify(body));
}

function monthsSince(dateString) {
  if (!dateString) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24 * 30)));
}

function issueAgeMonths(issue) {
  return monthsSince(issue.updated_at || issue.created_at);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function issueText(issue) {
  return `${issue.title || ""} ${issue.body || ""} ${(issue.labels || []).map((label) => label.name).join(" ")}`.toLowerCase();
}

function slimRepo(repo) {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    html_url: repo.html_url,
    description: repo.description,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    open_issues_count: repo.open_issues_count,
    pushed_at: repo.pushed_at,
    updated_at: repo.updated_at,
    created_at: repo.created_at,
    archived: repo.archived,
    disabled: repo.disabled,
    language: repo.language,
    license: repo.license
      ? {
          key: repo.license.key,
          name: repo.license.name,
          spdx_id: repo.license.spdx_id,
        }
      : null,
    topics: repo.topics || [],
  };
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

async function githubFetch(url, userToken = "") {
  const token = userToken || GITHUB_TOKEN;
  const response = await fetch(url, {
    headers: token
      ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
      : { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 180)}`);
  }
  return response.json();
}

async function safeGithubFetch(url, token, fallback, errors, label) {
  try {
    return await githubFetch(url, token);
  } catch (error) {
    errors.push({ label, message: error.message });
    return fallback;
  }
}

function topicTerms(topic) {
  return topic
    .toLowerCase()
    .match(/[a-z][a-z0-9-]{2,}/g)
    ?.filter((word) => !QUERY_STOP_WORDS.has(word)) || [];
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
      if (words[index + 1]) counts.set(`${one} ${words[index + 1]}`, (counts.get(`${one} ${words[index + 1]}`) || 0) + 1.8);
    }
  });

  const clusters = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      count: Math.round(count),
      examples: realIssues
        .filter((issue) => issueText(issue).includes(name.split(" ")[0]))
        .slice(0, 2)
        .map(slimIssue),
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

function buildAnalysis(repo, issueBundle, pulls = [], commits = [], releases = [], evidenceErrors = []) {
  const category = categoryFor(repo, issueBundle.themes);
  const recentCommitCount = commits.length;
  const demandIssues = issueBundle.demandItems.length;
  const clusterCount = issueBundle.clusters.length;
  const openPulls = pulls.filter((pull) => pull.state === "open");
  const stalePulls = openPulls.filter((pull) => issueAgeMonths(pull) >= 3);
  const obsoleteRisk = category?.risk?.includes("obsolete") || (repo.name || "").toLowerCase().includes("inspector") ? "high" : "normal";
  const confidence = clamp(
    36 +
      Math.min(24, demandIssues * 3) +
      Math.min(18, clusterCount * 3) +
      Math.min(12, issueBundle.staleOpenItems.length * 1.2) +
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
    staleOpenIssues: issueBundle.staleOpenItems.length,
    clusterCount,
    clusters: issueBundle.clusters,
    recentCommitCount,
    openPulls: openPulls.length,
    stalePulls: stalePulls.length,
    lastRelease: releases[0]?.published_at || releases[0]?.created_at || null,
    obsoleteRisk,
    evidenceStatus: evidenceErrors.length ? "limited" : "complete",
    evidenceErrors,
    confidence: Math.round(confidence),
  };
}

function scoreRepo(repo, analysis) {
  const monthsQuiet = monthsSince(repo.pushed_at);
  const starSignal = Math.min(30, Math.log10((repo.stargazers_count || 0) + 1) * 9);
  const issueSignal = Math.min(30, Math.log2((repo.open_issues_count || 0) + 1) * 5);
  const maintenanceGap = Math.min(25, monthsQuiet * 1.35);
  const forkSignal = Math.min(15, Math.log10((repo.forks_count || 0) + 1) * 6);
  const demandSignal = Math.min(18, analysis.demandIssues * 2.4 + analysis.clusterCount * 2.2);
  const staleIssueSignal = Math.min(12, analysis.staleOpenIssues * 1.6);
  const activeMaintainerPenalty = analysis.recentCommitCount > 8 ? 18 : analysis.recentCommitCount > 2 ? 8 : 0;
  const evidencePenalty = analysis.evidenceStatus === "limited" ? 25 : 0;
  const archivedPenalty = repo.archived ? 28 : 0;
  const emptyIssuePenalty = repo.open_issues_count === 0 ? 14 : 0;
  const obsoletePenalty = analysis.obsoleteRisk === "high" ? 18 : 0;
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

function classifyOpportunity(repo, themes, score, analysis) {
  const category = categoryFor(repo, themes);
  if (analysis.evidenceStatus === "limited" && analysis.demandIssues === 0 && analysis.clusterCount === 0) {
    return {
      verdict: "Watch",
      wedge: category?.wedge || "evidence-first exploration",
      wedgeZh: category?.wedgeZh || "证据优先探索",
      why: "GitHub 证据抓取受限，当前不能证明需求仍然活跃。先补 token 或稍后重试，再决定是否改造。",
      alternatives: category?.alternatives || [],
      risk: "Evidence limited / 证据受限",
    };
  }
  if (analysis.obsoleteRisk === "high") {
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

function aiPlan(repo, opportunity, themes, analysis) {
  return `Build brief for ${repo.full_name}

Positioning:
Create a ${opportunity.wedge} (${opportunity.wedgeZh}) inspired by unmet demand around ${repo.name}.

Evidence to inspect:
- GitHub repo: ${repo.html_url}
- Open issues: ${repo.open_issues_count}
- Stars: ${repo.stargazers_count}
- Last push: ${repo.pushed_at?.slice(0, 10) || "unknown"}
- Repeated themes: ${themes.length ? themes.join(", ") : "open issues, stale requests, migration pain"}
- Demand-like issues: ${analysis.demandIssues}
- Stale open issues: ${analysis.staleOpenIssues}
- Recent commits in 90 days: ${analysis.recentCommitCount}
- Open PRs: ${analysis.openPulls}
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

  const issueBundle = analyzeIssueClusters([...openIssues, ...closedIssues].filter((issue) => !issue.pull_request));
  const analysis = buildAnalysis(repo, issueBundle, openPulls, recentCommits, releases, errors);
  return { issueBundle, analysis };
}

async function findOpportunities(topic, page, token) {
  const query = encodeURIComponent(`${topic} stars:>300 archived:false pushed:<2025-01-01`);
  const data = await githubFetch(
    `https://api.github.com/search/repositories?q=${query}&sort=updated&order=asc&per_page=12&page=${page}`,
    token
  );

  const candidates = (data.items || [])
    .filter((repo) => relevanceScore(repo, topic) > 0)
    .filter((repo) => !isLikelyPersonalConfigRepo(repo))
    .slice(0, 6);

  const cards = await Promise.all(
    candidates.map(async (repo) => {
      const { issueBundle, analysis } = await fetchRepoEvidence(repo, token);
      const themes = issueBundle.themes;
      const scored = scoreRepo(repo, analysis);
      const opportunity = classifyOpportunity(repo, themes, scored.score, analysis);
      return {
        repo: slimRepo(repo),
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

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    json(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  if (url.pathname === "/health") {
    json(res, 200, { ok: true });
    return;
  }
  if (url.pathname !== "/api/opportunities") {
    json(res, 404, { error: "Not found" });
    return;
  }

  const topic = (url.searchParams.get("topic") || "").trim();
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const userToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();

  if (topic.length < 2) {
    json(res, 400, { error: "topic is required" });
    return;
  }

  try {
    const cards = await findOpportunities(topic, page, userToken);
    json(res, 200, {
      cards,
      source: "server",
      page,
      tokenMode: userToken ? "user" : GITHUB_TOKEN ? "server" : "anonymous",
    });
  } catch (error) {
    json(res, 500, {
      error: error.message,
      hint: "Set GITHUB_TOKEN for higher GitHub API limits, or pass a read-only token from the UI.",
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`OSS Goldmine API listening on http://127.0.0.1:${PORT}`);
});
