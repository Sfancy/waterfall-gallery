import { constants, access, readdir } from "node:fs/promises";
import homepage from "./index.html";
import path from "node:path";

const DATA_PATH = Bun.env.DATA_PATH;

const getHtmlContent = (content = "") => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bun</title>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" type="text/css" href="style/index.css">
  </head>
  <body>
    <div class="container">${content}</div>
  </body>
</html>
`;

const server = Bun.serve({
  port: 3000,
  hostname: "0.0.0.0",
  routes: {
    "/homepage": homepage,
    "/": async () => {
      if (!DATA_PATH) {
        return new Response("Empty data path found in .env file.", {
          status: 404,
        });
      }
      try {
        await access(DATA_PATH, constants.R_OK);
      } catch (error) {
        return new Response(`Unable to access ${DATA_PATH}`, {
          status: 500,
        });
      }
      const allFiles = await readdir(DATA_PATH);
      const menu = allFiles.filter((m) => !m.startsWith("."));
      menu.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      const htmlContent = getHtmlContent(
        `<ul class="menu">
        ${menu
          .map(
            (m) =>
              `<li><a class="folder-item" href="/${m}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>${m}</a></li>`
          )
          .join("\n")}</ul>`
      );

      return new Response(htmlContent, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
    "/:name": async (req) => {
      const files = await readdir(path.join(DATA_PATH, req.params.name), {
        recursive: true,
      });
      files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      const images = files
        .filter((f) => !f.startsWith("."))
        .map((f) => `<img src="images/${req.params.name}/${f}" />`)
        .join("\n");
      const content = getHtmlContent(images);
      return new Response(content, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
    "/images/:folder/:name": (req) => {
      const file = Bun.file(
        path.join(DATA_PATH, req.params.folder, req.params.name)
      );
      return new Response(file);
    },
    "/style/:name": (req) => {
      const file = Bun.file(`./style/${req.params.name}`);
      return new Response(file);
    },
    "/api/menu": async (req) => {
      const allFiles = await readdir(DATA_PATH);
      const menu = allFiles.filter((m) => !m.startsWith("."));
      menu.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      return new Response(JSON.stringify(menu), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    "/favicon.ico": new Response(await Bun.file("./favicon.ico").bytes(), {
      headers: {
        "Content-Type": "image/x-icon",
      },
    }),
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);

// Open brower
Bun.spawn(["open", `http://localhost:${server.port}`]);
