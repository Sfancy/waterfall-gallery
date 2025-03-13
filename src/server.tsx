import { serve } from "bun";
import { constants, access, readdir } from "node:fs/promises";
import path from "node:path";
import fs from "node:fs";
import index from "./index.html";

const DATA_PATH = Bun.env.DATA_PATH;

const TRASH_PATH = path.join(
  path.dirname(path.dirname(import.meta.path)),
  ".trash"
);

const deletedFiles = new Map<
  string,
  {
    originalPath: string;
    trashPath: string;
    timestamp: number;
  }
>();

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    /* send folder names */
    "/api/media/:folder": async (req) => {
      const files = await readdir(path.join(DATA_PATH, req.params.folder), {
        recursive: true,
      });
      files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      const mediaFiles = files.filter((f) => !f.startsWith("."));
      return new Response(JSON.stringify(mediaFiles), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    "/api/media": {
      async GET(req) {
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
        return new Response(JSON.stringify(menu), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
      async DELETE(req) {
        try {
          const { name } = await req.json();
          fs.mkdirSync(TRASH_PATH, { recursive: true });
          const originalFilePath = path.join(DATA_PATH, name);
          const tempTrashFilePath = path.join(TRASH_PATH, name);
          // await file.delete();
          // const file = Bun.file();
          await Bun.write(tempTrashFilePath, Bun.file(originalFilePath));
          await Bun.file(originalFilePath).delete();
          deletedFiles.set(name, {
            originalPath: originalFilePath,
            trashPath: tempTrashFilePath,
            timestamp: Date.now(),
          });
          return new Response(null, { status: 204 });
        } catch (error) {
          return new Response(error, { status: 500 });
        }
      },
    },

    /* restore image */
    "/api/media/restore": {
      async POST(req) {
        const { name } = await req.json();

        if (!deletedFiles.has(name)) {
          return new Response(
            JSON.stringify({ error: "File not found in trash" }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const { originalPath, trashPath } = deletedFiles.get(name);

        try {
          // Move file back from trash to original location
          await Bun.write(originalPath, Bun.file(trashPath));
          await Bun.file(trashPath).delete();

          // Remove from deleted files map
          deletedFiles.delete(name);

          return new Response(
            JSON.stringify({ message: "File restored successfully" }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },

    /* send image as file */
    "/media/:folder/:name": (req) => {
      const file = Bun.file(
        path.join(DATA_PATH, req.params.folder, req.params.name)
      );
      return new Response(file);
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
