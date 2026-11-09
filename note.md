# AI Issue Assistant 学习笔记

## JavaScript 基础

### 字符串与模板字符串

模板字符串（template literal）用反引号包起来。可以用 `${表达式}` 把变量、计算结果或函数返回值填进字符串。这个过程叫**插值**（interpolation）。

```js
const page = 2;
const owner = "facebook";

const path = `/issues?page=${page}`;               // "/issues?page=2"
const next = `下一页是第 ${page + 1} 页`;            // "下一页是第 3 页"
const repoOwner = `${encodeURIComponent(owner)}`; // "facebook"
```

在 `/issues?page=${page}` 里，`?page=` 是固定文本，其中的 `page` 是 URL 的参数名。花括号里的 `page` 是 JavaScript 变量，运行时会把它的值填进去。这里的效果和 `"/issues?page=" + page` 一样。

| 写法（假设 `page = 2`） | 得到的字符串 |
| --- | --- |
| `` `/issues?page=${page}` `` | `/issues?page=2` |
| `` `/issues?page={page}` `` | `/issues?page={page}` |
| `"/issues?page=${page}"` | `/issues?page=${page}` |

项目里的分页问题出在第二种写法。服务端读到了页码，但因为漏了 `$`，发给 GitHub 的地址里仍然是文字 `{page}`。

模板字符串也可以直接跨行，字符串会保留换行。拼 URL 时可以让地址保持在同一行。

```js
const message = `正在加载 Issue
当前页码：${page}`;
```

### map

`map` 可以理解成：**把数组里的每一项交给一个函数，再把函数的返回值装进新数组。**

先看数字例子：

```js
const numbers = [1, 2, 3];
const result = numbers.map((n) => n * 2);
```

它依次做三次计算：

```
取出 1 → n 是 1 → 返回 2
取出 2 → n 是 2 → 返回 4
取出 3 → n 是 3 → 返回 6
```

所以 `result` 是 `[2, 4, 6]`，原来的 `numbers` 仍是 `[1, 2, 3]`。

你的代码也是同样的过程：

```ts
issues.map((item) => toIssue(item))
```

每次取出一条 Issue，暂时叫它 `item`，交给 `toIssue` 转换；转换后的对象被放进新数组。**`item` 是原数据，`toIssue(item)` 的返回值才是新数组里的数据。**

#### 标签数组与空数组调用 map

```ts
input.labels.map((label) => label.name)
```

这行代码从每个标签对象中取出 `name` 的值，组成一个新数组：

```ts
const labels = [{ name: "bug" }, { name: "ui" }];
const names = labels.map((label) => label.name);
// names 是 ["bug", "ui"]
```

`label` 是我们自己取的参数名，每次代表当前处理的一个标签对象；`label.name` 是该对象的 `name` 字段值。

**空数组调用 `map`，结果仍然是空数组。**因为没有元素，括号里的处理函数一次也不会执行。

```ts
const labels: { name: string }[] = [];
const names = labels.map((label) => label.name);
// names 是 []，处理函数执行了 0 次
```

所以 Issue 没有标签、`labels` 为 `[]` 时，现有转换代码可以直接处理，不需要为这个情况添加额外判断。这里说的是空数组 `[]`，不包括 `null` 或字段缺失。

## Web API

### 用 `URL` 解析网址

`URL` 是用来解析和操作网址的 Web API。小写的 `url` 通常只是我们自己取的变量名。

```ts
const url = new URL("https://github.com/owner/repo?tab=issues&page=2");
```

`new URL(...)` 把网址字符串变成一个 `URL` 对象。这个对象的常用属性有：

| 写法                             | 含义                              | 例子中的结果      |
| -------------------------------- | --------------------------------- | ----------------- |
| `url.protocol`                 | 协议                              | `"https:"`      |
| `url.hostname`                 | 域名                              | `"github.com"`  |
| `url.pathname`                 | 路径                              | `"/owner/repo"` |
| `url.searchParams.get("page")` | 读取 `?` 后名为 `page` 的参数 | `"2"`           |

`searchParams` 管理网址中 `?` 后面的查询参数。`.get()` 取到的是字符串；参数不存在时返回 `null`。

在当前的 `route.ts` 中，`request.url` 是收到的请求网址。`new URL(request.url)` 用来解析它，再通过 `searchParams.get("page")` 读取页码。创建 `URL` 对象只会解析网址，不会发起网络请求。

## React

### 用 `onChange` 读取输入框

`onChange` 的意思是「当内容变化时」。在 React 的文本输入框里，打字、删除或粘贴导致内容变化时，React 会调用传给 `onChange` 的函数。

```tsx
<input onChange={(event) => setRepoUrl(event.target.value)} />
```

1. `event` 是 React 传给处理函数的事件对象。
2. `event.target` 是触发这次事件的元素，这里是输入框。
3. `event.target.value` 是输入框当前的完整文字。
4. `setRepoUrl(...)` 把这段文字存入 React 状态，供提交表单时使用。

例如，空输入框先输入 `g`，读取到的是 `"g"`。接着输入 `i`，读取到的是 `"gi"`。

原生 HTML 的事件属性写作 `onchange`。对于文本输入框，原生 `change` 事件通常在修改内容后离开输入框时触发。React JSX 写作 `onChange`，文本内容变化时就会触发，行为类似原生 `input` 事件。
