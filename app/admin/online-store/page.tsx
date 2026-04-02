"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  Box,
} from "@shopify/polaris";

export default function OnlineStorePage() {
  return (
    <Page title="Online Store">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingSm">
                    Current theme
                  </Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="p" variant="headingMd">
                      Dawn
                    </Text>
                    <Badge tone="success">Live</Badge>
                  </InlineStack>
                </BlockStack>
                <Button variant="primary">Customize</Button>
              </InlineStack>
              <Box
                background="bg-surface-secondary"
                borderRadius="200"
                minHeight="200px"
                padding="800"
              />
              <Text as="p" variant="bodySm" tone="subdued">
                Last saved: March 28, 2026
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Pages
              </Text>
              <BlockStack gap="200">
                {["Home page", "Contact", "FAQ", "About Us"].map((page) => (
                  <InlineStack
                    key={page}
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text as="span" variant="bodyMd">
                      {page}
                    </Text>
                    <Button variant="plain">Edit</Button>
                  </InlineStack>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Theme library
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Add and publish themes to change your online store&apos;s appearance.
              </Text>
              <Button>Add theme</Button>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Preferences
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Title and meta description, social sharing image, Google
                Analytics
              </Text>
              <Button variant="plain">Manage</Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
