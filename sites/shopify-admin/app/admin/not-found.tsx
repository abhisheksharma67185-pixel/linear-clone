"use client";

import { Page, Card, BlockStack, Text, Button } from "@shopify/polaris";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <Page>
      <Card>
        <BlockStack gap="400" align="center">
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text as="h1" variant="heading2xl">
              404
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text as="p" variant="bodyMd" tone="subdued">
                Page not found
              </Text>
            </div>
            <div style={{ marginTop: 16 }}>
              <Button onClick={() => router.push("/admin")}>Back to dashboard</Button>
            </div>
          </div>
        </BlockStack>
      </Card>
    </Page>
  );
}
