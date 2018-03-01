#! /usr/bin/env node
"use strict"
var shell = require("shelljs");
var program = require('commander')

/* Define configuration for commander */
program.version('0.1.2')
    .option('--project [filename]', 'Start project')
    .parse(process.argv);

function convertThis() {
  if(program.project){
    var folder = program.project;
    if (folder === true){
        console.log("SSG couldn't find  the name of the application you want to create. The default name is 'app'.")
        folder = "app"
    }
    shell.exec(`git clone https://github.com/valebm/ssg-base.git`)
    shell.exec(`rename ssg-base ${folder}`)
    shell.exec(`cd ${folder} && json -I -f package.json -e "this.name='${folder}'"`)
    console.log(`SSG ${folder} initialized.`)
    
  }
}

exports.convert = convertThis;