"use client";

import { Page, Card, IndexTable, Text, Badge, useIndexResourceState } from "@shopify/polaris";

const blogPosts = [
  {
    id: "1",
    title: "Welcome to Our Store",
    author: "Store Owner",
    date: "Mar 10, 2026",
    status: "Published",
    visibility: "Visible",
  },
  {
    id: "2",
    title: "Spring Collection Preview",
    author: "Store Owner",
    date: "Apr 2, 2026",
    status: "Draft",
    visibility: "Hidden",
  },
];

export default function BlogPostsPage() {
  const resourceName = { singular: "blog post", plural: "blog posts" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(blogPosts);

  const rowMarkup = blogPosts.map((post, index) => (
    <IndexTable.Row
      id={post.id}
      key={post.id}
      selected={selectedResources.includes(post.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {post.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span">{post.author}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {post.date}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={post.status === "Published" ? "success" : undefined}>{post.status}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {post.visibility}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Blog posts" secondaryActions={[{ content: "Manage blogs" }]}>
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={blogPosts.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Title" },
            { title: "Author" },
            { title: "Date" },
            { title: "Status" },
            { title: "Visibility" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </Page>
  );
}
