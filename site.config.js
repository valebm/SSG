const projects = require('./data/projects')

module.exports = {
  site: {
    title: 'SSG',
    description: 'Static Site Generator in Node.js',
    basePath: process.env.NODE_ENV === 'production' ? '/ssg' : '',
    projects
  },
  build: {
    outputPath: process.env.NODE_ENV === 'production' ? './docs' : './public'
  }
}