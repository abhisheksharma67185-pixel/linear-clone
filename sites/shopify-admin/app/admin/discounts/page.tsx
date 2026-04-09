"use client";

import {
  Page,
  Card,
  IndexTable,
  Text,
  Badge,
  useIndexResourceState,
  IndexFilters,
  useSetIndexFiltersMode,
  IndexFiltersMode,
  Spinner,
  EmptyState,
  Box,
  BlockStack,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Discount } from "../../lib/mock-data";

function statusBadge(status: Discount["status"]) {
  switch (status) {
    case "active":
      return <Badge tone="success">Active</Badge>;
    case "expired":
      return <Badge>Expired</Badge>;
    case "scheduled":
      return <Badge tone="info">Scheduled</Badge>;
  }
}

function typeBadge(type: Discount["type"]) {
  return type === "automatic" ? <Badge>Automatic</Badge> : <Badge tone="attention">Code</Badge>;
}

export default function DiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryValue, setQueryValue] = useState("");
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Default);

  useEffect(() => {
    fetch("/api/data/discounts")
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); })
      .then((data) => {
        setDiscounts(data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQueryValue(value);
  }, []);

  const handleQueryClear = useCallback(() => {
    setQueryValue("");
  }, []);

  const filteredDiscounts = discounts.filter(
    (d) =>
      !queryValue ||
      d.title.toLowerCase().includes(queryValue.toLowerCase()) ||
      (d.code?.toLowerCase().includes(queryValue.toLowerCase()))
  );

  const resourceName = { singular: "discount", plural: "discounts" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredDiscounts);

  if (loading) {
    return (
      <Page title="Discounts">
        <Box padding="1000">
          <InlineStack align="center">
            <Spinner size="large" />
          </InlineStack>
        </Box>
      </Page>
    );
  }

  // Empty state matching real Shopify admin
  if (discounts.length === 0) {
    return (
      <Page
        title="Discounts"
        primaryAction={{ content: "Create discount" }}
        secondaryActions={[{ content: "Export" }]}
      >
        <Card>
          <EmptyState
            heading="Manage discounts and promotions"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            action={{ content: "Create discount" }}
          >
            <Text as="p" variant="bodyMd" tone="subdued">
              Add discount codes and automatic discounts that apply at checkout. You can also use
              discounts with <Link>compare at prices</Link>.
            </Text>
          </EmptyState>
        </Card>
        <Box paddingBlock="400">
          <BlockStack align="center">
            <Text as="p" variant="bodySm" alignment="center">
              <Link monochrome>Learn more about discounts</Link>
            </Text>
          </BlockStack>
        </Box>
      </Page>
    );
  }

  const rowMarkup = filteredDiscounts.map((discount, index) => (
    <IndexTable.Row
      id={discount.id}
      key={discount.id}
      selected={selectedResources.includes(discount.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {discount.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{statusBadge(discount.status)}</IndexTable.Cell>
      <IndexTable.Cell>{typeBadge(discount.type)}</IndexTable.Cell>
      <IndexTable.Cell>
        {discount.valueType === "percentage"
          ? `${discount.value}%`
          : discount.valueType === "fixed_amount"
            ? `$${discount.value}`
            : "Free shipping"}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {discount.usageCount}
          {discount.usageLimit ? ` / ${discount.usageLimit}` : ""}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{discount.startsAt}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Discounts"
      primaryAction={{
        content: "Create discount",
        onAction: () => router.push("/admin/discounts/new"),
      }}
      secondaryActions={[{ content: "Export" }]}
    >
      <Card padding="0">
        <IndexFilters
          queryValue={queryValue}
          queryPlaceholder="Search discounts"
          onQueryChange={handleQueryChange}
          onQueryClear={handleQueryClear}
          tabs={[]}
          selected={0}
          onSelect={() => {}}
          filters={[]}
          onClearAll={handleQueryClear}
          mode={mode}
          setMode={setMode}
        />
        <IndexTable
          resourceName={resourceName}
          itemCount={filteredDiscounts.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Discount" },
            { title: "Status" },
            { title: "Type" },
            { title: "Value" },
            { title: "Usage" },
            { title: "Start date" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </Page>
  );
}
