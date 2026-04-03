"use client";

import {
  Page,
  Card,
  IndexTable,
  Text,
  useIndexResourceState,
  TextField,
  Box,
  BlockStack,
  Link,
  Icon,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";

const segments = [
  { id: "1", name: "Customers who have purchased at least once", percentOfCustomers: "", lastActivity: "Created at 8:01 pm", createdBy: "Shopify" },
  { id: "2", name: "Email subscribers", percentOfCustomers: "", lastActivity: "Created at 8:01 pm", createdBy: "Shopify" },
  { id: "3", name: "Abandoned checkouts in the last 30 days", percentOfCustomers: "", lastActivity: "Created at 8:01 pm", createdBy: "Shopify" },
  { id: "4", name: "Customers who have purchased more than once", percentOfCustomers: "", lastActivity: "Created at 8:01 pm", createdBy: "Shopify" },
  { id: "5", name: "Customers who haven't purchased", percentOfCustomers: "", lastActivity: "Created at 8:01 pm", createdBy: "Shopify" },
];

export default function SegmentsPage() {
  const [queryValue, setQueryValue] = useState("");
  const [filteredSegments, setFilteredSegments] = useState(segments);

  const resourceName = { singular: "segment", plural: "segments" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredSegments);

  const handleQueryChange = useCallback((value: string) => {
    setQueryValue(value);
    const filtered = segments.filter((s) =>
      s.name.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredSegments(filtered);
  }, []);

  const rowMarkup = filteredSegments.map((segment, index) => (
    <IndexTable.Row
      id={segment.id}
      key={segment.id}
      selected={selectedResources.includes(segment.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {segment.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {segment.percentOfCustomers}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {segment.lastActivity}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued">
          {segment.createdBy}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Segments"
      primaryAction={{ content: "Create segment" }}
    >
      <Card padding="0">
        <Box padding="300">
          <TextField
            label="Search segments"
            labelHidden
            placeholder="Search segments"
            value={queryValue}
            onChange={handleQueryChange}
            prefix={<Icon source={SearchIcon} />}
            autoComplete="off"
          />
        </Box>
        <IndexTable
          resourceName={resourceName}
          itemCount={filteredSegments.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Name" },
            { title: "% of customers" },
            { title: "Last activity" },
            { title: "Created by" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about segments</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
