"use client";

import { useState } from "react";
import type { Issue } from "../../phase1/issue";
import styles from "./page.module.css";

function isGitHubRepoUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    return (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      parts.length === 2
    );
  } catch {
    return false;
  }
}

async function fetchIssuePage(repoUrl: string, page: number) {
  const response = await fetch(
    `/api/issues?repo=${encodeURIComponent(repoUrl)}&page=${page}`,
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("issues" in data) ||
    !Array.isArray(data.issues) ||
    !("hasNextPage" in data) ||
    typeof data.hasNextPage !== "boolean"
  ) {
    throw new Error("接口返回的数据格式不正确");
  }

  return { issues: data.issues as Issue[], hasNextPage: data.hasNextPage };
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [submittedRepoUrl, setSubmittedRepoUrl] = useState("");
  const [visibleIssues, setVisibleIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const [nextPage, setNextPage] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [analysis, setAnalysis] = useState<{
    issue: Issue;
    summary: string;
    type: string;
    reason: string;
  } | null>(null);
  const [analysisError, setAnalysisError] = useState<{
    issue: Issue;
    message: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function analyzeIssue() {
    const issue = selectedIssue;
    if (issue === null || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: issue.title, body: issue.body }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "分析失败，请重试。");
      }
      setAnalysis({
        issue,
        summary: result.summary,
        type: result.type,
        reason: result.reason,
      });
    } catch (error) {
      setAnalysisError({
        issue,
        message: error instanceof Error ? error.message : "分析失败，请重试。",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function loadMore() {
    if (nextPage === null || loadingMore || status !== "success") return;

    setLoadingMore(true);
    setLoadMoreError("");
    try {
      const result = await fetchIssuePage(submittedRepoUrl, nextPage);
      setVisibleIssues((previous) => {
        const seen = new Set(previous.map((issue) => issue.number));
        return [...previous, ...result.issues.filter((issue) => !seen.has(issue.number))];
      });
      setSelectedIssue((previous) => previous ?? result.issues[0] ?? null);
      setNextPage(result.hasNextPage ? nextPage + 1 : null);
    } catch {
      setLoadMoreError("加载下一页失败，请重试。");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.intro}>
          <h1>AI Issue Assistant</h1>
          <p>浏览公开 GitHub 仓库的 Issue，按需生成摘要和分类。</p>
        </header>

        <form className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            if (loadingMore || status === "loading") return;

            setNextPage(null);
            setLoadMoreError("");
            const submittedUrl = repoUrl.trim();

            if (!isGitHubRepoUrl(submittedUrl)) {
              setErrorMessage("请输入完整的 GitHub 仓库地址，例如 https://github.com/owner/repo。");
              setStatus("error");
              setSubmittedRepoUrl("");
              setVisibleIssues([]);
              setSelectedIssue(null);
              return;
            }

            setSubmittedRepoUrl(submittedUrl);
            setVisibleIssues([]);
            setSelectedIssue(null);
            setErrorMessage("");
            setStatus("loading");

            try {
              const result = await fetchIssuePage(submittedUrl, 1);
              setVisibleIssues(result.issues);
              setSelectedIssue(result.issues[0] ?? null);
              setNextPage(result.hasNextPage ? 2 : null);
              setStatus("success");
            } catch {
              setErrorMessage("获取 Issue 失败，请稍后重试。");
              setStatus("error");
            }
          }}
        >
          <label htmlFor="repo-url">GitHub 仓库地址</label>
          <div className={styles.formControls}>
            <input
              id="repo-url"
              type="url"
              required
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/owner/repo"
            />
            <button
              className={styles.primary}
              type="submit"
              disabled={status === "loading" || loadingMore}
            >
              {status === "loading" ? "正在加载…" : "查看 Issue"}
            </button>
          </div>
        </form>

        {status === "error" && (
          <p className={styles.error} role="alert">{errorMessage}</p>
        )}
        {status === "loading" && (
          <p className={styles.notice} role="status">正在获取仓库 Issue…</p>
        )}
        {status === "success" && (
          <section className={styles.results} aria-label="仓库 Issue">
            <div className={styles.resultsHeader}>
              <h2>{new URL(submittedRepoUrl).pathname.replace(/^\/|\/$/g, "")}</h2>
              <p>已加载 {visibleIssues.length} 条 Issue</p>
            </div>

            <div className={styles.workspace}>
              <section className={styles.panel} aria-label="Issue 列表">
                <h3 className={styles.listHeading}>Issue 列表</h3>
                {visibleIssues.length === 0 ? (
                  <p className={styles.notice}>
                    {nextPage === null ? "暂无 Issue" : "当前已加载的页面暂无 Issue"}
                  </p>
                ) : (
                  <ul className={styles.issueList}>
                    {visibleIssues.map((issue) => (
                      <li key={issue.number}>
                        <button
                          type="button"
                          className={styles.issueRow}
                          onClick={() => setSelectedIssue(issue)}
                          aria-pressed={selectedIssue?.number === issue.number}
                        >
                          <span className={styles.issueNumber}>#{issue.number}</span>
                          <span className={styles.issueTitle}>{issue.title}</span>
                          <span className={styles.status} data-open={issue.state === "open"}>
                            {issue.state === "open" ? "开放" : "已关闭"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {loadMoreError && <p className={styles.error} role="alert">{loadMoreError}</p>}
                {nextPage !== null && (
                  <div className={styles.listFooter}>
                    <button
                      className={styles.secondary}
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? "正在加载…" : "加载更多"}
                    </button>
                  </div>
                )}
              </section>

              {selectedIssue && (
                <section className={styles.detail} aria-label="Issue 详情">
                  <div className={styles.detailMeta}>
                    <span className={styles.issueNumber}>#{selectedIssue.number}</span>
                    <span className={styles.status} data-open={selectedIssue.state === "open"}>
                      {selectedIssue.state === "open" ? "开放" : "已关闭"}
                    </span>
                    {selectedIssue.createdAt && (
                      <time dateTime={selectedIssue.createdAt}>
                        {selectedIssue.createdAt.slice(0, 10)}
                      </time>
                    )}
                    {selectedIssue.url?.startsWith("https://github.com/") && (
                      <a href={selectedIssue.url} target="_blank" rel="noreferrer">
                        GitHub 原文 ↗
                      </a>
                    )}
                  </div>
                  <h3 className={styles.detailTitle}>{selectedIssue.title}</h3>
                  {selectedIssue.labels?.length > 0 && (
                    <ul className={styles.labels} aria-label="标签">
                      {selectedIssue.labels.map((label) => <li key={label}>{label}</li>)}
                    </ul>
                  )}
                  <section className={styles.analysis} aria-label="AI 分析">
                    <button
                      className={styles.primary}
                      type="button"
                      onClick={analyzeIssue}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? "正在分析…" : "分析这条 Issue"}
                    </button>
                    {isAnalyzing && <span role="status" className={styles.srOnly}>正在分析 Issue</span>}
                    {analysisError?.issue === selectedIssue && (
                      <p className={styles.error} role="alert">{analysisError.message}</p>
                    )}
                    {analysis?.issue === selectedIssue && (
                      <div className={styles.analysisResult} role="status">
                        <div className={styles.analysisHeading}>
                          <h4>AI 分析结果</h4>
                          <span className={styles.category}>{analysis.type}</span>
                        </div>
                        <dl>
                          <dt>摘要</dt>
                          <dd>{analysis.summary}</dd>
                          <dt>判断依据</dt>
                          <dd>{analysis.reason}</dd>
                        </dl>
                        <p className={styles.disclaimer}>AI 分析可能不准确，请以 Issue 原文为准。</p>
                      </div>
                    )}
                  </section>
                  <section className={styles.description}>
                    <h4>正文</h4>
                    <p>{selectedIssue.body || "此 Issue 没有正文。"}</p>
                  </section>
                </section>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
