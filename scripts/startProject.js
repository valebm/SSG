#! /usr/bin/env node
var shell = require("shelljs");

var folder = process.argv[2] || "app"
//shell.exec(`mkdir ${folder} && cd ${folder} && npm init -y`);
if (folder === "app"){
    console.log("SSG couldn't find  the name of the application you want to create. The default name is 'app'.")
}
shell.exec(`git clone https://github.com/valebm/SSG.git`)
shell.exec(`rename SSG ${folder}`)
shell.exec(`cd ${folder} && json -I -f package.json -e "this.name='app'"`)
console.log(`SSG ${folder} initialized.`)