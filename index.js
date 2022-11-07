"use strict";

/*
Практическое задание
Используя наработки практического задания прошлого урока, 
создайте веб-версию приложения.
Сделайте так, чтобы при запуске она:
● показывала содержимое текущей директории;
● давала возможность навигации по каталогам из исходной папки;
● при выборе файла показывала его содержимое.
*/

import { lstatSync, readdirSync, readFileSync, readFile } from "fs";
import pkgColors from "colors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import { parse } from "node-html-parser";

const { green } = pkgColors;
const app = express();
const __filename = fileURLToPath(import.meta.url);

const isDir = (path) => {
  return lstatSync(path).isDirectory();
};

let __dirname = dirname(__filename);
let currPath = readdirSync(__dirname);
let root, subDir;

readFile(join(__dirname + "/public/index.html"), "utf8", (err, html) => {
  if (err) {
    throw err;
  }
  root = parse(html);
  const elList = root.querySelector(".list");

  currPath.map((item) =>
    isDir(__dirname + "/" + item)
      ? elList.appendChild(
          parse(
            `<li class="item dir"><a href="${
              __dirname + "/" + item
            }"><i class="fa fa-folder" aria-hidden="true"></i>${item}</a></li>`
          )
        )
      : elList.appendChild(
          parse(
            `<li class="item"><a href="${
              __dirname + "/" + item
            }">${item}</a></li>`
          )
        )
  );
});

app.listen(3000, () => {
  console.log(green("Server express started successfully on port: 3000"));
});

app.get("*", (req, res) => {
  if (req.url === "/" || req.url === dirname(__filename)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(root.toString());
  } else if (!req.url.match(/style.css/)) {
    if (isDir(req.url)) {
      readFile(join(__dirname + "/public/index.html"), "utf8", (err, html) => {
        if (err) {
          throw err;
        }
        subDir = parse(html);
        const elListSubDir = subDir.querySelector(".list");

        let currPath = readdirSync(req.url);
        let lastIndex = req.url.lastIndexOf("/");
        let prevPath = req.url.substring(0, lastIndex);

        elListSubDir.appendChild(
          parse(`<li class="item dots"><a href="${prevPath}">..</a></li>`)
        );

        currPath.map((item) =>
          isDir(req.url + "/" + item)
            ? elListSubDir.appendChild(
                parse(
                  `<li class="item dir"><a href="${
                    req.url + "/" + item
                  }"><i class="fa fa-folder" aria-hidden="true"></i>${item}</a></li>`
                )
              )
            : elListSubDir.appendChild(
                parse(
                  `<li class="item"><a href="${
                    req.url + "/" + item
                  }">${item}</a></li>`
                )
              )
        );

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(subDir.toString());
        return res.end();
      });
    } else {
      readFile(req.url, "utf8", (err, data) => {
        if (err) {
          throw err;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        return res.end();
      });
    }
  } else {
    res.writeHead(200, { "Content-type": "text/css" });
    const fileContents = readFileSync(
      join(__dirname + "/public/css/style.css"),
      {
        encoding: "utf8",
      }
    );
    res.write(fileContents);
    return res.end();
  }
});
