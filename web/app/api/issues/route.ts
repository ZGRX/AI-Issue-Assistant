import { getData, parseGitHubRepoUrl } from "../../../../phase1/issue";

export async function GET(request: Request) {
  const repoUrl = new URL(request.url).searchParams.get("repo");
  const pageParam = new URL(request.url).searchParams.get("page");
  const repo = repoUrl === null ? null : parseGitHubRepoUrl(repoUrl);

  if (repo === null) {
    return Response.json({ error: "仓库地址格式不正确" }, { status: 400 });
  }

  // 下一步：pageParam 没有值时使用第 1 页。
  // 检查 page 是否为大于 0 的整数，无效时返回 400。
  // 在下方 GitHub 请求地址中带上 page，让 GitHub 返回对应页。
  const apiUrl =
    `https://api.github.com/repos/` +
    `${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/issues`;
  const issues = await getData(apiUrl);

  if (issues === null) {
    return Response.json({ error: "获取 Issue 失败" }, { status: 502 });
  }

  return Response.json({ issues });
}
