/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(relativePath: { regex: "/xari.jpeg/" }) {
        childImageSharp {
          gatsbyImageData(layout: FIXED, width: 50, height: 50)
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
      <GatsbyImage
        image={data.avatar.childImageSharp.gatsbyImageData}
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
