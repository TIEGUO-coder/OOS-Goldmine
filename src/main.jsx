import React, { useMemo, useRef, useState } from "react";
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

function publicDescription(description) {
  if (!description) return "";
  if (!/[\u3400-\u9fff]/.test(description)) return description;
  const ascii = description.replace(/[^\x20-\x7E]+/g, " ").replace(/\s+/g, " ").trim();
  return ascii.length >= 40 ? ascii.slice(0, 280) : "Repository description contains non-English text.";
}

function publicRepo(repo) {
  return {
    ...repo,
    description: publicDescription(repo.description),
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

function scoreRepo(repo, analysis = null) {
  const monthsQuiet = monthsSince(repo.pushed_at);
  const starSignal = Math.min(30, Math.log10((repo.stargazers_count || 0) + 1) * 9);
  const issueSignal = Math.min(30, Math.log2((repo.open_issues_count || 0) + 1) * 5);
  const maintenanceGap = Math.min(25, monthsQuiet * 1.35);
  const forkSignal = Math.min(15, Math.log10((repo.forks_count || 0) + 1) * 6);
  const demandSignal = analysis ? Math.min(18, analysis.demandIssues * 2.4 + analysis.clusterCount * 2.2) : 0;
  const staleIssueSignal = analysis ? Math.min(12, analysis.staleOpenIssues * 1.6) : 0;
  const overloadedSignal = repo.open_issues_count >= 40 || analysis?.openPulls >= 10 || analysis?.stalePulls >= 5;
  const activeMaintainerPenalty = overloadedSignal ? 0 : analysis?.recentCommitCount > 8 ? 18 : analysis?.recentCommitCount > 2 ? 8 : 0;
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

function opportunityTypeFor(repo, analysis, category) {
  const monthsQuiet = monthsSince(repo.pushed_at);
  const hasDemand = analysis?.demandIssues >= 2 || analysis?.clusterCount >= 2 || analysis?.staleOpenIssues >= 3;
  const isOverloaded =
    monthsQuiet < 24 &&
    (repo.open_issues_count >= 40 || analysis?.openPulls >= 10 || analysis?.stalePulls >= 5) &&
    analysis?.demandIssues >= 3;

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

function curatedOverrideFor(repo) {
  return CURATED_REPO_OVERRIDES[repo.full_name] || null;
}

function classifyOpportunity(repo, themes, score, analysis = null) {
  const override = curatedOverrideFor(repo);
  if (override && analysis?.evidenceStatus === "complete") return override;
  const category = categoryFor(repo, themes);
  const opportunityType = opportunityTypeFor(repo, analysis, category);
  if (analysis?.evidenceStatus === "limited" && analysis.demandIssues === 0 && analysis.clusterCount === 0) {
    return {
      verdict: "Watch",
      ...opportunityType,
      wedge: category?.wedge || "evidence-first exploration",
      wedgeZh: category?.wedgeZh || "evidence-first exploration",
      why: "GitHub evidence is limited, so the current run cannot prove active demand. Retry later or use the server API before deciding to adapt it.",
      alternatives: category?.alternatives || [],
      risk: "Evidence limited",
    };
  }
  if (analysis?.obsoleteRisk === "high") {
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
    demandExamples: issueBundle.demandItems.slice(0, 8).map(slimIssue),
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
"Stop guessing what to build. Find the smallest useful wedge inside real open-source demand."`;
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
      repo: publicRepo(repo),
      issues: issueBundle.issues.slice(0, 4),
      themes,
      score: scored.score,
      monthsQuiet: scored.monthsQuiet,
      maintenanceLevel: scored.maintenanceLevel,
      analysis: publicAnalysis(analysis),
      opportunity,
      plan: aiPlan(repo, opportunity, themes, analysis),
      sample: true,
    };
  });
}

async function githubFetch(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 180)}`);
  }
  return response.json();
}

async function safeGithubFetch(url, fallback, errors = [], label = "github") {
  try {
    return await githubFetch(url);
  } catch (error) {
    errors.push({ label, message: error.message });
    return fallback;
  }
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

  const allIssues = [...openIssues, ...closedIssues].filter((issue) => !issue.pull_request);
  const issueBundle = analyzeIssueClusters(allIssues);
  const analysis = buildAnalysis(repo, issueBundle, openPulls, recentCommits, releases, errors);
  return { issueBundle, analysis };
}

async function findOpportunities(topic, page) {
  const query = encodeURIComponent(`${topic} stars:>300 archived:false`);
  const searchUrl = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=16&page=${page}`;
  const data = await githubFetch(searchUrl);
  const repos = (data.items || [])
    .filter((repo) => hasMinimumTopicFit(repo, topic))
    .filter((repo) => !isLikelyPersonalConfigRepo(repo))
    .filter((repo) => !isLikelyNonDeveloperToolRepo(repo));

  const cards = await Promise.all(
    repos.slice(0, 8).map(async (repo) => {
      const { issueBundle, analysis } = await fetchRepoEvidence(repo);
      const themes = issueBundle.themes.length ? issueBundle.themes : extractThemes(issueBundle.issues);
      const scored = scoreRepo(repo, analysis);
      const opportunity = classifyOpportunity(repo, themes, scored.score, analysis);

      return {
        repo: publicRepo(repo),
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

async function findOpportunitiesViaServer(topic, page) {
  const params = new URLSearchParams({ topic, page: String(page) });
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const response = await fetch(`${apiBase}/api/opportunities?${params.toString()}`);
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
  const hasDemandExamples = (analysis.demandExamples || []).length > 0;
  return (
    <div className="signalGrid">
      <div>
        <span>Confidence</span>
        <strong>{analysis.confidence ?? "n/a"}</strong>
      </div>
      <div className={hasDemandExamples ? "metricCard metricCardInteractive" : "metricCard"}>
        <span>Demand signals</span>
        {hasDemandExamples ? (
          <button type="button" className="metricLink" onClick={() => card.onDemandClick?.()}>
            <strong>{analysis.demandIssues ?? 0}</strong>
          </button>
        ) : (
          <strong>{analysis.demandIssues ?? 0}</strong>
        )}
      </div>
      <div>
        <span>Stale issues</span>
        <strong>{analysis.staleOpenIssues ?? 0}</strong>
      </div>
      <div>
        <span>90d commits</span>
        <strong>{analysis.recentCommitCount ?? 0}</strong>
      </div>
      <div>
        <span>Open PRs</span>
        <strong>{analysis.openPulls ?? 0}</strong>
      </div>
      <div>
        <span>Stale PRs</span>
        <strong>{analysis.stalePulls ?? 0}</strong>
      </div>
    </div>
  );
}

function OpportunityCard({ card }) {
  const [copied, setCopied] = useState(false);
  const [issueFilter, setIssueFilter] = useState("all");
  const evidenceRef = useRef(null);
  const demandExamples = card.analysis?.demandExamples || [];
  const demandIds = new Set(demandExamples.map((issue) => issue.id));
  const visibleIssues = issueFilter === "demand" ? card.issues.filter((issue) => demandIds.has(issue.id)) : card.issues;

  async function copyPlan() {
    await navigator.clipboard.writeText(card.plan);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function focusDemandEvidence() {
    if (!demandExamples.length) return;
    setIssueFilter("demand");
    window.requestAnimationFrame(() => {
      evidenceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
          <span className="wedgeLabel">Smallest useful wedge</span>
          <h2>{card.opportunity.wedge}</h2>
          {card.opportunity.wedgeZh && card.opportunity.wedgeZh !== card.opportunity.wedge && (
            <p>{card.opportunity.wedgeZh}</p>
          )}
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
          <span>Verdict</span>
          <strong>{card.opportunity.verdict}</strong>
        </div>
        <div>
          <span>Opportunity type</span>
          <strong>{card.opportunity.type || card.maintenanceLevel}</strong>
        </div>
      </div>

      {card.opportunity.typeDescription && (
        <div className="typeBox">
          <strong>{card.opportunity.type}</strong>
          <span>{card.opportunity.typeDescription}</span>
        </div>
      )}

      {card.analysis?.evidenceStatus === "limited" && (
        <div className="limitedEvidence">
          <AlertCircle size={16} />
          <span>Evidence limited: GitHub rate limit or partial fetch failure. Retry later for deeper analysis.</span>
        </div>
      )}

      <SignalGrid card={{ ...card, onDemandClick: focusDemandEvidence }} />

      <section>
        <h3>Why this may spread</h3>
        <p>{card.opportunity.why}</p>
      </section>

      <section>
        <h3>Risk check</h3>
        <div className="riskBox">
          <ShieldAlert size={16} />
          <span>{card.opportunity.risk || "Needs competitor check"}</span>
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
        <h3>Repeated demand themes</h3>
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
          <p className="muted">No repeated themes found. Try a broader topic or retry later.</p>
        )}
      </section>

      <section ref={evidenceRef}>
        <h3>Evidence links</h3>
        {demandExamples.length > 0 && (
          <div className="evidenceTabs" role="tablist" aria-label="Issue evidence filters">
            <button
              type="button"
              className={issueFilter === "all" ? "evidenceTab evidenceTabActive" : "evidenceTab"}
              onClick={() => setIssueFilter("all")}
            >
              All issues
            </button>
            <button
              type="button"
              className={issueFilter === "demand" ? "evidenceTab evidenceTabActive" : "evidenceTab"}
              onClick={() => setIssueFilter("demand")}
            >
              Demand signals ({demandExamples.length})
            </button>
          </div>
        )}
        <div className="issueList">
          {visibleIssues.length ? (
            visibleIssues.map((issue) => (
              <a href={issue.html_url} target="_blank" rel="noreferrer" key={issue.id}>
                <span>{issue.title}</span>
                {issue.state === "open" && <em>open</em>}
                <ExternalLink size={14} />
              </a>
            ))
          ) : demandExamples.length ? (
            <p className="muted">No matching demand signal links were available in this run.</p>
          ) : (
            <p className="muted">Issue details unavailable in this run.</p>
          )}
        </div>
      </section>

      <button className="secondaryButton" onClick={copyPlan}>
        <Copy size={16} />
        {copied ? "Copied" : "Copy AI Build Plan"}
      </button>
    </article>
  );
}

function ScoreMethod() {
  return (
    <section className="scoreMethod">
      <div>
        <span className="eyebrow">Scoring model</span>
        <h2>Demand Gap Score is transparent by design.</h2>
        <p>
          The score is a practical signal, not a magic verdict. It rewards visible demand, stale work, and maintainer overload while penalizing weak evidence.
        </p>
      </div>
      <div className="formula">
        <code>stars + issues + stale work + overload - weak evidence</code>
        <div className="formulaGrid">
          <span>Stars</span>
          <strong>historical demand</strong>
          <span>Open issues</span>
          <strong>unresolved demand</strong>
          <span>Opportunity type</span>
          <strong>Stalled / Overloaded / Underserved</strong>
          <span>Forks</span>
          <strong>revival interest</strong>
          <span>Penalties</span>
          <strong>archived repos or weak evidence</strong>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [topic, setTopic] = useState("API testing tools");
  const [cards, setCards] = useState(() => demoCards());
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSearch = topic.trim().length >= 2 && !loading;
  const subtitle = useMemo(
    () => "Find Stalled, Overloaded, and Underserved demand gaps in open-source software.",
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
        results = await findOpportunitiesViaServer(topic.trim(), nextPage);
      } catch {
        results = await findOpportunities(topic.trim(), nextPage);
      }
      setCards(results);
      if (!results.length) {
        setError("No strong opportunities found. Try a broader topic.");
      }
    } catch (err) {
      setError(err.message.includes("rate limit") || err.message.includes("403")
        ? "GitHub rate limit hit. Try again later."
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
          <span>OSS Goldmine</span>
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
              Topic
              <div className="inputRow">
                <Search size={18} />
                <input value={topic} onChange={(event) => setTopic(event.target.value)} />
              </div>
            </label>
            <button className="primaryButton" disabled={!canSearch}>
              {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
              Find gold
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
            <h2>Opportunity cards</h2>
            <p>Each card recommends a small wedge, not a full clone. Sample cards are replaced after live search.</p>
          </div>
          <div className="sectionActions">
            <button className="secondaryButton" onClick={() => setCards(demoCards())}>
              <Sparkles size={16} />
              Load samples
            </button>
            <button className="secondaryButton" onClick={() => runSearch(page + 1)} disabled={!canSearch}>
              <RefreshCw size={16} />
              Explore another batch
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
