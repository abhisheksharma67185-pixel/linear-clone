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

const automations = [
  {
    id: "1",
    name: "Welcome email",
    status: "Active",
    trigger: "Customer signs up",
    sent: 1247,
  },
  {
    id: "2",
    name: "Abandoned cart",
    status: "Active",
    trigger: "Cart abandoned for 1 hour",
    sent: 389,
  },
  {
    id: "3",
    name: "Win-back",
    status: "Inactive",
    trigger: "No purchase in 60 days",
    sent: 52,
  },
];

export default function AutomationsPage() {
  const resourceName = { singular: "automation", plural: "automations" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(automations);

  const rowMarkup = automations.map((automation, index) => (
    <IndexTable.Row
      id={automation.id}
      key={automation.id}
      selected={selectedResources.includes(automation.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {automation.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={automation.status === "Active" ? "success" : undefined}>
          {automation.status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">{automation.trigger}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>{automation.sent.toLocaleString()}</Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Automations">
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={automations.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Name" },
            { title: "Status" },
            { title: "Trigger" },
            { title: "Sent" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about marketing automations</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
