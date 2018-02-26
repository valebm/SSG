#! /usr/bin/env node
var shell = require("shelljs");

var folder = process.argv[2] || "post"
if (folder === "post"){
    console.log("SSG couldn't find  the name of the post you want to create. Please include it.")
    console.log("For example: ssg-post post_name.")
}
shell.exec(`cd src/posts && mkdir ${folder}`)
shell.exec(`cd src/posts/${folder} && copy /y NUL index.html >NUL`)