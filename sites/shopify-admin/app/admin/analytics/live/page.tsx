"use client";

import { Page, Card, BlockStack, Text } from "@shopify/polaris";
import { useRouter } from "next/navigation";

export default function LiveViewPage() {
  const router = useRouter();

  return (
    <Page
      title="Live view"
      backAction={{ content: "Analytics", onAction: () => router.push("/admin/analytics") }}
    >
      <Card>
        <BlockStack gap="300">
          <Text as="p" variant="bodyMd" tone="subdued">
            Detailed report coming soon
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}
