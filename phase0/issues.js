async function getData() {
    const response = await fetch('https://api.github.com/repos/facebook/react/issues?per_page=5');
    
    const issues = await response.json();
    if(!response.ok) {
        console.log(response.status);
        return;
    }
    for(let i = 0; i<issues.length ; i++) console.log(issues[i].title);
}

getData();
