#! /usr/bin/env node

/* Import of shell package for shell commands, 
and commander for command managing*/
"use strict"
var shell = require("shelljs");
var program = require('commander')

/* 
  Define configuration for commander */
program.version('0.1.2')
    .option('--project [filename]', 'Start project')
    .parse(process.argv);

/* Function that is being exported to execute project initialization.
   It clones git repo that contains base directory. */
function convertThis() {
  if(program.project){
    //Gets input name for new project
    var folder = program.project;
    //If project name wasn't typed
    if (folder === true){
        console.log("SSG couldn't find  the name of the application you want to create. The default name is 'app'.")
        folder = "app"
    }
    //Clones git repo, renames it to project name and changes it in package.json.
    shell.exec(`git clone https://github.com/valebm/ssg-base.git`)
    shell.exec(`rename ssg-base ${folder}`)
    shell.exec(`cd ${folder} && json -I -f package.json -e "this.name='${folder}'"`)
    console.log(`SSG ${folder} initialized.`)   
  }
}
exports.convert = convertThis;