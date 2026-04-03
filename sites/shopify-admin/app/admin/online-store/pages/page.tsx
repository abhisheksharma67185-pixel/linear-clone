"use client";

import {
  Page,
  Card,
  IndexTable,
  Text,
  Badge,
  useIndexResourceState,
  Banner,
  Button,
  Box,
  BlockStack,
  Link,
} from "@shopify/polaris";

const storePages = [
  {
    id: "1",
    title: "Contact",
    visibility: "Visible",
    content: "",
    updated: "Yesterday at 8:01 pm",
  },
];

export default function PagesPage() {
  const resourceName = { singular: "page", plural: "pages" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(storePages);

  const rowMarkup = storePages.map((page, index) => (
    <IndexTable.Row
      id={page.id}
      key={page.id}
      selected={selectedResources.includes(page.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {page.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone="success">{page.visibility}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {page.content}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {page.updated}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Pages" primaryAction={{ content: "Add page" }}>
      <BlockStack gap="400">
        <Banner tone="warning">
          <Text as="h3" variant="headingSm" fontWeight="semibold">
            Store access is restricted
          </Text>
          <Box paddingBlockStart="200">
            <Text as="p" variant="bodyMd">
              Only visitors with the password can access your online store.
            </Text>
          </Box>
          <Box paddingBlockStart="200">
            <Button>Manage access</Button>
          </Box>
        </Banner>

        <Card padding="0">
          <IndexTable
            resourceName={resourceName}
            itemCount={storePages.length}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: "Title" },
              { title: "Visibility" },
              { title: "Content" },
              { title: "Updated" },
            ]}
          >
            {rowMarkup}
          </IndexTable>
        </Card>

        <Box paddingBlock="200">
          <Text as="p" variant="bodySm" alignment="center">
            Learn more about <Link>pages</Link>
          </Text>
        </Box>
      </BlockStack>
    </Page>
  );
}
