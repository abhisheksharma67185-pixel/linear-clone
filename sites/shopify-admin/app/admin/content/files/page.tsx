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

const files = [
  {
    id: "1",
    filename: "hero-banner.jpg",
    type: "Image",
    size: "2.4 MB",
    uploaded: "Feb 15, 2026",
  },
  {
    id: "2",
    filename: "product-catalog.pdf",
    type: "Document",
    size: "856 KB",
    uploaded: "Mar 1, 2026",
  },
  {
    id: "3",
    filename: "promo-video.mp4",
    type: "Video",
    size: "18.2 MB",
    uploaded: "Mar 12, 2026",
  },
  {
    id: "4",
    filename: "logo-transparent.png",
    type: "Image",
    size: "124 KB",
    uploaded: "Mar 20, 2026",
  },
];

export default function FilesPage() {
  const resourceName = { singular: "file", plural: "files" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(files);

  const typeTone = (type: string) => {
    if (type === "Image") return "info";
    if (type === "Video") return "warning";
    return undefined;
  };

  const rowMarkup = files.map((file, index) => (
    <IndexTable.Row
      id={file.id}
      key={file.id}
      selected={selectedResources.includes(file.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {file.filename}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={typeTone(file.type)}>{file.type}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">{file.size}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">{file.uploaded}</Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Files" primaryAction={{ content: "Upload files" }}>
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={files.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Filename" },
            { title: "Type" },
            { title: "Size" },
            { title: "Uploaded" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about files</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
