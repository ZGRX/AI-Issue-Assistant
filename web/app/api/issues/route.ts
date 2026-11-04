import { getData, parseGitHubRepoUrl } from "../../../../phase1/issue";

export async function GET(request: Request) {
  const repoUrl = new URL(request.url).searchParams.get("repo");
  const repo = repoUrl === null ? null : parseGitHubRepoUrl(repoUrl);

  if (repo === null) {
    return Response.json({ error: "仓库地址格式不正确" }, { status: 400 });
  }

  const apiUrl =
    `https://api.github.com/repos/` +
    `${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/issues`;
  const issues = await getData(apiUrl);

  if (issues === null) {
    return Response.json({ error: "获取 Issue 失败" }, { status: 502 });
  }

  return Response.json({ issues });
}
