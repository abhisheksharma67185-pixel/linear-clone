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
  BlockStack,
  InlineStack,
  Button,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../../lib/mock-data";

function statusBadge(status: Product["status"]) {
  switch (status) {
    case "active":
      return <Badge tone="success">Active</Badge>;
    case "draft":
      return <Badge>Draft</Badge>;
    case "archived":
      return <Badge tone="info">Archived</Badge>;
  }
}

function ProductsEmptyState({ onAddProduct }: { onAddProduct: () => void }) {
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Add your products
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Start by stocking your store with products your customers will love
          </Text>
          <InlineStack gap="200">
            <Button variant="primary" onClick={onAddProduct}>
              Add product
            </Button>
            <Button>Import</Button>
          </InlineStack>
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingSm" fontWeight="semibold">
            Find products to sell
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Have dropshipping or print on demand products shipped directly from
            the supplier to your customer, and only pay for what you sell.
          </Text>
          <div>
            <Button>Browse product sourcing apps</Button>
          </div>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryValue, setQueryValue] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Default);

  useEffect(() => {
    fetch("/api/data/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      });
  }, []);

  const resourceName = { singular: "product", plural: "products" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredProducts);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQueryValue(value);
      const filtered = products.filter((p) =>
        p.title.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredProducts(filtered);
    },
    [products],
  );

  const handleQueryClear = useCallback(() => {
    setQueryValue("");
    setFilteredProducts(products);
  }, [products]);

  if (loading) {
    return (
      <Page title="Products">
        <div style={{ padding: 40, textAlign: "center" }}>
          <Spinner size="large" />
        </div>
      </Page>
    );
  }

  // Show empty state when no products exist
  if (products.length === 0) {
    return (
      <Page title="Products">
        <ProductsEmptyState onAddProduct={() => router.push("/admin/products/new")} />
      </Page>
    );
  }

  const rowMarkup = filteredProducts.map((product, index) => (
    <IndexTable.Row
      id={product.id}
      key={product.id}
      selected={selectedResources.includes(product.id)}
      position={index}
      onClick={() => router.push(`/admin/products/${product.id}`)}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {product.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{statusBadge(product.status)}</IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric>
          {product.inventory} in stock
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric>
          ${product.price}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{product.vendor}</IndexTable.Cell>
      <IndexTable.Cell>{product.type}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Products"
      primaryAction={{
        content: "Add product",
        onAction: () => router.push("/admin/products/new"),
      }}
      secondaryActions={[{ content: "Export" }, { content: "Import" }]}
    >
      <Card padding="0">
        <IndexFilters
          queryValue={queryValue}
          queryPlaceholder="Search products"
          onQueryChange={handleQueryChange}
          onQueryClear={handleQueryClear}
          tabs={[]}
          selected={0}
          onSelect={() => {}}
          filters={[]}
          onClearAll={() => {}}
          mode={mode}
          setMode={setMode}
        />
        <IndexTable
          resourceName={resourceName}
          itemCount={filteredProducts.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Product" },
            { title: "Status" },
            { title: "Inventory", alignment: "end" },
            { title: "Price", alignment: "end" },
            { title: "Vendor" },
            { title: "Type" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </Page>
  );
}
