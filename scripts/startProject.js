#! /usr/bin/env node
var shell = require("shelljs");

var folder = process.argv[2] || "app"
//shell.exec(`mkdir ${folder} && cd ${folder} && npm init -y`);
shell.exec(`git clone https://github.com/valebm/SSG.git`)
shell.exec(`rename SSG ${folder}`)
shell.exec(`cd ${folder} && json -I -f package.json -e "this.name='app'"`)
console.log(`SSG ${folder} initialized.`)