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

const drafts = [
  {
    id: "1",
    orderNumber: "#D1001",
    customer: "Alex Rivera",
    items: 3,
    total: "$247.50",
    status: "Open",
  },
  {
    id: "2",
    orderNumber: "#D1002",
    customer: "Jordan Lee",
    items: 1,
    total: "$89.00",
    status: "Invoice sent",
  },
];

export default function DraftsPage() {
  const resourceName = { singular: "draft order", plural: "draft orders" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(drafts);

  const rowMarkup = drafts.map((draft, index) => (
    <IndexTable.Row
      id={draft.id}
      key={draft.id}
      selected={selectedResources.includes(draft.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {draft.orderNumber}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span">{draft.customer}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {draft.items}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {draft.total}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={draft.status === "Open" ? "info" : "warning"}>{draft.status}</Badge>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Drafts">
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={drafts.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Draft order" },
            { title: "Customer" },
            { title: "Items" },
            { title: "Total" },
            { title: "Status" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about creating draft orders</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
