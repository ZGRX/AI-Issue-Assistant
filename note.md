
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
