import Link from 'next/link';
import { gql } from '@apollo/client';

import { getSiteMetadata } from '@/lib/site';

import Section from '@/components/Section';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Content from '@/components/Content';
import FeaturedImage from '@/components/FeaturedImage';
import Breadcrumbs from '@/components/Breadcrumbs';
import JSONLD from '@/components/JSONLD';

// import { WebpageJsonLd } from '@/lib/json-ld';
// import { helmetSettingsFromMetadata } from '@/lib/site';
// import usePageMetadata from 'hooks/use-page-metadata';

import styles from '@/styles/pages/Page.module.scss';

export default async function Page({ data, breadcrumbs }) {
  const { children, content, description, featuredImage, metaTitle, title, uri } = data;

  const metadata = await getSiteMetadata();

  const hasChildren = Array.isArray(children) && children.length > 0;
  console.log('data', data)

  // const { metadata } = usePageMetadata({
  //   metadata: {
  //     ...page,
  //     title: metaTitle,
  //     description: description || page.og?.description || `Read more about ${title}`,
  //   },
  // });

  // console.log('metadata', metadata)

  // if (process.env.WORDPRESS_PLUGIN_SEO !== true) {
  //   metadata.title = `${title} - ${siteMetadata.title}`;
  //   metadata.og.title = metadata.title;
  //   metadata.twitter.title = metadata.title;
  // }

  
  return (
    <>
      <Header>
        {Array.isArray(breadcrumbs) && <Breadcrumbs breadcrumbs={breadcrumbs} />}
        {featuredImage && (
          <FeaturedImage data={featuredImage} />
        )}
        <h1 className={styles.title}>{title}</h1>
      </Header>

      <Content>
        <Section>
          <Container>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />
          </Container>
        </Section>

        {hasChildren && (
          <Section className={styles.sectionChildren}>
            <Container>
              <aside>
                <p className={styles.childrenHeader}>
                  <strong>{title}</strong>
                </p>
                <ul>
                  {children.map((child) => {
                    return (
                      <li key={child.id}>
                        <Link href={child.uri}>
                          {child.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </Container>
          </Section>
        )}
      </Content>

      <JSONLD
        data={{
          '@type': 'WebPage',
          name: title,
          description,
          url: `${metadata.url}${uri}`,
        }}
        metadata={metadata}
      />
    </>
  );
}

Page.template = {
  query: gql`
    query PageByUri($uri: ID!) {
      page(id: $uri, idType: URI) {
        children {
          edges {
            node {
              id
              uri
              ... on Page {
                id
                title
              }
            }
          }
        }
        content
        featuredImage {
          node {
            altText
            caption
            id
            mediaDetails {
              height
              width
            }
            sizes
            sourceUrl
            srcSet
          }
        }
        id
        menuOrder
        parent {
          node {
            id
            uri
            ... on Page {
              title
            }
          }
        }
        title
        uri
      }
    }
  `,
  transformer: (data) => {
    const page = { ...data.page };

    if (page.featuredImage) {
      page.featuredImage = page.featuredImage.node;
    }

    if (page.parent) {
      page.parent = page.parent.node;
    }

    if (page.children) {
      page.children = page.children.edges.map(({ node }) => node);
    }

    return page;
  },
  variables: ({ uri }) => {
    return {
      uri,
    };
  },
};