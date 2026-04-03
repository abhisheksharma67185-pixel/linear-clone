"use client";

import {
  Page,
  Card,
  DataTable,
  TextField,
  Icon,
  Box,
  InlineStack,
  Button,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useState } from "react";

const reports = [
  ["Sessions by location", "Acquisition", "", "Shopify"],
  ["Sessions by referrer", "Acquisition", "", "Shopify"],
  ["Sessions by social referrer", "Acquisition", "", "Shopify"],
  ["Sessions over time", "Acquisition", "", "Shopify"],
  ["Visitors over time", "Acquisition", "", "Shopify"],
  ["Visitors right now", "Acquisition", "", "Shopify"],
  ["Bounce rate over time", "Behavior", "", "Shopify"],
  ["Checkout conversion rate over time", "Behavior", "", "Shopify"],
  ["Conversion rate breakdown", "Behavior", "", "Shopify"],
  ["Conversion rate over time", "Behavior", "", "Shopify"],
  ["Customer behavior", "Behavior", "", "Shopify"],
  ["Product recommendation conversions over time", "Behavior", "", "Shopify"],
  ["Product recommendations with low engagement", "Behavior", "", "Shopify"],
  ["Search conversions over time", "Behavior", "", "Shopify"],
  ["Searches by search query", "Behavior", "", "Shopify"],
  ["Searches with no clicks", "Behavior", "", "Shopify"],
  ["Searches with no results", "Behavior", "", "Shopify"],
  ["Sessions by device type", "Behavior", "", "Shopify"],
  ["Sessions by landing page", "Behavior", "", "Shopify"],
  ["Shop Campaign ROAS", "Behavior", "", "Shopify"],
  ["Customer cohort analysis", "Customers", "", "Shopify"],
  ["Customers by location", "Customers", "", "Shopify"],
  ["New customer sales over time", "Customers", "", "Shopify"],
  ["Returning customer sales over time", "Customers", "", "Shopify"],
  ["One-time customers", "Customers", "", "Shopify"],
  ["Returning customers", "Customers", "", "Shopify"],
  ["Customers over time", "Customers", "", "Shopify"],
  ["Average order value over time", "Finances", "", "Shopify"],
  ["Gross sales", "Finances", "", "Shopify"],
  ["Net sales", "Finances", "", "Shopify"],
  ["Orders over time", "Finances", "", "Shopify"],
  ["Sales by billing location", "Finances", "", "Shopify"],
  ["Sales by channel", "Finances", "", "Shopify"],
  ["Sales by checkout currency", "Finances", "", "Shopify"],
  ["Sales by discount", "Finances", "", "Shopify"],
  ["Sales by product", "Finances", "", "Shopify"],
  ["Sales by product variant", "Finances", "", "Shopify"],
  ["Sales by traffic referrer", "Finances", "", "Shopify"],
  ["Shipping", "Finances", "", "Shopify"],
  ["Taxes", "Finances", "", "Shopify"],
  ["Tips", "Finances", "", "Shopify"],
  ["Total sales by POS location", "Finances", "", "Shopify"],
  ["Total sales", "Finances", "", "Shopify"],
  ["Fulfillment over time", "Inventory", "", "Shopify"],
  ["Percent of inventory sold per day", "Inventory", "", "Shopify"],
  ["Products by sell-through rate", "Inventory", "", "Shopify"],
  ["Average inventory sold per day", "Inventory", "", "Shopify"],
  ["Total sales by POS staff", "POS", "", "Shopify"],
  ["POS staff sales total", "POS", "", "Shopify"],
  ["Gross profit by product", "Profit", "", "Shopify"],
];

export default function ReportsPage() {
  const [searchValue, setSearchValue] = useState("");

  const filtered = reports.filter((r) =>
    r[0].toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <Page
      title="Reports"
      primaryAction={{ content: "New exploration" }}
    >
      <Card padding="0">
        <Box padding="300">
          <TextField
            label="Search reports"
            labelHidden
            placeholder="Search reports"
            value={searchValue}
            onChange={setSearchValue}
            prefix={<Icon source={SearchIcon} />}
            autoComplete="off"
          />
        </Box>
        <Box padding="300" paddingBlockStart="0">
          <InlineStack gap="200">
            <Button size="slim" disclosure>Created by</Button>
            <Button size="slim" disclosure>Category</Button>
            <Button size="slim" disclosure>Includes</Button>
          </InlineStack>
        </Box>
        <DataTable
          columnContentTypes={["text", "text", "text", "text"]}
          headings={["Name", "Category", "Last viewed", "Created by"]}
          rows={filtered}
          footerContent={`1-${filtered.length}`}
        />
      </Card>
    </Page>
  );
}
