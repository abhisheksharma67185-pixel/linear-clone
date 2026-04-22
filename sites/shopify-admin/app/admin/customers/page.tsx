"use client";

import {
  Page,
  Card,
  IndexTable,
  Text,
  useIndexResourceState,
  IndexFilters,
  useSetIndexFiltersMode,
  IndexFiltersMode,
  Spinner,
  BlockStack,
  InlineStack,
  Button,
  Box,
  Link,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "../../lib/mock-data";

function CustomersEmptyState({ onAddCustomer }: { onAddCustomer: () => void }) {
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Everything customers-related in one place
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Manage customer details, see customer order history, and group customers into segments.
          </Text>
          <InlineStack gap="200">
            <Button variant="primary" onClick={onAddCustomer}>
              Add customer
            </Button>
            <Button>Import customers</Button>
          </InlineStack>
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingSm" fontWeight="semibold">
            Get customers with apps
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Grow your customer list by adding a lead capture form to your store and marketing.
          </Text>
          <InlineStack>
            <Button>See app recommendations</Button>
          </InlineStack>
        </BlockStack>
      </Card>
      <Box paddingBlock="200">
        <Text as="p" variant="bodySm" alignment="center">
          <Link monochrome>Learn more about customers</Link>
        </Text>
      </Box>
    </BlockStack>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryValue, setQueryValue] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Default);

  useEffect(() => {
    fetch("/api/data/customers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setCustomers(data);
        setFilteredCustomers(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const resourceName = { singular: "customer", plural: "customers" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredCustomers);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQueryValue(value);
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(value.toLowerCase()) ||
          c.email.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredCustomers(filtered);
    },
    [customers],
  );

  const handleQueryClear = useCallback(() => {
    setQueryValue("");
    setFilteredCustomers(customers);
  }, [customers]);

  if (loading) {
    return (
      <Page title="Customers">
        <Box padding="1000">
          <InlineStack align="center">
            <Spinner size="large" />
          </InlineStack>
        </Box>
      </Page>
    );
  }

  if (customers.length === 0) {
    return (
      <Page title="Customers">
        <CustomersEmptyState onAddCustomer={() => router.push("/admin/customers/new")} />
      </Page>
    );
  }

  const rowMarkup = filteredCustomers.map((customer, index) => (
    <IndexTable.Row
      id={customer.id}
      key={customer.id}
      selected={selectedResources.includes(customer.id)}
      position={index}
      onClick={() => router.push(`/admin/customers/${customer.id}`)}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {customer.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{customer.email}</IndexTable.Cell>
      <IndexTable.Cell>{customer.location}</IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>
          {customer.orders}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric>
          ${customer.totalSpent}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Customers"
      primaryAction={{
        content: "Add customer",
        onAction: () => router.push("/admin/customers/new"),
      }}
      secondaryActions={[{ content: "Export" }, { content: "Import" }]}
    >
      <Card padding="0">
        <IndexFilters
          queryValue={queryValue}
          queryPlaceholder="Search customers"
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
          itemCount={filteredCustomers.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Name" },
            { title: "Email" },
            { title: "Location" },
            { title: "Orders" },
            { title: "Amount spent", alignment: "end" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </Page>
  );
}
