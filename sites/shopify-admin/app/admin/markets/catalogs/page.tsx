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

const catalogs = [
  {
    id: "1",
    name: "Wholesale India",
    market: "India",
    products: 48,
    status: "Active",
  },
  {
    id: "2",
    name: "Retail US",
    market: "United States",
    products: 124,
    status: "Draft",
  },
];

export default function CatalogsPage() {
  const resourceName = { singular: "catalog", plural: "catalogs" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(catalogs);

  const rowMarkup = catalogs.map((catalog, index) => (
    <IndexTable.Row
      id={catalog.id}
      key={catalog.id}
      selected={selectedResources.includes(catalog.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {catalog.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span">{catalog.market}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {catalog.products}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={catalog.status === "Active" ? "success" : undefined}>{catalog.status}</Badge>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Catalogs"
      primaryAction={{ content: "Create catalog" }}
      secondaryActions={[{ content: "Export" }, { content: "Import" }]}
    >
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={catalogs.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Catalog" },
            { title: "Market" },
            { title: "Products" },
            { title: "Status" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            Learn more about <Link>catalogs</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
