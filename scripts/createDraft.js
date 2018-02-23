#! /usr/bin/env node
var shell = require("shelljs");

var folder = process.argv[2] || "draft"
shell.exec(`cd src/drafts && mkdir ${folder}`)
shell.exec(`cd src/drafts/${folder} && copy /y NUL index.html >NUL`)