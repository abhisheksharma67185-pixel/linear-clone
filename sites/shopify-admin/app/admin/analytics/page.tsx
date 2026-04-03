"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  InlineGrid,
  Box,
  Button,
  Link,
} from "@shopify/polaris";

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h3" variant="bodySm" tone="subdued">
          {title}
        </Text>
        <InlineStack gap="100" blockAlign="center">
          <Text as="p" variant="headingMd">
            {value}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            —
          </Text>
        </InlineStack>
        <Box background="bg-surface-secondary" borderRadius="100" minHeight="4px" maxWidth="60px" />
      </BlockStack>
    </Card>
  );
}

function ChartCard({
  title,
  value,
  showChart,
}: {
  title: string;
  value?: string;
  showChart?: boolean;
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          {title}
        </Text>
        {value && (
          <InlineStack gap="100" blockAlign="center">
            <Text as="p" variant="headingLg">
              {value}
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              —
            </Text>
          </InlineStack>
        )}
        {showChart ? (
          <Box
            background="bg-surface-secondary"
            borderRadius="200"
            minHeight="180px"
            padding="400"
          />
        ) : (
          <Box minHeight="120px" padding="800">
            <Text as="p" variant="bodySm" tone="subdued" alignment="center">
              No data for this date range
            </Text>
          </Box>
        )}
      </BlockStack>
    </Card>
  );
}

function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string }[];
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          {title}
        </Text>
        <BlockStack gap="200">
          {items.map((item) => (
            <InlineStack key={item.label} align="space-between" blockAlign="center">
              <Link>{item.label}</Link>
              <InlineStack gap="200" blockAlign="center">
                <Text as="span" variant="bodyMd">
                  {item.value}
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  —
                </Text>
              </InlineStack>
            </InlineStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

function ConversionBreakdownCard() {
  const cols = [
    { label: "Sessions", value: "0%", sub: "0x 0%" },
    { label: "Added to cart", value: "0%", sub: "0x 0%" },
    { label: "Reached checko...", value: "0%", sub: "0x 0%" },
    { label: "Completed...", value: "0%", sub: "0x 0%" },
  ];
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          Conversion rate breakdown
        </Text>
        <InlineStack gap="100" blockAlign="center">
          <Text as="p" variant="headingLg">
            0%
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            —
          </Text>
        </InlineStack>
        <div style={{ display: "flex", gap: 16 }}>
          {cols.map((col) => (
            <div key={col.label} style={{ flex: 1 }}>
              <BlockStack gap="100">
                <Text as="span" variant="bodySm" tone="subdued">
                  {col.label}
                </Text>
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                  {col.value}
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  {col.sub}
                </Text>
              </BlockStack>
            </div>
          ))}
        </div>
      </BlockStack>
    </Card>
  );
}

function CohortCard() {
  const months = [
    "Aug 2025",
    "Sep 2025",
    "Oct 2025",
    "Nov 2025",
    "Dec 2025",
    "Jan 2026",
    "Feb 2026",
    "Mar 2026",
  ];
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          Customer cohort analysis
        </Text>
        <div style={{ display: "flex", gap: 8 }}>
          <div>
            <BlockStack gap="100">
              <Text as="span" variant="bodySm" fontWeight="semibold">
                Cohort
              </Text>
              {months.map((m) => (
                <Text key={m} as="span" variant="bodySm">
                  {m}
                </Text>
              ))}
            </BlockStack>
          </div>
          <div style={{ flex: 1 }}>
            <BlockStack gap="100">
              <Text as="span" variant="bodySm" fontWeight="semibold">
                Months
              </Text>
              {months.map((m, i) => (
                <InlineStack key={m} gap="300">
                  {Array.from({ length: 8 - i }, (_, j) => (
                    <Text key={j} as="span" variant="bodySm" tone="success">
                      0%
                    </Text>
                  ))}
                </InlineStack>
              ))}
            </BlockStack>
          </div>
        </div>
      </BlockStack>
    </Card>
  );
}

export default function AnalyticsPage() {
  const salesBreakdown = [
    { label: "Gross sales", value: "$0.00" },
    { label: "Discounts", value: "$0.00" },
    { label: "Returns", value: "$0.00" },
    { label: "Net sales", value: "$0.00" },
    { label: "Shipping charges", value: "$0.00" },
    { label: "Return fees", value: "$0.00" },
    { label: "Taxes", value: "$0.00" },
    { label: "Total sales", value: "$0.00" },
  ];

  return (
    <Page
      title="Analytics"
      subtitle="Last refreshed: 5:41 PM"
      primaryAction={{ content: "New exploration" }}
      fullWidth
    >
      <BlockStack gap="400">
        {/* Date filters */}
        <InlineStack gap="200">
          <Button size="slim">Today</Button>
          <Button size="slim">Apr 1, 2026</Button>
          <Button size="slim">INR</Button>
        </InlineStack>

        {/* Top stats row */}
        <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
          <StatCard title="Gross sales" value="$0.00" />
          <StatCard title="Returning customer rate" value="0%" />
          <StatCard title="Orders fulfilled" value="0" />
          <StatCard title="Orders" value="0" />
        </InlineGrid>

        {/* Total sales over time + breakdown */}
        <InlineGrid columns={{ xs: 1, lg: "2fr 1fr" }} gap="400">
          <ChartCard title="Total sales over time" value="$0.00" showChart />
          <BreakdownCard title="Total sales breakdown" items={salesBreakdown} />
        </InlineGrid>

        {/* Three chart row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard title="Total sales by sales channel" />
          <ChartCard title="Average order value over time" value="$0.00" showChart />
          <ChartCard title="Total sales by product" />
        </InlineGrid>

        {/* Sessions + conversion row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard title="Sessions over time" value="0" showChart />
          <ChartCard title="Conversion rate over time" value="0%" showChart />
          <ConversionBreakdownCard />
        </InlineGrid>

        {/* Device / location / social */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard title="Sessions by device type" />
          <ChartCard title="Sessions by location" />
          <ChartCard title="Total sales by social referrer" />
        </InlineGrid>

        {/* Cohort + landing page */}
        <InlineGrid columns={{ xs: 1, lg: "2fr 1fr" }} gap="400">
          <CohortCard />
          <ChartCard title="Sessions by landing page" />
        </InlineGrid>

        {/* Referrer row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard title="Sessions by social referrer" />
          <ChartCard title="Total sales by referrer" />
          <ChartCard title="Performance by referring channel" />
        </InlineGrid>

        {/* Bottom row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard title="Sessions by referrer" />
          <ChartCard title="Total sales by POS location" />
          <ChartCard title="Products by sell-through rate" />
        </InlineGrid>

        {/* POS staff */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard title="POS staff sales total" />
        </InlineGrid>

        {/* Footer */}
        <Box paddingBlock="400">
          <Text as="p" variant="bodySm" alignment="center">
            Learn more about <Link>analytics</Link>
          </Text>
        </Box>
      </BlockStack>
    </Page>
  );
}
