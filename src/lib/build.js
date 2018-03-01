#! /usr/bin/env node

/* Import of needed packages to handle commands of SGG */
"use strict"
var fs = require('fs');
var shell = require("shelljs");
const fse = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const { promisify } = require('util')
const marked = require('marked')
const frontMatter = require('front-matter')
const globP = promisify(require('glob'))
const config = require(process.cwd()+'\\site.config')
const ejsRenderFile = promisify(ejs.renderFile)
var program = require('commander')

/* Define source and distribution paths */
const srcPath = config.build.basePath
const distPath = config.build.outputPath 

/* Define configuration for commander */
program.version('0.1.2')
    .option('--start [filename]', 'Start project')
    .option('--build', 'Build project')
    .option('--post  [filename]', 'Create a new post')
    .option('--draft  [filename]', 'Create a new draft')
    .option('--postdraft  [filename]', 'Post a draft')
    .option('--serve', 'Serve site')
    .parse(process.argv);

/* Function that is being exported to execute project actions:
    --post: Creates new post in posts folder.
    --draft: Creates new draft in drafts folder.
    --postdraft: Creates selected draft to posts folder.
    --serve: Serves index.ejs to port 5000.
    --build: Builds project into docs folder.
*/
function convertThis() {
  if(program.post) {
    //Gets input name for post
    var myfile = program.post;
    //If name wasn't typed
    if (myfile === true){
      console.log("SSG couldn't find  the name of the post you want to create. Please include it.")
      console.log("For example: ssg-post post_name.")
    }
    //Creates directory for the new post and writes YAML config.
    else{
      fs.mkdir(`./posts/${myfile}`, function(){
        fs.writeFileSync(`./posts/${myfile}/index.html`, '---\nlayout: post\ntag:\n---')
      })
    }
  }
  else if (program.draft){
    //Gets input name for draft
    var myfile = program.draft;
    //If name wasn't typed
    if (myfile === true){
      console.log("SSG couldn't find  the name of the draft you want to create. Please include it.")
      console.log("For example: ssg-draft draft_name.")
    }
    //Creates directory for the new draft and writes YAML config.
    else{
      fs.mkdir(`./drafts/${myfile}`, function(){
      fs.writeFileSync(`./drafts/${myfile}/index.html`, '---\nlayout: draft\ntag:\n---')
      })
    }
  }
  else if (program.postdraft){
    //Gets input name of draft to publish
    var myfile = program.postdraft;
    //If name wasn't typed
    if (myfile === true){
      console.log("SSG couldn't find  the name of the draft you want to post. Please include it.")
      console.log("For example: ssg-post-draft draft_name.")
    }
    //Moves draft folder to the posts folder
    else{
      fse.move(`./drafts/${myfile}/`, `./posts/${myfile}/`, function (err) {
        if (err) {
          console.log(`Error while trying to post draft ${myfile}`);
            return;
        }
      });         
    }
  }
  else if (program.serve){
    shell.exec('serve ./docs')
  }
  else if (program.build){
    //Empties destination folder and copies all project assets to docs folder.
    fse.emptyDirSync(distPath)
    fse.copy(`${srcPath}\\assets`, `${distPath}\\assets`)
    //Goes through all files stored in pages (including ejs, markdown or html.)
    globP('**/*.@(md|ejs|html)', { cwd: `${srcPath}\\pages` })
      .then((files) => {
        files.forEach((file) => {
          const fileData = path.parse(file)
          const destPath = path.join(distPath, fileData.dir)
          //Creates directory for the page being handled in the docs folder.
          fse.mkdirs(destPath)
            .then(() => {
              return fse.readFile(`${srcPath}\\pages\\${file}`, 'utf-8')
            })
            .then((data) => {
              //Gets the data stored in file, including YAML config.
              const pageData = frontMatter(data)
              const templateConfig = Object.assign({}, config, { page: pageData.attributes })
              let pageContent
              //Generates content depending on file type
              switch (fileData.ext) {
                case '.md':
                  pageContent = marked(pageData.body)
                  break
                case '.ejs':
                  pageContent = ejs.render(pageData.body, templateConfig)
                  break
                default:
                  pageContent = pageData.body
              }
              //Gets page layout, or defaults it to 'default' layout.
              const layout = pageData.attributes.layout || 'default'
              //Var to store all posts if the page being handled is a blog
              var posts = []
              if (layout === 'blog'){
              //Goes through all posts stored in posts folder
              return globP('**/*.@(md|ejs|html)', { cwd: `${srcPath}/posts` }).then((filess)=>{
                filess.forEach((file)=>{
                  const blogData = path.parse(file)
                  //Reads post and gets its data, includng YAML config.
                  var readFile = fse.readFileSync(`${srcPath}/posts/${file}`, 'utf-8');
                  const postData = frontMatter(readFile)
                  const postLayout = postData.attributes.layout || 'default'
                  //Makes sure that what's being read is a post (in case layout is still draft)
                  if (postLayout === 'post'){
                    //Gets post YAML config                 
                    const postConfig = Object.assign({}, config, { page: postData.attributes })
                    let postContent
                    //Generate content depending on file type
                    switch (blogData.ext) {
                      case '.md':
                        postContent = marked(postData.body)
                        break
                      case '.ejs':
                        postContent = ejs.render(postData.body, postConfig)
                        break
                      default:
                        postContent = postData.body
                    }                 
                    //Renders post layout with contents               
                    ejsRenderFile(`${srcPath}/layouts/${postLayout}.ejs`, Object.assign({}, postConfig, { body: postContent})).then((str)=>{
                      posts.push(Object.assign({}, Object.assign({}, {page: postData.attributes }),{body: str}))
                    })
                  }
                })
                //Returns all posts found and rendered    
                return posts                   
              }).then((posts)=>{    
                //Renders blog layout with contents and posts   
                return ejsRenderFile(`${srcPath}/layouts/${layout}.ejs`, Object.assign({}, templateConfig, { body: pageContent, posts: posts}))               
                }) 
              }
              else{
                //Renders page layout with contents  
                return ejsRenderFile(`${srcPath}/layouts/${layout}.ejs`, Object.assign({}, templateConfig, { body: pageContent }))
              }
            })
            .then((str) => {
              //Saves html file generated into docs filder  
              fse.writeFile(`${destPath}/${fileData.name}.html`, str)
            })
            .catch((err) => { console.error(err) })
        })
      })
      .catch((err) => { console.error(err) })
  }
}
exports.convert = convertThis;