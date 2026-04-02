"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Badge,
  TextField,
  Icon,
  Link,
  Button,
} from "@shopify/polaris";
import { SearchIcon, PlusIcon, XIcon, GlobeIcon } from "@shopify/polaris-icons";
import { useState } from "react";

export default function MarketsPage() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <Page
      title="Markets"
      primaryAction={{ content: "Create market" }}
      secondaryActions={[{ content: "Graph view" }]}
      fullWidth
    >
      <div style={{ display: "flex", gap: 16 }}>
        {/* Left sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <Card padding="300">
            <BlockStack gap="200">
              <InlineStack gap="200" blockAlign="center">
                <Icon source={GlobeIcon} tone="base" />
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                  Store default
                </Text>
              </InlineStack>
              <InlineStack gap="200" blockAlign="center">
                <Icon source={PlusIcon} tone="base" />
                <Text as="span" variant="bodyMd">
                  Regions
                </Text>
              </InlineStack>
            </BlockStack>
          </Card>
        </div>

        {/* Right content — full width */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <Card padding="0">
            <Box padding="300">
              <TextField
                label="Search markets"
                labelHidden
                placeholder="Search in all markets"
                value={searchValue}
                onChange={setSearchValue}
                prefix={<Icon source={SearchIcon} />}
                autoComplete="off"
              />
            </Box>

            {/* Table header */}
            <Box
              padding="300"
              paddingBlockStart="200"
              paddingBlockEnd="200"
              borderBlockEndWidth="025"
              borderColor="border"
            >
              <div style={{ display: "flex" }}>
                <div style={{ flex: 2 }}>
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Market
                  </Text>
                </div>
                <div style={{ flex: 1 }}>
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Status
                  </Text>
                </div>
                <div style={{ flex: 1 }}>
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Includes
                  </Text>
                </div>
                <div style={{ flex: 1 }}>
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Customizations
                  </Text>
                </div>
              </div>
            </Box>

            {/* India row */}
            <Box
              padding="300"
              borderBlockEndWidth="025"
              borderColor="border"
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ flex: 2 }}>
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={GlobeIcon} tone="base" />
                    <Text as="span" variant="bodyMd">
                      India
                    </Text>
                  </InlineStack>
                </div>
                <div style={{ flex: 1 }}>
                  <Badge tone="success">Active</Badge>
                </div>
                <div style={{ flex: 1 }}>
                  <Text as="span" variant="bodyMd">
                    India
                  </Text>
                </div>
                <div style={{ flex: 1 }} />
              </div>
            </Box>

            {/* Suggested markets */}
            <Box padding="300" borderBlockEndWidth="025" borderColor="border">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <Link>Create United States Market</Link>
                  <Icon source={PlusIcon} tone="interactive" />
                </InlineStack>
                <Button variant="plain" icon={XIcon} accessibilityLabel="Dismiss" />
              </InlineStack>
            </Box>

            <Box padding="300">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <Link>Create United Kingdom Market</Link>
                  <Icon source={PlusIcon} tone="interactive" />
                </InlineStack>
                <Button variant="plain" icon={XIcon} accessibilityLabel="Dismiss" />
              </InlineStack>
            </Box>
          </Card>

          <Box paddingBlock="400">
            <BlockStack align="center">
              <Text as="p" variant="bodySm" alignment="center">
                <Link monochrome>Learn more about markets</Link>
              </Text>
            </BlockStack>
          </Box>
        </div>
      </div>
    </Page>
  );
}
