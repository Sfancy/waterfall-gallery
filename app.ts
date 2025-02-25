async function fetchMenu() {
  const response = await fetch("api/menu");
  const data = await response.json();
  if (Array.isArray(data)) {
    // const fragment = document.createDocumentFragment();
    const ul = document.createElement("ul");
    data.forEach((d) => {
      const li = document.createElement("li");
      li.innerHTML = `<a class="folder-item" href="/${d}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>${d}</a>`;
      ul.appendChild(li);
    });
    document.querySelector("#root")!.appendChild(ul);
  }
}

fetchMenu();
