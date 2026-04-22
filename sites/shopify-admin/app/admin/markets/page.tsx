"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  InlineGrid,
  Box,
  Badge,
  TextField,
  Icon,
  Link,
  Button,
  Modal,
  Toast,
  Frame,
} from "@shopify/polaris";
import { SearchIcon, PlusIcon, XIcon, GlobeIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";

interface Market {
  [key: string]: unknown;
  id: string;
  name: string;
  status: string;
  includes: string;
}

const initialMarkets: Market[] = [{ id: "1", name: "India", status: "Active", includes: "India" }];

export default function MarketsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMarketName, setNewMarketName] = useState("");
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [graphView, setGraphView] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleCreateMarket = useCallback(() => {
    if (newMarketName.trim()) {
      setMarkets((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          name: newMarketName.trim(),
          status: "Active",
          includes: newMarketName.trim(),
        },
      ]);
      setNewMarketName("");
      setShowCreateModal(false);
      setToastMessage(`Market "${newMarketName.trim()}" created`);
    }
  }, [newMarketName]);

  const handleDismiss = useCallback((suggestion: string) => {
    setDismissedSuggestions((prev) => [...prev, suggestion]);
  }, []);

  const handleCreateSuggested = useCallback((name: string) => {
    setMarkets((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name,
        status: "Active",
        includes: name,
      },
    ]);
    setDismissedSuggestions((prev) => [...prev, name]);
    setToastMessage(`Market "${name}" created`);
  }, []);

  const suggestions = [
    { label: "Create United States Market", name: "United States" },
    { label: "Create United Kingdom Market", name: "United Kingdom" },
  ].filter((s) => !dismissedSuggestions.includes(s.name));

  return (
    <Frame>
      <Page
        title="Markets"
        primaryAction={{
          content: "Create market",
          onAction: () => setShowCreateModal(true),
        }}
        secondaryActions={[
          {
            content: graphView ? "List view" : "Graph view",
            onAction: () => {
              setGraphView((prev) => !prev);
              setToastMessage(graphView ? "Switched to list view" : "Switched to graph view");
            },
          },
        ]}
        fullWidth
      >
        <InlineGrid columns="200px 1fr" gap="400">
          {/* Left sidebar */}
          <Card padding="300">
            <BlockStack gap="200">
              <InlineStack gap="200" blockAlign="center">
                <Icon source={GlobeIcon} tone="base" />
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                  Store default
                </Text>
              </InlineStack>
              <InlineStack gap="200" blockAlign="center">
                <Icon source={PlusIcon} tone="base" />
                <Text as="span" variant="bodyMd">
                  Regions
                </Text>
              </InlineStack>
            </BlockStack>
          </Card>

          {/* Right content */}
          <BlockStack gap="0">
            <Card padding="0">
              <Box padding="300">
                <TextField
                  label="Search markets"
                  labelHidden
                  placeholder="Search in all markets"
                  value={searchValue}
                  onChange={setSearchValue}
                  prefix={<Icon source={SearchIcon} />}
                  autoComplete="off"
                />
              </Box>

              {/* Table header */}
              <Box
                padding="300"
                paddingBlockStart="200"
                paddingBlockEnd="200"
                borderBlockEndWidth="025"
                borderColor="border"
              >
                <InlineGrid columns="2fr 1fr 1fr 1fr" gap="200">
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Market
                  </Text>
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Status
                  </Text>
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Includes
                  </Text>
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Customizations
                  </Text>
                </InlineGrid>
              </Box>

              {/* Market rows */}
              {markets
                .filter((m) => m.name.toLowerCase().includes(searchValue.toLowerCase()))
                .map((market) => (
                  <Box key={market.id} padding="300" borderBlockEndWidth="025" borderColor="border">
                    <InlineGrid columns="2fr 1fr 1fr 1fr" gap="200" alignItems="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={GlobeIcon} tone="base" />
                        <Text as="span" variant="bodyMd">
                          {market.name}
                        </Text>
                      </InlineStack>
                      <InlineStack>
                        <Badge tone="success">{market.status}</Badge>
                      </InlineStack>
                      <Text as="span" variant="bodyMd">
                        {market.includes}
                      </Text>
                      <Box />
                    </InlineGrid>
                  </Box>
                ))}

              {/* Suggested markets */}
              {suggestions.map((suggestion, i) => (
                <Box
                  key={suggestion.name}
                  padding="300"
                  borderBlockEndWidth={i < suggestions.length - 1 ? "025" : undefined}
                  borderColor="border"
                >
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Link onClick={() => handleCreateSuggested(suggestion.name)}>
                        {suggestion.label}
                      </Link>
                      <Icon source={PlusIcon} tone="interactive" />
                    </InlineStack>
                    <Button
                      variant="plain"
                      icon={XIcon}
                      accessibilityLabel="Dismiss"
                      onClick={() => handleDismiss(suggestion.name)}
                    />
                  </InlineStack>
                </Box>
              ))}
            </Card>

            <Box paddingBlock="400">
              <BlockStack align="center">
                <Text as="p" variant="bodySm" alignment="center">
                  <Link monochrome>Learn more about markets</Link>
                </Text>
              </BlockStack>
            </Box>
          </BlockStack>
        </InlineGrid>
      </Page>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create market"
        primaryAction={{
          content: "Create",
          onAction: handleCreateMarket,
          disabled: !newMarketName.trim(),
        }}
        secondaryActions={[{ content: "Cancel", onAction: () => setShowCreateModal(false) }]}
      >
        <Modal.Section>
          <TextField
            label="Market name"
            value={newMarketName}
            onChange={setNewMarketName}
            autoComplete="off"
            placeholder="e.g. North America"
          />
        </Modal.Section>
      </Modal>

      {toastMessage && <Toast content={toastMessage} onDismiss={() => setToastMessage("")} />}
    </Frame>
  );
}
