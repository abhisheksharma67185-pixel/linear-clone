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
  Modal,
  TextField,
  Toast,
  Frame,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

interface Collection {
  [key: string]: unknown;
  id: string;
  title: string;
  products: number;
  conditions: string;
}

const initialCollections: Collection[] = [
  { id: "1", title: "Home page", products: 0, conditions: "" },
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const resourceName = { singular: "collection", plural: "collections" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(collections);

  const handleCreate = useCallback(() => {
    if (newTitle.trim()) {
      setCollections((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          title: newTitle.trim(),
          products: 0,
          conditions: "",
        },
      ]);
      setNewTitle("");
      setShowModal(false);
      setToastMessage(`Collection "${newTitle.trim()}" created`);
    }
  }, [newTitle]);

  const rowMarkup = collections.map((collection, index) => (
    <IndexTable.Row
      id={collection.id}
      key={collection.id}
      selected={selectedResources.includes(collection.id)}
      position={index}
      onClick={() => setToastMessage(`Viewing collection: ${collection.title}`)}
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
          {collection.conditions || "\u2014"}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Frame>
      <Page
        title="Collections"
        primaryAction={{
          content: "Add collection",
          onAction: () => setShowModal(true),
        }}
      >
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create collection"
        primaryAction={{
          content: "Create",
          onAction: handleCreate,
          disabled: !newTitle.trim(),
        }}
        secondaryActions={[
          { content: "Cancel", onAction: () => setShowModal(false) },
        ]}
      >
        <Modal.Section>
          <TextField
            label="Collection title"
            value={newTitle}
            onChange={setNewTitle}
            autoComplete="off"
            placeholder="e.g. Summer Collection"
          />
        </Modal.Section>
      </Modal>

      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage("")} />
      )}
    </Frame>
  );
}
