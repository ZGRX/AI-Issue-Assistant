"use client";
import { useState } from "react";
import styles from "./page.module.css";
export default function Home() {
  const issues = [
    { number: 123, title: "按钮无法点击", state: "open",body:"may the force be with you"},
    { number: 124, title: "页面加载缓慢", state: "closed",body:"tomorrow will be better"},
    { number: 125, title: "诸葛润兴牛逼", state: "closed" ,body:"zhuge runxing nb 666"},
  ];
  // useState 返回的是一个包含两项的普通数组
  const stateArray = useState(issues[0]);

  const selectedIssue = stateArray[0];    // 拿到状态值
  const setSelectedIssue = stateArray[1]; // 拿到修改函数
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>AI Issue Assistant</h1>
      <ul>
        {issues.map((issue) => (//issues.map(...)：依次处理数组中的每一条 Issue，最后得到一个新的列表项数组。
          <li key={issue.number}>
            <button type="button" onClick={() => setSelectedIssue(issue)}>
              #{issue.number} {issue.title} {issue.body}
            </button>
            ({issue.state})
          </li>
        ))}
      </ul>
      <h2>{selectedIssue.title}</h2>
      <p>{selectedIssue.body}</p>
      </main>
    </div>
  );
}
