
const fse = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const { promisify } = require('util')
const marked = require('marked')
const frontMatter = require('front-matter')
const globP = promisify(require('glob'))
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
          return globP('**/*.@(md|ejs|html)', { cwd: `${srcPath}/posts` }).then((filess)=>{
          //console.log(files)
          var itemsProcessed = 0;
            filess.forEach((file)=>{
              const fileData = path.parse(file)

              file = fse.readFileSync(`${srcPath}/posts/${file}`, 'utf-8');
                  const postData = frontMatter(file)
                  const postLayout = postData.attributes.layout || 'default'
  
    
                      if (postLayout === 'post'){

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
                      
                      posts.push(Object.assign({}, { data: templateConfig, body: postContent}))
                      itemsProcessed++;

                        
                      
                    }
            

                })
                if(itemsProcessed === filess.length) {

                  return posts
                }  
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