"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Modal,
  TextField,
  Toast,
  Frame,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function CampaignsPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const handleCreate = useCallback(() => {
    if (campaignName.trim()) {
      setShowModal(false);
      setToastMessage(`Campaign "${campaignName.trim()}" created`);
      setCampaignName("");
    }
  }, [campaignName]);

  return (
    <Frame>
      <Page title="Campaigns">
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm" fontWeight="semibold">
                Centralize your campaign tracking
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Create campaigns to evaluate how marketing initiatives drive business goals. Capture
                online and offline touchpoints, add campaign activities from multiple marketing
                channels, and monitor results.
              </Text>
              <InlineStack gap="200">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  Create campaign
                </Button>
                <Button onClick={() => setToastMessage("Opening Shopify help center...")}>
                  Learn more
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm" fontWeight="semibold">
                Generate traffic with marketing apps
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Grow your audience on social platforms, capture new leads with newsletter sign-ups,
                increase conversion with chat, and more.
              </Text>
              <InlineStack>
                <Button onClick={() => router.push("/admin/marketing")}>
                  Browse marketing apps
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </BlockStack>
      </Page>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create campaign"
        primaryAction={{
          content: "Create",
          onAction: handleCreate,
          disabled: !campaignName.trim(),
        }}
        secondaryActions={[
          { content: "Cancel", onAction: () => setShowModal(false) },
        ]}
      >
        <Modal.Section>
          <TextField
            label="Campaign name"
            value={campaignName}
            onChange={setCampaignName}
            autoComplete="off"
            placeholder="e.g. Summer Sale 2026"
          />
        </Modal.Section>
      </Modal>

      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage("")} />
      )}
    </Frame>
  );
}
