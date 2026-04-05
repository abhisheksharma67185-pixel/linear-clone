"use client";

import {
  Page,
  Card,
  IndexTable,
  Text,
  Badge,
  useIndexResourceState,
  Link,
  Box,
  BlockStack,
} from "@shopify/polaris";

const purchaseOrders = [
  {
    id: "1",
    poNumber: "PO-1001",
    supplier: "Acme Wholesale",
    status: "Received",
    items: 24,
    date: "Mar 15, 2026",
  },
  {
    id: "2",
    poNumber: "PO-1002",
    supplier: "Globe Textiles",
    status: "Pending",
    items: 12,
    date: "Mar 28, 2026",
  },
];

export default function PurchaseOrdersPage() {
  const resourceName = { singular: "purchase order", plural: "purchase orders" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(purchaseOrders);

  const rowMarkup = purchaseOrders.map((po, index) => (
    <IndexTable.Row
      id={po.id}
      key={po.id}
      selected={selectedResources.includes(po.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {po.poNumber}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span">{po.supplier}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={po.status === "Received" ? "success" : "warning"}>
          {po.status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>{po.items}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">{po.date}</Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Purchase orders">
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={purchaseOrders.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "PO number" },
            { title: "Supplier" },
            { title: "Status" },
            { title: "Items" },
            { title: "Date" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about purchase orders</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
