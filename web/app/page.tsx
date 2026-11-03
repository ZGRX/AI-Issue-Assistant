"use client";

import { useState } from "react";
import styles from "./page.module.css";

const issues = [
  {
    number: 123,
    title: "按钮无法点击",
    state: "open",
    body: "点击保存按钮后没有反应，希望检查按钮的事件处理。",
  },
  {
    number: 124,
    title: "页面加载缓慢",
    state: "closed",
    body: "打开 Issue 列表时需要等待较长时间。",
  },
  {
    number: 125,
    title: "登录后页面空白",
    state: "open",
    body: "登录成功后页面没有显示内容，刷新后也没有恢复。",
  },
];

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [submittedRepoUrl, setSubmittedRepoUrl] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(issues[0]);

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
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedRepoUrl(repoUrl.trim());
            setSelectedIssue(issues[0]);
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
            style={{
              width: "fit-content",
              padding: "11px 18px",
              border: 0,
              borderRadius: 8,
              background: "#2459d3",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            查看 Issue
          </button>
        </form>

        {submittedRepoUrl === "" ? (
          <p style={{ color: "#526782" }}>输入仓库地址并提交，即可查看示例页面。</p>
        ) : (
          <section style={{ width: "100%", display: "grid", gap: 20 }}>
            <div>
              <p style={{ overflowWrap: "anywhere" }}>
                已提交地址：{submittedRepoUrl}
              </p>
              <p style={{ color: "#526782", marginTop: 6 }}>
                以下是模拟数据，尚未连接 GitHub。
              </p>
            </div>

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
                  {issues.map((issue) => (
                    <li key={issue.number}>
                      <button
                        type="button"
                        onClick={() => setSelectedIssue(issue)}
                        aria-pressed={selectedIssue.number === issue.number}
                        style={{
                          width: "100%",
                          padding: 14,
                          border: "1px solid #d9e1ed",
                          borderRadius: 8,
                          background:
                            selectedIssue.number === issue.number
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
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
