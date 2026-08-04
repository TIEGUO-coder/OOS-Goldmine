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
  "have",
  "file",
  "files",
  "node",
  "module",
  "modules",
  "line",
  "local",
  "internal",
  "python",
  "java",
  "test",
  "tests",
  "trying",
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
    match: ["sql", "database", "postgres", "mysql", "sqlite", "sqlserver", "oracle", "migration", "migrate"],
    wedge: "SQL migration compatibility report",
    wedgeZh: "SQL migration compatibility report",
    risk: "High value, high correctness risk",
    alternatives: ["SQLines", "pgloader", "Flyway", "Liquibase"],
    why: "Database migration has clear business pain, but a full converter carries high correctness risk. The sharper wedge is compatibility scanning, migration risk reporting, and AI-ready fix plans.",
  },
  {
    match: ["api", "openapi", "postman", "rest", "graphql"],
    wedge: "API collection migration diff",
    wedgeZh: "API collection migration diff",
    risk: "High competition",
    alternatives: ["Postman", "Insomnia", "Hoppscotch", "Bruno"],
    why: "The full API client market is crowded. A better wedge is migration diffs, response comparison, and regression reports instead of another client.",
  },
  {
    match: ["react", "frontend", "performance", "render", "profiler"],
    wedge: "React performance audit companion",
    wedgeZh: "React performance audit companion",
    risk: "Medium competition",
    alternatives: ["React DevTools Profiler", "Chrome Performance Panel", "Lighthouse"],
    why: "A full devtool is hard to win. Issue-driven performance audits, migration suggestions, and shareable reports are a better fit for a small team.",
  },
  {
    match: ["browser", "extension", "chrome", "firefox"],
    wedge: "extension compatibility checker",
    wedgeZh: "extension compatibility checker",
    risk: "Medium competition",
    alternatives: ["Chrome Extension Manifest tools", "browser-extension-template"],
    why: "Browser platform changes create compatibility gaps. Migration and validation tools are more practical than rebuilding a full extension stack.",
  },
  {
    match: ["debugger", "debugging", "node-inspector"],
    wedge: "modern debugger migration guide",
    wedgeZh: "modern debugger migration guide",
    risk: "Likely obsolete",
    alternatives: ["Chrome DevTools", "Node.js inspector", "VS Code debugger"],
    why: "The core need may already be covered by official debugging tools. This is better as a migration guide or skip decision than a rebuilt product.",
  },
];

const CURATED_REPO_OVERRIDES = {
  "brookshi/Hitchhiker": {
    verdict: "Adapt",
    type: "Stalled",
    typeDescription: "Long quiet project with visible unresolved demand",
    wedge: "API collection migration diff",
    wedgeZh: "API collection migration diff",
    risk: "High competition",
    alternatives: ["Postman", "Insomnia", "Hoppscotch", "Bruno"],
    why: "Hitchhiker proves demand around API collaboration, response comparison, stress testing, and self-hosting, but the full API client market is crowded. Build migration diffs and regression risk reports instead.",
  },
  "nitin42/react-perf-devtool": {
    verdict: "Adapt",
    type: "Stalled",
    typeDescription: "Long quiet project with visible unresolved demand",
    wedge: "React render regression report",
    wedgeZh: "React render regression report",
    risk: "Medium competition",
    alternatives: ["React DevTools Profiler", "Chrome Performance Panel", "Lighthouse"],
    why: "React performance pain is still real, but a full devtool is hard to win. Turn profiling data into shareable render regression reports and fix suggestions.",
  },
  "dmtolpeko/sqlines": {
    verdict: "Adapt",
    type: "Stalled",
    typeDescription: "Long quiet project with visible unresolved demand",
    wedge: "SQL migration compatibility report",
    wedgeZh: "SQL migration compatibility report",
    risk: "High value, high correctness risk",
    alternatives: ["SQLines", "pgloader", "Flyway", "Liquibase"],
    why: "Database migration demand is strong, but a universal converter is risky. Build compatibility scanning, dialect risk reports, and AI-ready fix plans.",
  },
};

const QUERY_STOP_WORDS = new Set(["tool", "tools", "app", "apps", "project", "projects", "open", "source", "oss", "developer"]);
const TOPIC_ALIASES = {
  documentation: ["docs", "doc", "documentation", "readme", "wiki", "storybook", "docusaurus", "mkdocs"],
  migration: ["migration", "migrate", "convert", "converter", "schema"],
  database: ["database", "sql", "postgres", "mysql", "sqlite", "mongodb"],
  openapi: ["openapi", "swagger", "api"],
  security: ["security", "scan", "scanner", "vulnerability", "audit", "jwt", "auth"],
  browser: ["browser", "chrome", "firefox", "extension", "webextension"],
  extensions: ["extension", "extensions", "chrome", "firefox", "webextension"],
  coding: ["coding", "code", "programming", "developer"],
  ai: ["ai", "llm", "gpt", "agent", "copilot"],
};

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

function publicDescription(description) {
  if (!description) return "";
  if (!/[\u3400-\u9fff]/.test(description)) return description;
  const ascii = description.replace(/[^\x20-\x7E]+/g, " ").replace(/\s+/g, " ").trim();
  return ascii.length >= 40 ? ascii.slice(0, 280) : "Repository description contains non-English text.";
}

function slimRepo(repo) {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    html_url: repo.html_url,
    description: publicDescription(repo.description),
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

async function githubFetch(url) {
  const token = GITHUB_TOKEN;
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

async function safeGithubFetch(url, fallback, errors, label) {
  try {
    return await githubFetch(url);
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
  return terms.reduce((score, term) => {
    const aliases = TOPIC_ALIASES[term] || [term];
    return score + (aliases.some((alias) => text.includes(alias)) ? 1 : 0);
  }, 0);
}

function hasApiTestingAnchor(repo, topic) {
  const terms = topicTerms(topic);
  if (!terms.includes("api") || !terms.includes("testing")) return true;
  const strongText = `${repo.name} ${repo.full_name} ${(repo.topics || []).join(" ")}`.toLowerCase();
  const fullText = `${strongText} ${repo.description || ""}`.toLowerCase();
  const strongApi = ["api", "openapi", "swagger", "postman", "insomnia", "hoppscotch", "raml", "rest", "graphql"];
  const strongTesting = ["api-testing", "testing-tools", "test-automation", "contract-testing", "api-client", "rest-client"];
  const phraseAnchors = ["api test", "api testing", "rest api test", "restful api test", "openapi", "swagger", "postman", "raml"];
  return (hasAny(strongText, strongApi) && hasAny(strongText, ["test", "testing", "automation", "client"])) || hasAny(strongText, strongTesting) || hasAny(fullText, phraseAnchors);
}

function hasMinimumTopicFit(repo, topic) {
  const terms = topicTerms(topic);
  if (!hasApiTestingAnchor(repo, topic)) return false;
  if (terms.length <= 1) return relevanceScore(repo, topic) > 0;
  return relevanceScore(repo, topic) >= Math.min(2, terms.length);
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

function curatedOverrideFor(repo) {
  return CURATED_REPO_OVERRIDES[repo.full_name] || null;
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
    demandExamples: issueBundle.demandItems.slice(0, 8).map(slimIssue),
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

function isLikelyNonDeveloperToolRepo(repo) {
  const name = (repo.name || "").toLowerCase();
  const fullName = (repo.full_name || "").toLowerCase();
  const description = repo.description || "";
  const topics = (repo.topics || []).join(" ").toLowerCase();
  const text = `${name} ${fullName} ${description} ${topics}`.toLowerCase();
  const political = ["politics", "propaganda", "dictatorship", "censorship", "human-rights", "tiananmen", "xinjiang"];
  const hanCount = (description.match(/[\u3400-\u9fff]/g) || []).length;
  const heavyNonEnglishDescription = description.length > 120 && hanCount / description.length > 0.08;
  const developerAnchors = [
    "api",
    "testing",
    "developer",
    "database",
    "migration",
    "react",
    "performance",
    "browser",
    "extension",
    "openapi",
    "cli",
    "devtool",
  ];
  return hasAny(text, political) || (heavyNonEnglishDescription && !hasAny(topics, developerAnchors));
}

function displayIssues(issues) {
  const english = issues.filter((issue) => !/[\u3400-\u9fff]/.test(issue.title || ""));
  return english.slice(0, 4).map(slimIssue);
}

function publicClusters(clusters) {
  return (clusters || [])
    .filter((cluster) => !/[\u3400-\u9fff]/.test(cluster.name || ""))
    .map((cluster) => ({
      ...cluster,
      examples: displayIssues(cluster.examples || []),
    }));
}

function publicAnalysis(analysis) {
  return {
    ...analysis,
    clusters: publicClusters(analysis.clusters),
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
  const overloadedSignal = repo.open_issues_count >= 40 || analysis.openPulls >= 10 || analysis.stalePulls >= 5;
  const activeMaintainerPenalty = overloadedSignal ? 0 : analysis.recentCommitCount > 8 ? 18 : analysis.recentCommitCount > 2 ? 8 : 0;
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

function opportunityTypeFor(repo, analysis, category) {
  const monthsQuiet = monthsSince(repo.pushed_at);
  const hasDemand = analysis.demandIssues >= 2 || analysis.clusterCount >= 2 || analysis.staleOpenIssues >= 3;
  const isOverloaded =
    monthsQuiet < 24 &&
    (repo.open_issues_count >= 40 || analysis.openPulls >= 10 || analysis.stalePulls >= 5) &&
    analysis.demandIssues >= 3;

  if (monthsQuiet >= 24 && hasDemand) {
    return {
      type: "Stalled",
      typeDescription: "Long quiet project with visible unresolved demand",
    };
  }
  if (isOverloaded) {
    return {
      type: "Overloaded",
      typeDescription: "Active project with more issues or PRs than maintainers can easily absorb",
    };
  }
  if (category && hasDemand) {
    return {
      type: "Underserved",
      typeDescription: "Known market where a narrow workflow still looks under-served",
    };
  }
  return {
    type: "Watch",
    typeDescription: "Not enough evidence for a buildable demand gap yet",
  };
}

function classifyOpportunity(repo, themes, score, analysis) {
  const override = curatedOverrideFor(repo);
  if (override && analysis.evidenceStatus === "complete") return override;
  const category = categoryFor(repo, themes);
  const opportunityType = opportunityTypeFor(repo, analysis, category);
  if (analysis.evidenceStatus === "limited" && analysis.demandIssues === 0 && analysis.clusterCount === 0) {
    return {
      verdict: "Watch",
      ...opportunityType,
      wedge: category?.wedge || "evidence-first exploration",
      wedgeZh: category?.wedgeZh || "evidence-first exploration",
      why: "GitHub evidence is limited, so the current run cannot prove active demand. Retry later or use a server token before deciding to adapt it.",
      alternatives: category?.alternatives || [],
      risk: "Evidence limited",
    };
  }
  if (analysis.obsoleteRisk === "high") {
    return {
      verdict: "Skip",
      ...opportunityType,
      wedge: category?.wedge || "migration note, not a product",
      wedgeZh: category?.wedgeZh || "migration note, not a product",
      why: "The maintenance gap is visible, but platforms or mature alternatives may already cover the core need. Treat this as a migration guide or skip decision.",
      alternatives: category?.alternatives || [],
      risk: category?.risk || "Likely obsolete",
    };
  }
  if (category) {
    return {
      verdict: "Adapt",
      ...opportunityType,
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
      ...opportunityType,
      wedge: "narrow companion tool",
      wedgeZh: "narrow companion tool",
      why: "Demand and maintenance gaps are visible. Start with a narrow companion tool instead of cloning the original project.",
      alternatives: [],
      risk: "Needs competitor check",
    };
  }
  return {
    verdict: "Watch",
    ...opportunityType,
    wedge: "evidence-first exploration",
    wedgeZh: "evidence-first exploration",
    why: "The signal is not strong enough yet. Review issue clusters and alternatives before building.",
    alternatives: [],
    risk: "Low confidence",
  };
}

function aiPlan(repo, opportunity, themes, analysis) {
  const positioning = opportunity.wedgeZh && opportunity.wedgeZh !== opportunity.wedge
    ? `${opportunity.wedge} (${opportunity.wedgeZh})`
    : opportunity.wedge;
  return `Build brief for ${repo.full_name}

Positioning:
Create a ${positioning} inspired by unmet demand around ${repo.name}.

Evidence to inspect:
- GitHub repo: ${repo.html_url}
- Opportunity type: ${opportunity.type || "unknown"} - ${opportunity.typeDescription || "unknown"}
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
"Stop guessing what to build. Find the smallest useful wedge inside real open-source demand."`;
}

async function fetchRepoEvidence(repo) {
  const base = `https://api.github.com/repos/${repo.full_name}`;
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString();
  const errors = [];
  const [openIssues, closedIssues, openPulls, recentCommits, releases] = await Promise.all([
    safeGithubFetch(`${base}/issues?state=open&per_page=30&sort=comments&direction=desc`, [], errors, "open issues"),
    safeGithubFetch(`${base}/issues?state=closed&per_page=20&sort=updated&direction=desc`, [], errors, "closed issues"),
    safeGithubFetch(`${base}/pulls?state=open&per_page=20&sort=updated&direction=desc`, [], errors, "open pull requests"),
    safeGithubFetch(`${base}/commits?since=${encodeURIComponent(since)}&per_page=20`, [], errors, "recent commits"),
    safeGithubFetch(`${base}/releases?per_page=5`, [], errors, "recent releases"),
  ]);

  const issueBundle = analyzeIssueClusters([...openIssues, ...closedIssues].filter((issue) => !issue.pull_request));
  const analysis = buildAnalysis(repo, issueBundle, openPulls, recentCommits, releases, errors);
  return { issueBundle, analysis };
}

async function findOpportunities(topic, page) {
  const query = encodeURIComponent(`${topic} stars:>300 archived:false`);
  const data = await githubFetch(
    `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=16&page=${page}`
  );

  const candidates = (data.items || [])
    .filter((repo) => hasMinimumTopicFit(repo, topic))
    .filter((repo) => !isLikelyPersonalConfigRepo(repo))
    .filter((repo) => !isLikelyNonDeveloperToolRepo(repo))
    .slice(0, 8);

  const cards = await Promise.all(
    candidates.map(async (repo) => {
      const { issueBundle, analysis } = await fetchRepoEvidence(repo);
      const themes = issueBundle.themes;
      const scored = scoreRepo(repo, analysis);
      const opportunity = classifyOpportunity(repo, themes, scored.score, analysis);
      return {
        repo: slimRepo(repo),
        issues: displayIssues(issueBundle.issues),
        themes,
        score: scored.score,
        monthsQuiet: scored.monthsQuiet,
        maintenanceLevel: scored.maintenanceLevel,
        analysis: publicAnalysis(analysis),
        opportunity,
        plan: aiPlan(repo, opportunity, themes, analysis),
      };
    })
  );

  return cards
    .filter((card) => card.opportunity.type !== "Watch" || card.score >= 65)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
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
  if (topic.length < 2) {
    json(res, 400, { error: "topic is required" });
    return;
  }

  try {
    const cards = await findOpportunities(topic, page);
    json(res, 200, {
      cards,
      source: "server",
      page,
      tokenMode: GITHUB_TOKEN ? "server" : "anonymous",
    });
  } catch (error) {
    json(res, 500, {
      error: error.message,
      hint: "Set GITHUB_TOKEN on the server for higher GitHub API limits.",
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`OSS Goldmine API listening on http://127.0.0.1:${PORT}`);
});
