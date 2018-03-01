#! /usr/bin/env node
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

function convertThis() {
  if(program.post) {
    var myfile = program.post;
    if (myfile === true){
      console.log("SSG couldn't find  the name of the post you want to create. Please include it.")
      console.log("For example: ssg-post post_name.")
    }
    else{
      fs.mkdir(`./posts/${myfile}`, function(){
        fs.writeFileSync(`./posts/${myfile}/index.html`, '---\nlayout: post\n---')
      })
  }
  }
  else if (program.draft){
    var myfile = program.draft;
    if (myfile === true){
      console.log("SSG couldn't find  the name of the draft you want to create. Please include it.")
      console.log("For example: ssg-draft draft_name.")
    }
    else{
      fs.mkdir(`./drafts/${myfile}`, function(){
      fs.writeFileSync(`./drafts/${myfile}/index.html`, '---\nlayout: draft\n---')
    })
    }
  }
  else if (program.postdraft){
    var myfile = program.postdraft;
    if (myfile === true){
      console.log("SSG couldn't find  the name of the draft you want to post. Please include it.")
      console.log("For example: ssg-post-draft draft_name.")
    }
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
    // clear destination folder
    fse.emptyDirSync(distPath)

    // copy assets folder
    fse.copy(`${srcPath}\\assets`, `${distPath}\\assets`)

    // read pages
    globP('**/*.@(md|ejs|html)', { cwd: `${srcPath}\\pages` })
      .then((files) => {
        files.forEach((file) => {
          const fileData = path.parse(file)
          const destPath = path.join(distPath, fileData.dir)

          // create destination directory
          fse.mkdirs(destPath)
            .then(() => {
              // read page file
              return fse.readFile(`${srcPath}\\pages\\${file}`, 'utf-8')
            })
            .then((data) => {
              // render page
              const pageData = frontMatter(data)
              const templateConfig = Object.assign({}, config, { page: pageData.attributes })
              let pageContent

              // generate page content according to file type
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

              // render layout with page contents
              const layout = pageData.attributes.layout || 'default'
              var posts = []
              if (layout === 'blog'){
              // read pages
              return globP('**/*.@(md|ejs|html)', { cwd: `${srcPath}/posts` }).then((filess)=>{
              //console.log(files)
              //var itemsProcessed = 0;
                filess.forEach((file)=>{
                  const blogData = path.parse(file)

                  var readFile = fse.readFileSync(`${srcPath}/posts/${file}`, 'utf-8');
                      const postData = frontMatter(readFile)
                      const postLayout = postData.attributes.layout || 'default'
      
        
                          if (postLayout === 'post'){
                            
                            const postConfig = Object.assign({}, config, { page: postData.attributes })
                            let postContent
    
        
                            // generate page content according to file type
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
        
                          
                          // render layout with page contents
                          
                          ejsRenderFile(`${srcPath}/layouts/${postLayout}.ejs`, Object.assign({}, postConfig, { body: postContent})).then((str)=>{
                            posts.push(Object.assign({}, Object.assign({}, {page: postData.attributes }),{body: str}))
                          })

                            
                        
                          
              
                        // itemsProcessed++;

                            
                          
                        }
                

                    })


                      return posts
                    
                  }).then((posts)=>{
          
                    return ejsRenderFile(`${srcPath}/layouts/${layout}.ejs`, Object.assign({}, templateConfig, { body: pageContent, posts: posts}))
                
                  })

                      
                    
                  }
                  else{
                    return ejsRenderFile(`${srcPath}/layouts/${layout}.ejs`, Object.assign({}, templateConfig, { body: pageContent }))
                  }

            })
            .then((str) => {
              // save the html file
    
              fse.writeFile(`${destPath}/${fileData.name}.html`, str)
            })
            .catch((err) => { console.error(err) })
        })
      })
      .catch((err) => { console.error(err) })
  }

}

exports.convert = convertThis;