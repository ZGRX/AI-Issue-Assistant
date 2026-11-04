"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Issue = {
  number: number;
  title: string;
  state: string;
  body: string;
};

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

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [submittedRepoUrl, setSubmittedRepoUrl] = useState("");
  const [visibleIssues, setVisibleIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  return (
    <div className={styles.page} style={{ background: "#f3f6fb" }}>
      <main
        className={styles.main}
        style={{
          gap: 28,
          justifyContent: "flex-start",
          background: "#ffffff",
          color: "#172334",
        }}
      >
        <header>
          <p style={{ color: "#526782", marginBottom: 8 }}>GitHub Issue 浏览器</p>
          <h1 style={{ fontSize: 36, lineHeight: 1.2 }}>AI Issue Assistant</h1>
          <p style={{ color: "#526782", marginTop: 12 }}>
            输入公开仓库地址，查看 Issue 列表和详情。
          </p>
        </header>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
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
              const response = await fetch(
                `/api/issues?repo=${encodeURIComponent(submittedUrl)}`,
              );
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }

              const data: unknown = await response.json();
              if (
                typeof data !== "object" ||
                data === null ||
                !("issues" in data) ||
                !Array.isArray(data.issues)
              ) {
                throw new Error("接口返回的数据格式不正确");
              }

              const receivedIssues = data.issues as Issue[];
              setVisibleIssues(receivedIssues);
              setSelectedIssue(receivedIssues[0] ?? null);
              setStatus("success");
            } catch {
              setErrorMessage("获取 Issue 失败，请稍后重试。");
              setStatus("error");
            }
          }}
          style={{ width: "100%", display: "grid", gap: 12 }}
        >
          <label htmlFor="repo-url" style={{ fontWeight: 600 }}>
            GitHub 仓库地址
          </label>
          <input
            id="repo-url"
            type="url"
            required
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/owner/repo"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #b9c6d8",
              borderRadius: 8,
              fontSize: 16,
              color: "#172334",
              background: "#ffffff",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: "fit-content",
              padding: "11px 18px",
              border: 0,
              borderRadius: 8,
              background: "#2459d3",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 600,
              cursor: status === "loading" ? "wait" : "pointer",
            }}
          >
            查看 Issue
          </button>
        </form>

        {status === "idle" && (
          <p style={{ color: "#526782" }}>输入仓库地址并提交，即可查看 Issue。</p>
        )}
        {status === "error" && (
          <p role="alert" style={{ color: "#b42318" }}>
            {errorMessage}
          </p>
        )}
        {status === "loading" && (
          <p role="status" style={{ color: "#526782" }}>
            正在加载 Issue...
          </p>
        )}
        {status === "success" && (
          <section style={{ width: "100%", display: "grid", gap: 20 }}>
            <div>
              <p style={{ overflowWrap: "anywhere" }}>
                已提交地址：{submittedRepoUrl}
              </p>
            </div>
            {visibleIssues.length === 0 ? (
              <p>暂无 Issue</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 20,
                }}
              >
                <section aria-label="Issue 列表">
                  <h2 style={{ fontSize: 20, marginBottom: 12 }}>Issue 列表</h2>
                  <ul style={{ listStyle: "none", display: "grid", gap: 8 }}>
                    {visibleIssues.map((issue) => (
                      <li key={issue.number}>
                        <button
                          type="button"
                          onClick={() => setSelectedIssue(issue)}
                          aria-pressed={selectedIssue?.number === issue.number}
                          style={{
                            width: "100%",
                            padding: 14,
                            border: "1px solid #d9e1ed",
                            borderRadius: 8,
                            background:
                              selectedIssue?.number === issue.number
                                ? "#eaf1ff"
                                : "#ffffff",
                            color: "#172334",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ display: "block", fontWeight: 600 }}>
                            #{issue.number} {issue.title}
                          </span>
                          <span style={{ color: "#526782", fontSize: 14 }}>
                            {issue.state === "open" ? "进行中" : "已关闭"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>

                {selectedIssue && (
                  <section
                    aria-label="Issue 详情"
                    style={{
                      padding: 20,
                      border: "1px solid #d9e1ed",
                      borderRadius: 10,
                      alignSelf: "start",
                    }}
                  >
                    <p style={{ color: "#526782", fontSize: 14 }}>
                      Issue #{selectedIssue.number} · {selectedIssue.state}
                    </p>
                    <h2 style={{ fontSize: 22, marginTop: 10 }}>
                      {selectedIssue.title}
                    </h2>
                    <p style={{ lineHeight: 1.7, marginTop: 14 }}>
                      {selectedIssue.body}
                    </p>
                  </section>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
