export async function POST(request:Request){
    const data = await request.json();
    console.log(data.title, data.body)
    return Response.json({
        summary:"点击保存后，页面变成白屏",
        type:"Bug",
        reason: "已有的保存功能在操作后出现异常。",
    });
}   