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
    { label: "Sessions", value: "100%", sub: "1,204x" },
    { label: "Added to cart", value: "12.1%", sub: "146x" },
    { label: "Reached checkout", value: "5.8%", sub: "70x" },
    { label: "Completed", value: "3.5%", sub: "42x" },
  ];
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          Conversion rate breakdown
        </Text>
        <InlineStack gap="100" blockAlign="center">
          <Text as="p" variant="headingLg">
            3.5%
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            —
          </Text>
        </InlineStack>
        <InlineStack gap="400" wrap={false}>
          {cols.map((col) => (
            <Box key={col.label} width="25%">
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
            </Box>
          ))}
        </InlineStack>
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
        <InlineStack gap="200" wrap={false}>
          <Box>
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
          </Box>
          <Box width="100%">
            <BlockStack gap="100">
              <Text as="span" variant="bodySm" fontWeight="semibold">
                Months
              </Text>
              {months.map((m, i) => {
                const cohortData = [
                  [8.2, 5.1, 3.8, 2.9, 2.1, 1.5, 1.2, 0.8],
                  [7.5, 4.8, 3.2, 2.5, 1.9, 1.1, 0.9],
                  [9.1, 5.6, 4.0, 3.1, 2.3, 1.7],
                  [6.8, 4.2, 2.9, 2.0, 1.4],
                  [8.4, 5.3, 3.5, 2.6],
                  [7.9, 4.9, 3.3],
                  [10.2, 6.1],
                  [8.7],
                ];
                return (
                  <InlineStack key={m} gap="300">
                    {cohortData[i].map((val, j) => (
                      <Text key={j} as="span" variant="bodySm" tone="success">
                        {val}%
                      </Text>
                    ))}
                  </InlineStack>
                );
              })}
            </BlockStack>
          </Box>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

export default function AnalyticsPage() {
  const salesBreakdown = [
    { label: "Gross sales", value: "$14,102.80" },
    { label: "Discounts", value: "-$423.08" },
    { label: "Returns", value: "-$189.50" },
    { label: "Net sales", value: "$13,490.22" },
    { label: "Shipping charges", value: "$312.40" },
    { label: "Return fees", value: "$0.00" },
    { label: "Taxes", value: "$955.30" },
    { label: "Total sales", value: "$12,847.32" },
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
          <StatCard title="Gross sales" value="$14,102.80" />
          <StatCard title="Returning customer rate" value="32.4%" />
          <StatCard title="Orders fulfilled" value="38" />
          <StatCard title="Orders" value="42" />
        </InlineGrid>

        {/* Total sales over time + breakdown */}
        <InlineGrid columns={{ xs: 1, lg: "2fr 1fr" }} gap="400">
          <ChartCard title="Total sales over time" value="$12,847.32" showChart />
          <BreakdownCard title="Total sales breakdown" items={salesBreakdown} />
        </InlineGrid>

        {/* Three chart row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard title="Total sales by sales channel" />
          <ChartCard title="Average order value over time" value="$305.89" showChart />
          <ChartCard title="Total sales by product" />
        </InlineGrid>

        {/* Sessions + conversion row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard title="Sessions over time" value="1,204" showChart />
          <ChartCard title="Conversion rate over time" value="3.5%" showChart />
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
