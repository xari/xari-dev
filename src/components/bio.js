/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/xari.jpeg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
        }
      }
    }
  `)

  const { author } = data.site.siteMetadata
  return (
    <div className="group leading-6 flex items-center space-x-3 sm:space-x-4 pb-5">
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author.name}
        className="rounded-full"
      />
      <p>
        <strong>{author.name}</strong>
        <br />
        <small>{author.summary}</small>
      </p>
    </div>
  )
}

export default Bio
