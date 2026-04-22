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

const giftCards = [
  {
    id: "1",
    code: "****  ****  ****  g4Kx",
    initialValue: "$50.00",
    balance: "$50.00",
    status: "Active",
    created: "Feb 12, 2026",
  },
  {
    id: "2",
    code: "****  ****  ****  m9Tz",
    initialValue: "$100.00",
    balance: "$73.45",
    status: "Active",
    created: "Mar 5, 2026",
  },
  {
    id: "3",
    code: "****  ****  ****  r2Wp",
    initialValue: "$25.00",
    balance: "$0.00",
    status: "Disabled",
    created: "Jan 20, 2026",
  },
];

export default function GiftCardsPage() {
  const resourceName = { singular: "gift card", plural: "gift cards" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(giftCards);

  const rowMarkup = giftCards.map((card, index) => (
    <IndexTable.Row
      id={card.id}
      key={card.id}
      selected={selectedResources.includes(card.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {card.code}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {card.initialValue}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {card.balance}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={card.status === "Active" ? "success" : undefined}>{card.status}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {card.created}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Gift cards" secondaryActions={[{ content: "Export" }]}>
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={giftCards.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Code" },
            { title: "Initial value" },
            { title: "Balance" },
            { title: "Status" },
            { title: "Created" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about gift cards</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
