module.exports = {
  pathPrefix: "/xari-dev",
  siteMetadata: {
    title: `Ideas in Development`,
    author: {
      name: `Mostly programming`,
      summary: `(._.)`,
    },
    description: `Ideas in development.`,
    siteUrl: `https://xari-dev/`,
  },
  plugins: [
    `gatsby-plugin-postcss`,
    {
      resolve: "gatsby-plugin-exclude",
      options: { paths: ["/content/blog/**/node_modules"] },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 672,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    { resolve: `gatsby-plugin-feed`, options: { feeds: [] } },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Harry Anderson`,
        short_name: `Xari-Dev`,
        start_url: `/`,
        background_color: `#F0EAD6`,
        theme_color: `#98c6c3`,
        display: `minimal-ui`,
        icon: `content/assets/icon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
