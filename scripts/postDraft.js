#! /usr/bin/env node
var shell = require("shelljs");

var draft = process.argv[2] || "notFound"
if (draft === "notFound"){
    console.log("SSG couldn't find  the name of the draft you want to post. Please include it.")
    console.log("For example: ssg-post-draft draft_name.")
}
else{
    shell.exec(`move src/drafts/${draft} src/posts`)
}