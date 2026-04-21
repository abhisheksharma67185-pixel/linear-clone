"use client";

import { Page, Card, BlockStack, Text, Link } from "@shopify/polaris";
import { useRouter, useParams } from "next/navigation";

const REPORT_NAMES: Record<string, string> = {
  "gross-sales": "Gross sales",
  "discounts": "Discounts",
  "returns": "Returns",
  "net-sales": "Net sales",
  "shipping": "Shipping charges",
  "return-fees": "Return fees",
  "taxes": "Taxes",
  "total-sales": "Total sales",
  "orders": "Orders",
  "orders-fulfilled": "Orders fulfilled",
  "returning-customer-rate": "Returning customer rate",
  "sessions": "Sessions",
  "conversion-rate": "Conversion rate",
  "average-order-value": "Average order value",
  "sales-by-channel": "Total sales by sales channel",
  "sales-by-product": "Total sales by product",
  "sessions-by-device": "Sessions by device type",
  "sessions-by-location": "Sessions by location",
  "sales-by-social-referrer": "Total sales by social referrer",
  "customer-cohorts": "Customer cohort analysis",
  "sessions-by-landing-page": "Sessions by landing page",
  "sessions-by-social-referrer": "Sessions by social referrer",
  "sales-by-referrer": "Total sales by referrer",
  "performance-by-channel": "Performance by referring channel",
  "sessions-by-referrer": "Sessions by referrer",
  "sales-by-pos-location": "Total sales by POS location",
  "sell-through-rate": "Products by sell-through rate",
  "pos-staff-sales": "POS staff sales total",
};

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? "");
  const reportName = REPORT_NAMES[slug] ?? slug;

  return (
    <Page
      title={`${reportName} report`}
      backAction={{ content: "Analytics", onAction: () => router.push("/admin/analytics") }}
    >
      <Card>
        <BlockStack gap="300">
          <Text as="p" variant="bodyMd" tone="subdued">
            Detailed report coming soon
          </Text>
          <Link url="/admin/analytics">Back to Analytics</Link>
        </BlockStack>
      </Card>
    </Page>
  );
}
