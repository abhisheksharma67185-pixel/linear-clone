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
  ChoiceList,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "../../lib/mock-data";

function paymentBadge(status: Order["paymentStatus"]) {
  switch (status) {
    case "paid":
      return <Badge tone="success">Paid</Badge>;
    case "pending":
      return <Badge tone="attention">Pending</Badge>;
    case "refunded":
      return <Badge tone="warning">Refunded</Badge>;
  }
}

function fulfillmentBadge(status: Order["fulfillmentStatus"]) {
  switch (status) {
    case "fulfilled":
      return <Badge tone="success">Fulfilled</Badge>;
    case "unfulfilled":
      return <Badge tone="attention">Unfulfilled</Badge>;
    case "partial":
      return <Badge tone="warning">Partial</Badge>;
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryValue, setQueryValue] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Default);

  useEffect(() => {
    fetch("/api/data/orders")
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); })
      .then((data) => {
        setOrders(data);
        setFilteredOrders(data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const resourceName = { singular: "order", plural: "orders" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredOrders);

  const applyFilters = useCallback(
    (query: string, fulfillment: string[], payment: string[]) => {
      let filtered = orders;
      if (query) {
        filtered = filtered.filter(
          (o) =>
            o.orderNumber.includes(query) || o.customer.toLowerCase().includes(query.toLowerCase()),
        );
      }
      if (fulfillment.length > 0) {
        filtered = filtered.filter((o) => fulfillment.includes(o.fulfillmentStatus));
      }
      if (payment.length > 0) {
        filtered = filtered.filter((o) => payment.includes(o.paymentStatus));
      }
      setFilteredOrders(filtered);
    },
    [orders],
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQueryValue(value);
      applyFilters(value, fulfillmentFilter, paymentFilter);
    },
    [applyFilters, fulfillmentFilter, paymentFilter],
  );

  const handleQueryClear = useCallback(() => {
    setQueryValue("");
    applyFilters("", fulfillmentFilter, paymentFilter);
  }, [applyFilters, fulfillmentFilter, paymentFilter]);

  const handleFulfillmentFilterChange = useCallback(
    (value: string[]) => {
      setFulfillmentFilter(value);
      applyFilters(queryValue, value, paymentFilter);
    },
    [applyFilters, queryValue, paymentFilter],
  );

  const handlePaymentFilterChange = useCallback(
    (value: string[]) => {
      setPaymentFilter(value);
      applyFilters(queryValue, fulfillmentFilter, value);
    },
    [applyFilters, queryValue, fulfillmentFilter],
  );

  const handleClearAll = useCallback(() => {
    setQueryValue("");
    setFulfillmentFilter([]);
    setPaymentFilter([]);
    setFilteredOrders(orders);
  }, [orders]);

  const orderFilters = [
    {
      key: "fulfillmentStatus",
      label: "Fulfillment status",
      filter: (
        <ChoiceList
          title="Fulfillment status"
          titleHidden
          choices={[
            { label: "Fulfilled", value: "fulfilled" },
            { label: "Unfulfilled", value: "unfulfilled" },
            { label: "Partial", value: "partial" },
          ]}
          selected={fulfillmentFilter}
          onChange={handleFulfillmentFilterChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "paymentStatus",
      label: "Payment status",
      filter: (
        <ChoiceList
          title="Payment status"
          titleHidden
          choices={[
            { label: "Paid", value: "paid" },
            { label: "Pending", value: "pending" },
            { label: "Refunded", value: "refunded" },
          ]}
          selected={paymentFilter}
          onChange={handlePaymentFilterChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [
    ...(fulfillmentFilter.length > 0
      ? [{ key: "fulfillmentStatus", label: `Fulfillment: ${fulfillmentFilter.join(", ")}`, onRemove: () => handleFulfillmentFilterChange([]) }]
      : []),
    ...(paymentFilter.length > 0
      ? [{ key: "paymentStatus", label: `Payment: ${paymentFilter.join(", ")}`, onRemove: () => handlePaymentFilterChange([]) }]
      : []),
  ];

  if (loading) {
    return (
      <Page title="Orders">
        <div style={{ padding: 40, textAlign: "center" }}>
          <Spinner size="large" />
        </div>
      </Page>
    );
  }

  // Empty state matching the real Shopify admin for new stores
  if (orders.length === 0) {
    return (
      <Page title="Orders" secondaryActions={[{ content: "More actions" }]}>
        <Card>
          <EmptyState
            heading="Your orders will show here"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            action={{ content: "Select plan" }}
          >
            <Text as="p" variant="bodyMd" tone="subdued">
              To get orders and accept payments from customers, you need to select a plan.
              You&apos;ll only be charged for your plan after your free trial ends.
            </Text>
          </EmptyState>
        </Card>
        <Box paddingBlock="400">
          <BlockStack align="center">
            <Text as="p" variant="bodySm" alignment="center">
              <Link monochrome>Learn more about orders</Link>
            </Text>
          </BlockStack>
        </Box>
      </Page>
    );
  }

  const rowMarkup = filteredOrders.map((order, index) => (
    <IndexTable.Row
      id={order.id}
      key={order.id}
      selected={selectedResources.includes(order.id)}
      position={index}
      onClick={() => router.push(`/admin/orders/${order.id}`)}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {order.orderNumber}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{order.date}</IndexTable.Cell>
      <IndexTable.Cell>{order.customer}</IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric>
          ${order.total}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{paymentBadge(order.paymentStatus)}</IndexTable.Cell>
      <IndexTable.Cell>{fulfillmentBadge(order.fulfillmentStatus)}</IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {order.lineItems.length} {order.lineItems.length === 1 ? "item" : "items"}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Orders" secondaryActions={[{ content: "More actions" }, { content: "Export" }]}>
      <Card padding="0">
        <IndexFilters
          queryValue={queryValue}
          queryPlaceholder="Search orders"
          onQueryChange={handleQueryChange}
          onQueryClear={handleQueryClear}
          tabs={[]}
          selected={selectedTab}
          onSelect={setSelectedTab}
          filters={orderFilters}
          appliedFilters={appliedFilters}
          onClearAll={handleClearAll}
          mode={mode}
          setMode={setMode}
        />
        <IndexTable
          resourceName={resourceName}
          itemCount={filteredOrders.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Order" },
            { title: "Date" },
            { title: "Customer" },
            { title: "Total", alignment: "end" },
            { title: "Payment status" },
            { title: "Fulfillment status" },
            { title: "Items" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </Page>
  );
}
