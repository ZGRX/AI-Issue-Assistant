// 定义 Issue 类型
interface Issue {
    id: number;
    title: string;
    state: "open" | "closed";
}

// 声明变量
let number: number = 1;
let title: string = "issues";
let state: "open" | "closed" = "open";

// 创建 Issue 对象
const issue: Issue = {
    id: 123,
    title: "Button does not work",
    state: "open"
};