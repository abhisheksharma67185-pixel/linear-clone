"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  InlineGrid,
  Box,
  TextField,
  Icon,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useState } from "react";

function LiveStatCard({
  title,
  value,
  showBar,
}: {
  title: string;
  value: string;
  showBar?: boolean;
}) {
  return (
    <Box padding="400" borderInlineEndWidth="025" borderColor="border">
      <BlockStack gap="200">
        <Text as="h3" variant="bodySm" tone="subdued">
          {title}
        </Text>
        <InlineStack gap="100" blockAlign="center">
          <Text as="p" variant="headingMd">
            {value}
          </Text>
          {showBar && (
            <Text as="span" variant="bodySm" tone="subdued">
              —
            </Text>
          )}
        </InlineStack>
        {showBar && (
          <Box
            background="bg-surface-secondary"
            borderRadius="100"
            minHeight="4px"
            maxWidth="60px"
          />
        )}
      </BlockStack>
    </Box>
  );
}

function LocationCard({
  title,
  locations,
}: {
  title: string;
  locations: { name: string; count: number }[];
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          {title}
        </Text>
        <BlockStack gap="200">
          {locations.map((loc) => (
            <InlineStack key={loc.name} align="space-between" blockAlign="center">
              <Text as="span" variant="bodyMd">
                {loc.name}
              </Text>
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {loc.count}
              </Text>
            </InlineStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

function CustomerBreakdownCard() {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          New vs returning customers
        </Text>
        <InlineStack gap="400">
          <BlockStack gap="100">
            <Text as="span" variant="bodySm" tone="subdued">
              New
            </Text>
            <Text as="span" variant="headingMd">
              158
            </Text>
          </BlockStack>
          <BlockStack gap="100">
            <Text as="span" variant="bodySm" tone="subdued">
              Returning
            </Text>
            <Text as="span" variant="headingMd">
              76
            </Text>
          </BlockStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function TopProductsCard() {
  const products = [
    { name: "Classic T-Shirt", sales: "$1,240" },
    { name: "Canvas Tote Bag", sales: "$890" },
    { name: "Ceramic Mug Set", sales: "$672" },
  ];
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          Total sales by product
        </Text>
        <BlockStack gap="200">
          {products.map((p) => (
            <InlineStack key={p.name} align="space-between" blockAlign="center">
              <Text as="span" variant="bodyMd">
                {p.name}
              </Text>
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {p.sales}
              </Text>
            </InlineStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

export default function LiveViewPage() {
  const [searchLocation, setSearchLocation] = useState("");

  const topLocations = [
    { name: "Mumbai, India", count: 3 },
    { name: "New York, US", count: 2 },
    { name: "London, UK", count: 1 },
    { name: "Toronto, CA", count: 1 },
  ];

  return (
    <Page title="Live View" subtitle="Just now" fullWidth>
      <InlineGrid columns="420px 1fr" gap="400">
        {/* Left column */}
        <BlockStack gap="400">
          {/* Top 2x2 stat grid */}
          <Card padding="0">
            <InlineGrid columns={2}>
              <LiveStatCard title="Visitors right now" value="7" />
              <LiveStatCard title="Total sales" value="$2,418" showBar />
              <Box borderBlockStartWidth="025" borderColor="border">
                <LiveStatCard title="Sessions" value="234" showBar />
              </Box>
              <Box borderBlockStartWidth="025" borderColor="border">
                <LiveStatCard title="Orders" value="9" showBar />
              </Box>
            </InlineGrid>
          </Card>

          {/* Customer behavior */}
          <Card padding="0">
            <Box padding="400" paddingBlockEnd="200">
              <Text as="h3" variant="headingSm">
                Customer behavior
              </Text>
            </Box>
            <InlineGrid columns={3}>
              <Box padding="400" borderInlineEndWidth="025" borderColor="border">
                <BlockStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Active carts
                  </Text>
                  <Text as="span" variant="headingMd">
                    3
                  </Text>
                </BlockStack>
              </Box>
              <Box padding="400" borderInlineEndWidth="025" borderColor="border">
                <BlockStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Checking out
                  </Text>
                  <Text as="span" variant="headingMd">
                    1
                  </Text>
                </BlockStack>
              </Box>
              <Box padding="400">
                <BlockStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Purchased
                  </Text>
                  <Text as="span" variant="headingMd">
                    9
                  </Text>
                </BlockStack>
              </Box>
            </InlineGrid>
          </Card>

          <LocationCard title="Sessions by location" locations={topLocations} />
          <CustomerBreakdownCard />
          <TopProductsCard />
        </BlockStack>

        {/* Right column */}
        <BlockStack gap="0">
          <Box padding="300" paddingBlockEnd="0">
            <InlineStack align="end">
              <Box maxWidth="200px">
                <TextField
                  label="Search location"
                  labelHidden
                  placeholder="Search location"
                  value={searchLocation}
                  onChange={setSearchLocation}
                  prefix={<Icon source={SearchIcon} />}
                  autoComplete="off"
                />
              </Box>
            </InlineStack>
          </Box>
          <Box background="bg-surface-secondary" borderRadius="300" minHeight="600px" padding="800">
            <BlockStack align="center">
              <Box paddingBlockStart="1600">
                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                  Globe visualization — 7 active visitors across 4 locations
                </Text>
              </Box>
            </BlockStack>
          </Box>
          <Box paddingBlock="200">
            <InlineStack align="end" gap="400">
              <InlineStack gap="100" blockAlign="center">
                <Box
                  background="bg-fill-success"
                  borderRadius="full"
                  minWidth="8px"
                  minHeight="8px"
                />
                <Text as="span" variant="bodySm" tone="subdued">
                  Orders
                </Text>
              </InlineStack>
              <InlineStack gap="100" blockAlign="center">
                <Box background="bg-fill-info" borderRadius="full" minWidth="8px" minHeight="8px" />
                <Text as="span" variant="bodySm" tone="subdued">
                  Visitors right now
                </Text>
              </InlineStack>
            </InlineStack>
          </Box>
        </BlockStack>
      </InlineGrid>
    </Page>
  );
}
