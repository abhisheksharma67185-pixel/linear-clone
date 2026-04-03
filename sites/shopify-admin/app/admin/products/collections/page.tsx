"use client";

import {
  Page,
  Card,
  IndexTable,
  Text,
  useIndexResourceState,
  Link,
  Box,
  BlockStack,
} from "@shopify/polaris";

const collections = [{ id: "1", title: "Home page", products: 0, conditions: "" }];

export default function CollectionsPage() {
  const resourceName = { singular: "collection", plural: "collections" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(collections);

  const rowMarkup = collections.map((collection, index) => (
    <IndexTable.Row
      id={collection.id}
      key={collection.id}
      selected={selectedResources.includes(collection.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {collection.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {collection.products}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {collection.conditions || "—"}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Collections" primaryAction={{ content: "Add collection" }}>
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={collections.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[{ title: "Title" }, { title: "Products" }, { title: "Product conditions" }]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about collections</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
