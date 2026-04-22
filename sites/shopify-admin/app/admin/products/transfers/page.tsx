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

const transfers = [
  {
    id: "1",
    transferId: "TRF-2001",
    origin: "Main Warehouse",
    destination: "Downtown Store",
    status: "Pending",
    items: 8,
  },
  {
    id: "2",
    transferId: "TRF-2002",
    origin: "Downtown Store",
    destination: "Uptown Outlet",
    status: "Complete",
    items: 15,
  },
];

export default function TransfersPage() {
  const resourceName = { singular: "transfer", plural: "transfers" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(transfers);

  const rowMarkup = transfers.map((transfer, index) => (
    <IndexTable.Row
      id={transfer.id}
      key={transfer.id}
      selected={selectedResources.includes(transfer.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {transfer.transferId}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span">{transfer.origin}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span">{transfer.destination}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={transfer.status === "Complete" ? "success" : "warning"}>
          {transfer.status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {transfer.items}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Transfers" secondaryActions={[{ content: "Transfers report" }]}>
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={transfers.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Transfer ID" },
            { title: "Origin" },
            { title: "Destination" },
            { title: "Status" },
            { title: "Items" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about transfers</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
