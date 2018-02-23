
const fse = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const { promisify } = require('util')
const marked = require('marked')
const frontMatter = require('front-matter')
const globP = promisify(require('glob'))
const glob = require('glob')
const config = require('../site.config')

const ejsRenderFile = promisify(ejs.renderFile)
const srcPath = './src'
const distPath = config.build.outputPath

// clear destination folder
fse.emptyDirSync(distPath)

// copy assets folder
fse.copy(`${srcPath}/assets`, `${distPath}/assets`)

// read pages
globP('**/*.@(md|ejs|html)', { cwd: `${srcPath}/pages` })
  .then((files) => {
    files.forEach((file) => {
      const fileData = path.parse(file)
      const destPath = path.join(distPath, fileData.dir)

      // create destination directory
      fse.mkdirs(destPath)
        .then(() => {
          // read page file
          return fse.readFile(`${srcPath}/pages/${file}`, 'utf-8')
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
          const files = glob('**/*.@(md|ejs|html)', { cwd: `${srcPath}/posts` }, function(err, files){
          //console.log(files)
            files.forEach((file) => {
              const fileData = path.parse(file)

              // create destination directory
              var readF
              fse.readFile(`${srcPath}/posts/${file}`, 'utf-8', function(err,file){
                
                  const postData = frontMatter(file)
                  const postLayout = postData.attributes.layout || 'default'
    
                      if (postLayout === 'post'){
                        console.log("si reconoce")
                        const templateConfig = Object.assign({}, config, { page: postData.attributes })
                        let postContent
    
                        // generate page content according to file type
                        switch (fileData.ext) {
                          case '.md':
                            postContent = marked(postData.body)
                            break
                          case '.ejs':
                            postContent = ejs.render(postData.body, templateConfig)
                            break
                          default:
                            postContent = postData.body
                        }
    
                      
                      // render layout with page contents
                      posts.push(ejsRenderFile(`${srcPath}/layouts/${postLayout}.ejs`, Object.assign({}, templateConfig, { body: postContent})))
                      }
              })
              
                })
              })
              }
          console.log(posts[0])
          return ejsRenderFile(`${srcPath}/layouts/${layout}.ejs`, Object.assign({}, templateConfig, { body: pageContent, posts: posts}))
        })
        .then((str) => {
          // save the html file
          fse.writeFile(`${destPath}/${fileData.name}.html`, str)
        })
        .catch((err) => { console.error(err) })
    })
  })
  .catch((err) => { console.error(err) })