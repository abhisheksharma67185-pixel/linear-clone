"use client";

import {
  Page,
  Card,
  EmptyState,
  Text,
  Link,
  Box,
  BlockStack,
  Modal,
  TextField,
  Toast,
  Frame,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

export default function MetaobjectsPage() {
  const [showModal, setShowModal] = useState(false);
  const [defName, setDefName] = useState("");
  const [defType, setDefType] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const handleCreate = useCallback(() => {
    if (defName.trim()) {
      setShowModal(false);
      setToastMessage(`Definition "${defName.trim()}" added`);
      setDefName("");
      setDefType("");
    }
  }, [defName]);

  return (
    <Frame>
      <Page
        title="Metaobjects"
        primaryAction={{
          content: "Add definition",
          onAction: () => setShowModal(true),
        }}
        secondaryActions={[
          {
            content: "Manage",
            onAction: () => setToastMessage("Manage metaobjects coming soon"),
          },
        ]}
      >
        <Card>
          <EmptyState
            heading="Streamline content creation with metaobjects"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            action={{
              content: "Add definition",
              onAction: () => setShowModal(true),
            }}
          >
            <Text as="p" variant="bodyMd" tone="subdued">
              Metaobjects allow you to group fields and connect them to different parts of your store.
              Use them to create custom content or data structures.
            </Text>
          </EmptyState>
        </Card>
        <Box paddingBlock="400">
          <BlockStack align="center">
            <Text as="p" variant="bodySm" alignment="center">
              Learn more about <Link>metaobjects</Link>
            </Text>
          </BlockStack>
        </Box>
      </Page>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add definition"
        primaryAction={{
          content: "Add",
          onAction: handleCreate,
          disabled: !defName.trim(),
        }}
        secondaryActions={[
          { content: "Cancel", onAction: () => setShowModal(false) },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            <TextField
              label="Name"
              value={defName}
              onChange={setDefName}
              autoComplete="off"
              placeholder="e.g. Author"
            />
            <TextField
              label="Type"
              value={defType}
              onChange={setDefType}
              autoComplete="off"
              placeholder="e.g. single_line_text_field"
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
