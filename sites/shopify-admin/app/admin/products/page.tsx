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
  Modal,
  ChoiceList,
  DropZone,
  Link,
  Select,
  Banner,
  Box,
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

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<"choose" | "csv" | "platform">("choose");
  const [importType, setImportType] = useState<string[]>(["csv"]);
  const [platform, setPlatform] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvSuccess, setCsvSuccess] = useState(false);

  const handleNext = useCallback(() => {
    if (importType[0] === "csv") {
      setStep("csv");
    } else {
      setStep("platform");
    }
  }, [importType]);

  const handleClose = useCallback(() => {
    setStep("choose");
    setImportType(["csv"]);
    setPlatform("");
    setCsvFile(null);
    setCsvSuccess(false);
    onClose();
  }, [onClose]);

  if (step === "platform") {
    const platforms = [
      "Etsy",
      "Facebook Marketplace",
      "Square",
      "Amazon",
      "Instagram",
      "eBay",
      "TikTok",
      "Wix",
      "Cash Register",
      "WooCommerce",
      "WordPress",
      "Squarespace",
      "GoDaddy",
      "Clover",
      "Walmart",
      "Lightspeed",
      "Big Cartel",
      "BigCommerce",
      "ShopKeep",
      "OpenCart",
      "Magento",
      "PrestaShop",
    ];
    return (
      <Modal open={open} onClose={handleClose} title="Import from another platform">
        <Modal.Section>
          <BlockStack gap="300">
            <Text as="p" variant="bodyMd">
              Where are you importing data from?
            </Text>
            <Select
              label="Platform"
              labelHidden
              placeholder="Choose your platform"
              options={platforms.map((p) => ({ label: p, value: p }))}
              value={platform}
              onChange={setPlatform}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    );
  }

  if (step === "csv") {
    return (
      <Modal open={open} onClose={handleClose} title="Import products by CSV">
        <Modal.Section>
          <BlockStack gap="300">
            <DropZone
              onDrop={(_droppedFiles, acceptedFiles) => {
                if (acceptedFiles.length > 0) setCsvFile(acceptedFiles[0]);
              }}
              label="Upload CSV file"
            >
              <DropZone.FileUpload actionTitle="Add file" />
            </DropZone>
            {csvFile && (
              <Banner tone="info">
                <Text as="span" variant="bodyMd">Selected file: {csvFile.name}</Text>
              </Banner>
            )}
            {csvSuccess && (
              <Banner tone="success">
                <Text as="span" variant="bodyMd">CSV import started</Text>
              </Banner>
            )}
          </BlockStack>
        </Modal.Section>
        <Modal.Section>
          <InlineStack align="space-between" blockAlign="center">
            <Link>Download sample CSV</Link>
            <InlineStack gap="200">
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!csvFile}
                onClick={() => {
                  setCsvSuccess(true);
                  setTimeout(() => handleClose(), 1500);
                }}
              >
                Upload and preview
              </Button>
            </InlineStack>
          </InlineStack>
        </Modal.Section>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import products">
      <Modal.Section>
        <BlockStack gap="300">
          <Text as="p" variant="bodyMd">
            How do you want to import your products?
          </Text>
          <ChoiceList
            title="Import method"
            titleHidden
            choices={[
              {
                label: "Upload a Shopify-formatted CSV file",
                value: "csv",
                helpText: (
                  <Text as="span" variant="bodySm" tone="subdued">
                    Import a CSV file that&apos;s already formatted to fit Shopify&apos;s template.{" "}
                    <Link>Download sample CSV</Link>
                  </Text>
                ),
              },
              {
                label: "Import data from another platform",
                value: "platform",
                helpText: (
                  <Text as="span" variant="bodySm" tone="subdued">
                    Import a copy of your data from another platform using one of our recommended
                    apps.
                  </Text>
                ),
              },
            ]}
            selected={importType}
            onChange={setImportType}
          />
        </BlockStack>
      </Modal.Section>
      <Modal.Section>
        <InlineStack align="end" gap="200">
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        </InlineStack>
      </Modal.Section>
    </Modal>
  );
}

function ProductsEmptyState({
  onAddProduct,
  onImport,
}: {
  onAddProduct: () => void;
  onImport: () => void;
}) {
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
            <Button onClick={onImport}>Import</Button>
          </InlineStack>
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingSm" fontWeight="semibold">
            Find products to sell
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Have dropshipping or print on demand products shipped directly from the supplier to your
            customer, and only pay for what you sell.
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
  const [importOpen, setImportOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Default);

  useEffect(() => {
    fetch("/api/data/products")
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); })
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const resourceName = { singular: "product", plural: "products" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredProducts);

  const applyFilters = useCallback(
    (query: string, statuses: string[]) => {
      let filtered = products;
      if (query) {
        filtered = filtered.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
      }
      if (statuses.length > 0) {
        filtered = filtered.filter((p) => statuses.includes(p.status));
      }
      setFilteredProducts(filtered);
    },
    [products],
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQueryValue(value);
      applyFilters(value, statusFilter);
    },
    [applyFilters, statusFilter],
  );

  const handleQueryClear = useCallback(() => {
    setQueryValue("");
    applyFilters("", statusFilter);
  }, [applyFilters, statusFilter]);

  const handleStatusFilterChange = useCallback(
    (value: string[]) => {
      setStatusFilter(value);
      applyFilters(queryValue, value);
    },
    [applyFilters, queryValue],
  );

  const handleClearAll = useCallback(() => {
    setQueryValue("");
    setStatusFilter([]);
    setFilteredProducts(products);
  }, [products]);

  const filters = [
    {
      key: "status",
      label: "Status",
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
          ]}
          selected={statusFilter}
          onChange={handleStatusFilterChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = statusFilter.length > 0
    ? [{ key: "status", label: `Status: ${statusFilter.join(", ")}`, onRemove: () => handleStatusFilterChange([]) }]
    : [];

  if (loading) {
    return (
      <Page title="Products">
        <Box padding="1000">
          <InlineStack align="center">
            <Spinner size="large" />
          </InlineStack>
        </Box>
      </Page>
    );
  }

  if (products.length === 0) {
    return (
      <Page title="Products">
        <ProductsEmptyState
          onAddProduct={() => router.push("/admin/products/new")}
          onImport={() => setImportOpen(true)}
        />
        <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
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
      secondaryActions={[
        { content: "Export" },
        { content: "Import", onAction: () => setImportOpen(true) },
      ]}
    >
      <Card padding="0">
        <IndexFilters
          queryValue={queryValue}
          queryPlaceholder="Search products"
          onQueryChange={handleQueryChange}
          onQueryClear={handleQueryClear}
          tabs={[]}
          selected={selectedTab}
          onSelect={setSelectedTab}
          filters={filters}
          appliedFilters={appliedFilters}
          onClearAll={handleClearAll}
          mode={mode}
          setMode={setMode}
        />
        <IndexTable
          resourceName={resourceName}
          itemCount={filteredProducts.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
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
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </Page>
  );
}
