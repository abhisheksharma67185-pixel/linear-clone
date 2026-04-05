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
  Modal,
  Toast,
  Frame,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";

interface Segment {
  [key: string]: unknown;
  id: string;
  name: string;
  percentOfCustomers: string;
  lastActivity: string;
  createdBy: string;
}

const initialSegments: Segment[] = [
  {
    id: "1",
    name: "Customers who have purchased at least once",
    percentOfCustomers: "",
    lastActivity: "Created at 8:01 pm",
    createdBy: "Shopify",
  },
  {
    id: "2",
    name: "Email subscribers",
    percentOfCustomers: "",
    lastActivity: "Created at 8:01 pm",
    createdBy: "Shopify",
  },
  {
    id: "3",
    name: "Abandoned checkouts in the last 30 days",
    percentOfCustomers: "",
    lastActivity: "Created at 8:01 pm",
    createdBy: "Shopify",
  },
  {
    id: "4",
    name: "Customers who have purchased more than once",
    percentOfCustomers: "",
    lastActivity: "Created at 8:01 pm",
    createdBy: "Shopify",
  },
  {
    id: "5",
    name: "Customers who haven't purchased",
    percentOfCustomers: "",
    lastActivity: "Created at 8:01 pm",
    createdBy: "Shopify",
  },
];

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [queryValue, setQueryValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState("");
  const [newSegmentCondition, setNewSegmentCondition] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const filteredSegments = segments.filter((s) =>
    s.name.toLowerCase().includes(queryValue.toLowerCase())
  );

  const resourceName = { singular: "segment", plural: "segments" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredSegments);

  const handleQueryChange = useCallback((value: string) => {
    setQueryValue(value);
  }, []);

  const handleCreate = useCallback(() => {
    if (newSegmentName.trim()) {
      setSegments((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          name: newSegmentName.trim(),
          percentOfCustomers: "",
          lastActivity: "Just now",
          createdBy: "You",
        },
      ]);
      setNewSegmentName("");
      setNewSegmentCondition("");
      setShowModal(false);
      setToastMessage(`Segment "${newSegmentName.trim()}" created`);
    }
  }, [newSegmentName]);

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
    <Frame>
      <Page
        title="Segments"
        primaryAction={{
          content: "Create segment",
          onAction: () => setShowModal(true),
        }}
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
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create segment"
        primaryAction={{
          content: "Create",
          onAction: handleCreate,
          disabled: !newSegmentName.trim(),
        }}
        secondaryActions={[
          { content: "Cancel", onAction: () => setShowModal(false) },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            <TextField
              label="Segment name"
              value={newSegmentName}
              onChange={setNewSegmentName}
              autoComplete="off"
              placeholder="e.g. High-value customers"
            />
            <TextField
              label="Condition"
              value={newSegmentCondition}
              onChange={setNewSegmentCondition}
              autoComplete="off"
              placeholder="e.g. orders > 5"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>

      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage("")} />
      )}
    </Frame>
  );
}
