import {remark} from 'remark'
import html from 'remark-html'

const { promises: fs } = import('fs')
const path = import('path')
const RSS = import('rss')
const matter = import('gray-matter')
async function generate() {
  const feed = new RSS({
    title: 'Your Name',
    site_url: 'https://yoursite.com',
    feed_url: 'https://yoursite.com/feed.xml'
  })
  const posts = await fs.readdir(path.join(__dirname, '..', 'pages', 'posts'))
  await Promise.all(
    posts.map(async (name) => {
      if (name.startsWith('index.')) return
      const content = await fs.readFile(
        path.join(__dirname, '..', 'pages', 'posts', name)
      )
      const frontmatter = matter(content)
      
      const processedContent = await remark()
        .use(html)
        .process(frontmatter.content);
      const contentHtml = processedContent.toString();
      
      feed.item({
        title: frontmatter.data.title,
        url: '/posts/' + name.replace(/\.mdx?/, ''),
        date: frontmatter.data.date,
        description: contentHtml,
        categories: frontmatter.data.tag.split(', '),
        author: frontmatter.data.author
      })
    })
  )
  await fs.writeFile('./public/feed.xml', feed.xml({ indent: true }))
}
generate()
