"use client";

import {
  Page,
  Card,
  IndexTable,
  Text,
  Badge,
  useIndexResourceState,
  Link,
  BlockStack,
  Box,
} from "@shopify/polaris";

const checkouts = [
  {
    id: "1",
    checkoutId: "#AC1001",
    customer: "Emma Johnson",
    email: "emma.j@example.com",
    date: "Mar 28, 2026",
    total: "$142.50",
    status: "Not recovered",
  },
  {
    id: "2",
    checkoutId: "#AC1002",
    customer: "Liam Chen",
    email: "liam.chen@example.com",
    date: "Mar 30, 2026",
    total: "$89.99",
    status: "Email sent",
  },
  {
    id: "3",
    checkoutId: "#AC1003",
    customer: "Sophia Martinez",
    email: "sophia.m@example.com",
    date: "Apr 1, 2026",
    total: "$215.00",
    status: "Recovered",
  },
];

export default function AbandonedCheckoutsPage() {
  const resourceName = { singular: "checkout", plural: "checkouts" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(checkouts);

  const statusTone = (status: string) => {
    if (status === "Recovered") return "success";
    if (status === "Email sent") return "info";
    return "warning";
  };

  const rowMarkup = checkouts.map((checkout, index) => (
    <IndexTable.Row
      id={checkout.id}
      key={checkout.id}
      selected={selectedResources.includes(checkout.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {checkout.checkoutId}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span">{checkout.customer}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {checkout.email}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {checkout.date}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {checkout.total}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={statusTone(checkout.status)}>{checkout.status}</Badge>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Abandoned checkouts">
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={checkouts.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Checkout" },
            { title: "Customer" },
            { title: "Email" },
            { title: "Date" },
            { title: "Total" },
            { title: "Recovery status" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about abandoned checkouts</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
