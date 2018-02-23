#! /usr/bin/env node
var shell = require("shelljs");

var folder = process.argv[2] || "post"
shell.exec(`cd src/posts && mkdir ${folder}`)
shell.exec(`cd src/posts/${folder} && copy /y NUL index.html >NUL`)