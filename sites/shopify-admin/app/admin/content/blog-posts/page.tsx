"use client";

import {
  Page,
  Card,
  EmptyState,
  Text,
  Button,
  InlineStack,
  Box,
} from "@shopify/polaris";

export default function BlogPostsPage() {
  return (
    <Page
      title="Blog posts"
      secondaryActions={[{ content: "Manage blogs" }]}
    >
      <Card>
        <EmptyState
          heading="Write a blog post"
          image=""
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Blog posts are a great way to build a community around your products
            and your brand.
          </Text>
          <Box paddingBlockStart="300">
            <InlineStack gap="200" align="center">
              <Button>Learn more</Button>
              <Button variant="primary">Create blog post</Button>
            </InlineStack>
          </Box>
        </EmptyState>
      </Card>
    </Page>
  );
}
