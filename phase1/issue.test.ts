import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { getData, parseGitHubRepoUrl, toIssue } from "./issue";
import type { GitHubIssue, Issue } from "./issue";

const apiUrl = "https://api.github.com/repos/example/project/issues";

function makeGitHubIssue(overrides: Partial<GitHubIssue> = {}): GitHubIssue {
  return {
    number: 123,
    title: "Button does not work",
    state: "open",
    labels: [{ name: "bug" }, { name: "ui" }],
    created_at: "2026-10-29T12:00:00Z",
    html_url: "https://github.com/example/project/issues/123",
    ...overrides,
  };
}

const expectedIssue: Issue = {
  number: 123,
  title: "Button does not work",
  state: "open",
  labels: ["bug", "ui"],
  createdAt: "2026-10-29T12:00:00Z",
  url: "https://github.com/example/project/issues/123",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// 使用模拟响应，不连接 GitHub；每个测试结束后自动恢复 fetch 和日志。
function mockFetch(t: TestContext, result: Response | Error) {
  t.mock.method(console, "log", () => {});
  return t.mock.method(globalThis, "fetch", async () => {
    if (result instanceof Error) {
      throw result;
    }
    return result;
  });
}

for (const url of [
  "https://github.com/facebook/react",
  "https://github.com/facebook/react/",
]) {
  test(`URL 解析：接受 ${url}`, () => {
    deepStrictEqual(parseGitHubRepoUrl(url), {
      owner: "facebook",
      repo: "react",
    });
  });
}

for (const url of [
  "not-a-url",
  "http://github.com/facebook/react",
  "https://example.com/facebook/react",
  "https://github.com.example.com/facebook/react",
  "https://github.com",
  "https://github.com/facebook",
  "https://github.com//react",
  "https://github.com/facebook/react/issues",
]) {
  test(`URL 解析：拒绝 ${url}`, (t) => {
    t.mock.method(console, "log", () => {});
    strictEqual(parseGitHubRepoUrl(url), null);
  });
}

test("Issue 转换：提取标签名称并对应时间和链接字段", () => {
  deepStrictEqual(toIssue(makeGitHubIssue()), expectedIssue);
});

test("Issue 转换：无标签的 closed Issue 保留空标签数组", () => {
  deepStrictEqual(toIssue(makeGitHubIssue({ state: "closed", labels: [] })), {
    ...expectedIssue,
    state: "closed",
    labels: [],
  });
});

test("获取列表：过滤混入的 PR，返回转换后的全部 Issue", async (t) => {
  const secondIssue = makeGitHubIssue({
    number: 456,
    title: "A question",
    labels: [],
    html_url: "https://github.com/example/project/issues/456",
  });
  const pullRequest = {
    ...makeGitHubIssue({ number: 789 }),
    pull_request: { url: "https://api.github.com/repos/example/project/pulls/789" },
  };
  const fetchMock = mockFetch(t, jsonResponse([
    pullRequest,
    makeGitHubIssue(),
    secondIssue,
  ]));

  deepStrictEqual(await getData(apiUrl), [
    expectedIssue,
    {
      ...expectedIssue,
      number: 456,
      title: "A question",
      labels: [],
      url: "https://github.com/example/project/issues/456",
    },
  ]);
  strictEqual(fetchMock.mock.callCount(), 1);
  strictEqual(fetchMock.mock.calls[0].arguments[0], apiUrl);
});

test("获取列表：空列表返回 []", async (t) => {
  mockFetch(t, jsonResponse([]));
  deepStrictEqual(await getData(apiUrl), []);
});

test("获取列表：只有 PR 时返回 []", async (t) => {
  mockFetch(t, jsonResponse([
    { ...makeGitHubIssue(), pull_request: { url: "https://example.com/pull/123" } },
  ]));
  deepStrictEqual(await getData(apiUrl), []);
});

for (const status of [403, 404]) {
  test(`获取列表：HTTP ${status} 返回 null，且不解析正文`, async (t) => {
    const response = jsonResponse({ message: "Request failed" }, status);
    const jsonMock = t.mock.method(response, "json");
    mockFetch(t, response);

    strictEqual(await getData(apiUrl), null);
    strictEqual(jsonMock.mock.callCount(), 0);
  });
}

test("获取列表：响应正文不是数组时返回 null", async (t) => {
  mockFetch(t, jsonResponse({ message: "Unexpected response" }));
  strictEqual(await getData(apiUrl), null);
});

test("获取列表：网络请求失败时返回 null", async (t) => {
  mockFetch(t, new TypeError("fetch failed"));
  strictEqual(await getData(apiUrl), null);
});

test("获取列表：正文不是有效 JSON 时返回 null", async (t) => {
  mockFetch(t, new Response("not JSON", { status: 200 }));
  strictEqual(await getData(apiUrl), null);
});
