"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Button,
  Badge,
  Banner,
  TextField,
  InlineGrid,
  Link,
  Popover,
  ActionList,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

function ThemeCard({ name, author }: { name: string; author: string }) {
  return (
    <Card padding="0">
      <Box background="bg-surface-secondary" minHeight="180px" borderRadius="200" />
      <Box padding="300">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="100">
            <Link>{name}</Link>
            <Text as="span" variant="bodySm" tone="subdued">
              by {author}
            </Text>
          </BlockStack>
          <Button size="slim">Add</Button>
        </InlineStack>
      </Box>
    </Card>
  );
}

export default function ThemesPage() {
  const [menuActive, setMenuActive] = useState(false);
  const [generateValue, setGenerateValue] = useState("");

  const toggleMenu = useCallback(() => setMenuActive((a) => !a), []);

  return (
    <Page title="Online Store">
      <BlockStack gap="600">
        {/* Themes section header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingLg">
            Themes
          </Text>
          <InlineStack gap="200">
            <Button>View your store</Button>
            <Button disclosure>Import theme</Button>
          </InlineStack>
        </InlineStack>

        {/* Theme preview placeholder */}
        <Card padding="0">
          <Box background="bg-surface-secondary" minHeight="280px" borderRadius="200" />
        </Card>

        {/* Password protected banner */}
        <Banner tone="warning">
          Password protected: to remove the password, pick a plan{" "}
          <InlineStack gap="200">
            <Button variant="plain">Edit password</Button>
            <Button variant="plain">Pick a plan</Button>
          </InlineStack>
        </Banner>

        {/* Current theme card */}
        <Card>
          <InlineStack align="space-between" blockAlign="start">
            <InlineStack gap="400" blockAlign="start">
              <Box
                background="bg-surface-secondary"
                minWidth="80px"
                minHeight="80px"
                borderRadius="200"
              />
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Text as="h3" variant="headingMd">
                    Horizon
                  </Text>
                  <Badge tone="info">Current theme</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  Added: Yesterday at 8:01 pm
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Version 3.5.1
                </Text>
              </BlockStack>
            </InlineStack>
            <InlineStack gap="200">
              <Popover
                active={menuActive}
                activator={
                  <Button onClick={toggleMenu} disclosure="select">
                    ...
                  </Button>
                }
                onClose={toggleMenu}
              >
                <ActionList
                  items={[
                    { content: "Preview" },
                    { content: "Rename" },
                    { content: "Duplicate" },
                    { content: "Edit code" },
                    { content: "Edit default theme content" },
                    { content: "Download theme file" },
                  ]}
                />
              </Popover>
              <Button variant="primary">Edit theme</Button>
            </InlineStack>
          </InlineStack>
        </Card>

        {/* Design your store in seconds */}
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingSm" fontWeight="semibold">
              Design your store in seconds
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Describe your business to create unique themes with personalized content
            </Text>
            <TextField
              label="Describe your business"
              labelHidden
              placeholder="e.g. modern handmade jewelry"
              value={generateValue}
              onChange={setGenerateValue}
              autoComplete="off"
              connectedRight={<Button disabled>Generate themes</Button>}
            />
          </BlockStack>
        </Card>

        {/* Popular free themes */}
        <Card>
          <BlockStack gap="400">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h2" variant="headingSm" fontWeight="semibold">
                Popular free themes
              </Text>
            </InlineStack>
            <Text as="p" variant="bodyMd" tone="subdued">
              Made with core features you can easily customize — no coding needed.
            </Text>
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              <ThemeCard name="Horizon" author="Shopify" />
              <ThemeCard name="Tinker" author="Shopify" />
              <ThemeCard name="Savor" author="Shopify" />
            </InlineGrid>
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              <ThemeCard name="Atelier" author="Shopify" />
              <ThemeCard name="Ritual" author="Shopify" />
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm" fontWeight="semibold">
                    Explore more themes
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Browse professionally designed free and paid themes
                  </Text>
                  <div>
                    <Button>Visit Theme Store</Button>
                  </div>
                </BlockStack>
              </Card>
            </InlineGrid>
          </BlockStack>
        </Card>

        {/* Footer */}
        <Box paddingBlock="200">
          <Text as="p" variant="bodySm" alignment="center">
            Learn more about <Link>themes</Link>
          </Text>
        </Box>
      </BlockStack>
    </Page>
  );
}
