"use client";

import {
  Page,
  Card,
  BlockStack,
  Text,
  InlineStack,
  Button,
  TextField,
  Select,
  Divider,
  Box,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useState } from "react";

const METRIC_OPTIONS = [
  { label: "Total sales", value: "total-sales" },
  { label: "Gross sales", value: "gross-sales" },
  { label: "Net sales", value: "net-sales" },
  { label: "Orders", value: "orders" },
  { label: "Sessions", value: "sessions" },
  { label: "Conversion rate", value: "conversion-rate" },
  { label: "Average order value", value: "avg-order-value" },
  { label: "Returning customer rate", value: "returning-customer-rate" },
];

const DIMENSION_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Sales channel", value: "sales-channel" },
  { label: "Product", value: "product" },
  { label: "Location", value: "location" },
  { label: "Device", value: "device" },
];

export default function NewExplorationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("total-sales");
  const [dimension, setDimension] = useState("day");

  return (
    <Page
      title="New exploration"
      backAction={{ content: "Analytics", onAction: () => router.push("/admin/analytics") }}
      primaryAction={{
        content: "Save exploration",
        onAction: () => router.push("/admin/analytics"),
      }}
      secondaryActions={[{ content: "Cancel", onAction: () => router.push("/admin/analytics") }]}
    >
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Exploration settings
            </Text>
            <TextField
              label="Name"
              value={name}
              onChange={setName}
              placeholder="e.g. Sales by product this month"
              autoComplete="off"
            />
            <InlineStack gap="400" wrap={false}>
              <Box width="50%">
                <Select
                  label="Metric"
                  options={METRIC_OPTIONS}
                  value={metric}
                  onChange={setMetric}
                />
              </Box>
              <Box width="50%">
                <Select
                  label="Break down by"
                  options={DIMENSION_OPTIONS}
                  value={dimension}
                  onChange={setDimension}
                />
              </Box>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Preview
            </Text>
            <Divider />
            <Box minHeight="200px" padding="800">
              <BlockStack gap="200" align="center">
                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                  Configure your metric and dimension above to preview the exploration.
                </Text>
                <InlineStack align="center">
                  <Button variant="plain" onClick={() => {}}>
                    Run query
                  </Button>
                </InlineStack>
              </BlockStack>
            </Box>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
