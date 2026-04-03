"use client";

import { Page, Card, EmptyState, Text, Link, Box, BlockStack, Button } from "@shopify/polaris";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const router = useRouter();

  return (
    <Page title="Inventory">
      <Card>
        <EmptyState heading="Keep track of your inventory" image="">
          <Text as="p" variant="bodyMd" tone="subdued">
            When you enable inventory tracking on your products, you can view and adjust their
            inventory counts here.
          </Text>
          <Box paddingBlockStart="300">
            <Button onClick={() => router.push("/admin/products")}>Go to products</Button>
          </Box>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about managing inventory</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
