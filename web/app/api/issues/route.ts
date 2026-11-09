import { getIssuePage, parseGitHubRepoUrl } from "../../../../phase1/issue";

export async function GET(request: Request) {
  const repoUrl = new URL(request.url).searchParams.get("repo");
  const pageParam = new URL(request.url).searchParams.get("page");//查找URL里面的page的值
  const repo = repoUrl === null ? null : parseGitHubRepoUrl(repoUrl);

  if (repo === null) {
    return Response.json({ error: "仓库地址格式不正确" }, { status: 400 });
  }
  let page: number;
  // 下一步：pageParam 没有值时使用第 1 页。
  if (pageParam == null){page =1;}
  else page=Number(pageParam);
  // 检查 page 是否为大于 0 的整数，无效时返回 400。

  if (!Number.isInteger(page) || page <= 0){
    return Response.json({ error: "页码必须是正整数" }, { status: 400 });
  }
  // 在下方 GitHub 请求地址中带上 page，让  GitHub 返回对应页。
  const apiUrl =
    `https://api.github.com/repos/` +
    `${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/issues?page=${page}`;
  const result = await getIssuePage(apiUrl);

  if (result === null) {
    return Response.json({ error: "获取 Issue 失败" }, { status: 502 });
  }

  return Response.json(result);
}
