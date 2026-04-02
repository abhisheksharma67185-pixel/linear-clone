"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Box,
  TextField,
  Icon,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useState } from "react";

function LiveStatCard({ title, value, showBar }: { title: string; value: string; showBar?: boolean }) {
  return (
    <Box padding="400" borderInlineEndWidth="025" borderColor="border">
      <BlockStack gap="200">
        <Text as="h3" variant="bodySm" tone="subdued">{title}</Text>
        <InlineStack gap="100" blockAlign="center">
          <Text as="p" variant="headingMd">{value}</Text>
          {showBar && <Text as="span" variant="bodySm" tone="subdued">—</Text>}
        </InlineStack>
        {showBar && (
          <Box background="bg-surface-secondary" borderRadius="100" minHeight="4px" maxWidth="60px" />
        )}
      </BlockStack>
    </Box>
  );
}

function NoDataCard({ title }: { title: string }) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">{title}</Text>
        <Box minHeight="100px" padding="400">
          <Text as="p" variant="bodySm" tone="subdued" alignment="center">
            No data for this date range
          </Text>
        </Box>
      </BlockStack>
    </Card>
  );
}

export default function LiveViewPage() {
  const [searchLocation, setSearchLocation] = useState("");

  return (
    <Page
      title="Live View"
      subtitle="Just now"
      fullWidth
    >
      <div style={{ display: "flex", gap: 16 }}>
        {/* Left column — stats */}
        <div style={{ width: 420, flexShrink: 0 }}>
          <BlockStack gap="400">
            {/* Top 2x2 stat grid */}
            <Card padding="0">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <LiveStatCard title="Visitors right now" value="0" />
                <LiveStatCard title="Total sales" value="$0" showBar />
                <Box borderBlockStartWidth="025" borderColor="border">
                  <LiveStatCard title="Sessions" value="0" showBar />
                </Box>
                <Box borderBlockStartWidth="025" borderColor="border">
                  <LiveStatCard title="Orders" value="0" showBar />
                </Box>
              </div>
            </Card>

            {/* Customer behavior */}
            <Card padding="0">
              <Box padding="400" paddingBlockEnd="200">
                <Text as="h3" variant="headingSm">Customer behavior</Text>
              </Box>
              <div style={{ display: "flex" }}>
                <Box padding="400" borderInlineEndWidth="025" borderColor="border" minWidth="33%">
                  <BlockStack gap="100">
                    <Text as="span" variant="bodySm" tone="subdued">Active carts</Text>
                    <Text as="span" variant="headingMd">0</Text>
                  </BlockStack>
                </Box>
                <Box padding="400" borderInlineEndWidth="025" borderColor="border" minWidth="33%">
                  <BlockStack gap="100">
                    <Text as="span" variant="bodySm" tone="subdued">Checking out</Text>
                    <Text as="span" variant="headingMd">0</Text>
                  </BlockStack>
                </Box>
                <Box padding="400" minWidth="33%">
                  <BlockStack gap="100">
                    <Text as="span" variant="bodySm" tone="subdued">Purchased</Text>
                    <Text as="span" variant="headingMd">0</Text>
                  </BlockStack>
                </Box>
              </div>
            </Card>

            <NoDataCard title="Sessions by location" />
            <NoDataCard title="New vs returning customers" />
            <NoDataCard title="Total sales by product" />
          </BlockStack>
        </div>

        {/* Right column — globe / map placeholder */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <Box padding="300" paddingBlockEnd="0">
            <InlineStack align="end">
              <div style={{ width: 200 }}>
                <TextField
                  label="Search location"
                  labelHidden
                  placeholder="Search location"
                  value={searchLocation}
                  onChange={setSearchLocation}
                  prefix={<Icon source={SearchIcon} />}
                  autoComplete="off"
                />
              </div>
            </InlineStack>
          </Box>
          <Box
            background="bg-surface-secondary"
            borderRadius="300"
            minHeight="600px"
            padding="800"
          >
            <BlockStack align="center">
              <Box paddingBlockStart="1600">
                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                  Globe visualization — real-time visitor map will appear when you
                  have active sessions
                </Text>
              </Box>
            </BlockStack>
          </Box>
          <Box paddingBlock="200">
            <InlineStack align="end" gap="400">
              <InlineStack gap="100" blockAlign="center">
                <Box background="bg-fill-success" borderRadius="full" minWidth="8px" minHeight="8px" />
                <Text as="span" variant="bodySm" tone="subdued">Orders</Text>
              </InlineStack>
              <InlineStack gap="100" blockAlign="center">
                <Box background="bg-fill-info" borderRadius="full" minWidth="8px" minHeight="8px" />
                <Text as="span" variant="bodySm" tone="subdued">Visitors right now</Text>
              </InlineStack>
            </InlineStack>
          </Box>
        </div>
      </div>
    </Page>
  );
}
