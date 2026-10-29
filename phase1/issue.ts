import { deepStrictEqual } from "node:assert/strict";
// 定义 Issue 类型
interface Issue {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  createdAt: string;
  url: string;
}
const issue: Issue = {
  number: 123,
  title: "Button does not work",
  state: "open",
  labels: ["bug", "ui"],
  createdAt: "2026-10-29T12:00:00Z",
  url: "https://github.com/owner/repo/issues/123",
};

//get owner and string
function parseGitHubRepoUrl(input: string): { owner: string; repo: string } | null{
    let website;
    try{
        website = new URL(input);
    }catch{
        console.log("please input the entire Github website")
        return null;
    }
    if (website.protocol !== "https:") {
        console.log("only support https");
        return null;
    }

    const is_github = website.hostname;
    if(is_github != "github.com"){
        console.log("only support github.com");
        return null;
    }

    const parts = website.pathname.slice(1).split("/");
    // A trailing slash adds an empty string" " to the array after split("/").
    if (parts[parts.length - 1] === "") {
        parts.pop();
    }
    console.log(parts);
    if(parts.length !== 2 || !parts[0] || !parts[1]){
        console.log("path is not conform to format");
        return null;
    }
    const owner:string = parts[0];
    const repo:string = parts[1];
    return {owner , repo}

}
//get the repository domain name
const parsed = parseGitHubRepoUrl("https://github.com/facebook/react/");
if (parsed !== null) {
  const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues`;//拼接
  console.log(apiUrl);
  getData(apiUrl);
}
//get the repository data
async function getData(apiUrl: string) {
  try {
    const response = await fetch(apiUrl);//Response（响应）对象，里面有 HTTP 状态码、响应头和响应正文；

    if (!response.ok) {
      console.log("HTTP status:", response.status);
      return;
    }
    const data: unknown = await response.json();

    if (!Array.isArray(data)) {//data是一个数组，不是就返回
    console.log("Response is not an array");
    return;
    }

    //因为这个工具当前要展示的是 Issue 列表，而 GitHub 的 Issues 接口也会把 Pull Request 放进结果里。
    //贴出的第一项有 pull_request 字段，说明它是 PR；普通 Issue 没有这个字段
    const issues = data.filter((item) => !("pull_request" in item));//把data里面带pr的过滤掉，创建issue数组
    console.log("API items:", data.length);
    console.log("Issues:", issues.length);


    console.log("success, HTTP status:", response.status);
  } catch (error) {
    console.log("Network error:", error);
  }
}

deepStrictEqual(
    parseGitHubRepoUrl("https://github.com/facebook/react/"),
    { owner:"facebook",repo:"react"});
