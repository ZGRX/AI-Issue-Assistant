const button = document.getElementById("load-issues");
const repoInput = document.getElementById("repo-url");
const issueList = document.getElementById("issue-list");
// Read and validate the repository URL when the button is clicked.
button.addEventListener("click", async () => {
  let input;
//
  try{
    input =new URL(repoInput.value);
  }catch {
    console.log("please input the entire Github website")
    return
  }

  if (input.hostname != "github.com"){
    console.log("only support github.com");
    return;
  }

  // A repository path must contain an owner and a repository name.
  const parts = input.pathname.slice(1).split("/");
  if(parts.length !== 2 || !parts[0]||!parts[1]){
    console.log("path is not conform to format");
    return;
  }
  // Build the GitHub API URL from the validated repository path.
  const apiUrl = `https://api.github.com/repos/${parts[0]}/${parts[1]}/issues?per_page=5`;

  console.log(apiUrl);
  const response = await fetch(apiUrl);
  console.log(response.status);
  // Stop before reading issue data if GitHub reports an error.
  if(!response.ok){
    console.log(response.status);
    return;
  }
  const issues = await response.json();
  issueList.replaceChildren();//clear the old list
  if(issues.length === 0){
    const item  = document.createElement("li");//create list
    item.textContent = "not have Issue";
    issueList.appendChild(item);
    return;
  }
  for(const issue of issues){
    const item = document.createElement("li");
    item.textContent = issue.title;
    issueList.appendChild(item);
  }

  console.log(issues[0].title);
  console.log(input.hostname);
  console.log(input.pathname.slice(1).split("/"));
});