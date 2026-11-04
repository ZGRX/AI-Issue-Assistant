### map

`map` 可以理解成：**把数组里的每一项交给一个函数，再把函数的返回值装进新数组。**

先看数字例子：

```
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

```
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


onChange



`onChange` 是 React 监听**用户操作（输入、选择、切换等）**的**事件监听器**。

用大白话讲：它的作用就是“当内容发生改变时，立刻跑去执行某段代码”。

---

### * 1. 拆开名字看意思

* **`on`**：在……的时候 / 当……发生时
* **`change`**：改变 / 变化
* 组合起来就是：**“当（输入框的内容）发生变化时”**。

只要用户在输入框里**敲了一个字母**、**删了一个字符**，或者**粘贴了一段文字**，`onChange` 就会立刻被触发一次。

---

### 2. 在你那段代码里的实际表现

```javascript
onChange={(event) => setRepoUrl(event.target.value)}
```

当你在这个框里打字时，背后的过程是这样的：

1. **用户打字**：比如你在框里打了字母 `a`。
2. **触发 `onChange**`：React 监测到了内容变了，立刻自动调用你写的 `(event) => ...` 这个箭头函数。
3. **拿到最新值**：函数里的 `event.target.value` 抓到了当前的最新文本 `"a"`。
4. **存入状态**：`setRepoUrl("a")` 把这个 `"a"` 存进状态里。

---

### 3. 原生 HTML vs React 写法区别

|                    | HTML 标准写法                                | React JSX 写法                                  |
| ------------------ | -------------------------------------------- | ----------------------------------------------- |
| **写法**     | `onchange`（全部小写）                     | `onChange`（**小驼峰命名**，即 C 大写） |
| **触发时机** | 通常要等输入框**失去焦点（光标离开）**才触发 | 只要**每敲一下键盘（内容一变）**就会立刻触发    |

---

### 一句话记忆

**`onChange` 就是输入框的“监测警报器”，只要用户动了输入框里的文字，它就立刻喊 `setRepoUrl` 去更新数据。**




`event.target.value` 里的 **`target.value`**，是用 JavaScript 在浏览器里**获取“当前触发事件的输入框里到底写了什么字”的工具**。

我们可以把它拆成三层来看：

---

### 1. 逐层拆解（三连套）

```javascript
  event          .target                .value
 (发生的事情)   (触发事件的那个输入框)    (输入框里的具体文字)
```

1. **`event`（事件对象）**：
   当用户打字触发 `onChange` 时，浏览器会自动打包生成一个叫 `event` 的“包裹/报告”。这个包裹里包含了**刚才发生的这件事的所有信息**（比如按了哪个键、点击了什么位置等）。
2. **`target`（目标元素）**：
   它是 `event` 包裹里的一个属性，表示“引发这次事件的具体 HTML 元素”。在你这里的代码中，`target` 指的就是那个 `<input>` 输入框本身。
3. **`value`（值）**：
   它是 `<input>` 元素身上自带的一个属性，代表“这个输入框当前里面填写的文本内容”。

---

### 2. 用生活中的例子来理解

想象你给客服打了一个电话（触发了 `onChange`）：

* **`event`**：整条通话记录。
* **`event.target`**：拨打你电话的那台**手机硬件**（定位到是哪个设备在发信号）。
* **`event.target.value`**：你手机屏幕上**显示的那行短信内容**（拿到了设备里的数据）。

---

### 3. 代码里的动态过程

假设输入框里原本是空的：

1. 你在键盘上敲下了字母 **`g`**。
2. `onChange` 启动，拿到 `event`。
3. `event.target` 指向这个 `<input>`。
4. `event.target.value` 此时读取出的值就是字符串 **`"g"`**。
5. 执行 `setRepoUrl("g")`，把 `"g"` 存进状态里。

如果你紧接着又打了个 **`i`**，`event.target.value` 读取到的就会自动变成 **`"gi"`**！

---

### 一句话总结

**`event.target.value` 就是“此时此刻输入框里的最新文字”。**

## JavaScript 的 `URL`

`URL` 是 JavaScript 提供的工具，用来解析和操作网址。小写的 `url` 通常只是我们自己取的变量名。

```ts
const url = new URL("https://github.com/owner/repo?tab=issues&page=2");
```

`new URL(...)` 把网址字符串变成一个 `URL` 对象。这个对象的常用属性有：

| 写法 | 含义 | 例子中的结果 |
| --- | --- | --- |
| `url.protocol` | 协议 | `"https:"` |
| `url.hostname` | 域名 | `"github.com"` |
| `url.pathname` | 路径 | `"/owner/repo"` |
| `url.searchParams.get("page")` | 读取 `?` 后名为 `page` 的参数 | `"2"` |

`searchParams` 管理网址中 `?` 后面的查询参数。`.get()` 取到的是字符串；参数不存在时返回 `null`。

在当前的 `route.ts` 中，`request.url` 是收到的请求网址。`new URL(request.url)` 用来解析它，再通过 `searchParams.get("page")` 读取页码。创建 `URL` 对象只会解析网址，不会发起网络请求。
