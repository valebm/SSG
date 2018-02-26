#! /usr/bin/env node
var shell = require("shelljs");

var folder = process.argv[2] || "draft"
if (folder === "draft"){
    console.log("SSG couldn't find  the name of the draft you want to create. Please include it.")
    console.log("For example: ssg-draft draft_name.")
}
else{
    shell.exec(`cd src/drafts && mkdir ${folder}`)
    shell.exec(`cd src/drafts/${folder} && copy /y NUL index.html >NUL`)
}