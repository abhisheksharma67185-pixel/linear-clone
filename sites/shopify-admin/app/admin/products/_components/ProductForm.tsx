"use client";

import {
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  BlockStack,
  Text,
  Banner,
  Page,
  InlineStack,
  Box,
  Button,
  Checkbox,
  DropZone,
  Collapsible,
  Badge,
  Modal,
  Icon,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { PlusIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../../../lib/mock-data";

interface VariantOption {
  name: string;
  values: string[];
}

interface ProductFormProps {
  product?: Product;
  isNew?: boolean;
}

export default function ProductForm({ product, isNew }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? "0.00");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice ?? "");
  const [inventory, setInventory] = useState(String(product?.inventory ?? "0"));
  const [status, setStatus] = useState<string>(product?.status ?? "active");
  const [vendor, setVendor] = useState(product?.vendor ?? "");
  const [type, setType] = useState(product?.type ?? "");
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "");
  const [category, setCategory] = useState("");
  const [chargeTax, setChargeTax] = useState(true);
  const [trackInventory, setTrackInventory] = useState(true);
  const [continueSellingOos, setContinueSellingOos] = useState(false);
  const [isPhysical, setIsPhysical] = useState(true);
  const [weight, setWeight] = useState("0.0");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [themeTemplate, setThemeTemplate] = useState("default");

  // Collapsible sections
  const [showPriceExtras, setShowPriceExtras] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showCustomsInfo, setShowCustomsInfo] = useState(false);

  // Variants
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  // Publishing modal
  const [publishingOpen, setPublishingOpen] = useState(false);
  const [onlineStoreEnabled, setOnlineStoreEnabled] = useState(true);
  const [posEnabled, setPosEnabled] = useState(true);

  const addVariantOption = useCallback(() => {
    setVariantOptions((prev) => [...prev, { name: "", values: [""] }]);
  }, []);

  const updateOptionName = useCallback((index: number, name: string) => {
    setVariantOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name };
      return next;
    });
  }, []);

  const updateOptionValue = useCallback((optIndex: number, valIndex: number, value: string) => {
    setVariantOptions((prev) => {
      const next = [...prev];
      const values = [...next[optIndex].values];
      values[valIndex] = value;
      next[optIndex] = { ...next[optIndex], values };
      return next;
    });
  }, []);

  const removeVariantOption = useCallback((index: number) => {
    setVariantOptions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");

    const body = {
      title,
      description,
      price,
      compareAtPrice: compareAtPrice || undefined,
      inventory: parseInt(inventory, 10) || 0,
      status,
      vendor,
      type,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const url = isNew ? "/api/data/products" : `/api/data/products/${product?.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save product");
      setSaving(false);
      return;
    }

    const saved = await res.json();
    router.push(`/admin/products/${saved.id}`);
    router.refresh();
    setSaving(false);
  }, [
    title,
    description,
    price,
    compareAtPrice,
    inventory,
    status,
    vendor,
    type,
    tags,
    isNew,
    product?.id,
    router,
  ]);

  const handleDelete = useCallback(async () => {
    if (!product?.id) return;
    const res = await fetch(`/api/data/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  }, [product, router]);

  return (
    <Page
      title={isNew ? "Add product" : title}
      backAction={{ content: "Products", onAction: () => router.push("/admin/products") }}
      primaryAction={{ content: "Save", loading: saving, onAction: handleSave }}
      secondaryActions={
        isNew
          ? [{ content: "Discard", onAction: () => router.push("/admin/products") }]
          : [
              { content: "Discard" },
              { content: "Delete", destructive: true, onAction: handleDelete },
            ]
      }
    >
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Banner tone="critical">{error}</Banner>
        </div>
      )}

      <Layout>
        {/* Main column */}
        <Layout.Section>
          {/* Title + Description */}
          <Card>
            <BlockStack gap="400">
              <TextField label="Title" value={title} onChange={setTitle} autoComplete="off" />
              <TextField
                label="Description"
                value={description}
                onChange={setDescription}
                multiline={6}
                autoComplete="off"
              />
            </BlockStack>
          </Card>

          {/* Media */}
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Media
              </Text>
              <DropZone onDrop={() => {}} variableHeight>
                <DropZone.FileUpload
                  actionTitle="Upload new"
                  actionHint="Accepts images, videos, or 3D models"
                />
              </DropZone>
            </BlockStack>
          </Card>

          {/* Category */}
          <Card>
            <Select
              label="Category"
              placeholder="Choose a product category"
              options={[
                { label: "Animals & Pet Supplies", value: "animals" },
                { label: "Apparel & Accessories", value: "apparel" },
                { label: "Arts & Entertainment", value: "arts" },
                { label: "Baby & Toddler", value: "baby" },
                { label: "Business & Industrial", value: "business" },
                { label: "Cameras & Optics", value: "cameras" },
                { label: "Electronics", value: "electronics" },
                { label: "Food, Beverages & Tobacco", value: "food" },
                { label: "Furniture", value: "furniture" },
                { label: "Hardware", value: "hardware" },
                { label: "Health & Beauty", value: "health" },
                { label: "Home & Garden", value: "home" },
                { label: "Luggage & Bags", value: "luggage" },
                { label: "Media", value: "media" },
                { label: "Office Supplies", value: "office" },
                { label: "Software", value: "software" },
                { label: "Sporting Goods", value: "sporting" },
                { label: "Toys & Games", value: "toys" },
                { label: "Vehicles & Parts", value: "vehicles" },
              ]}
              value={category}
              onChange={setCategory}
              helpText="Determines tax rates and adds metafields to improve search, filters, and cross-channel sales"
            />
          </Card>

          {/* Price */}
          <Card>
            <BlockStack gap="400">
              <TextField
                label="Price"
                value={price}
                onChange={setPrice}
                prefix="$"
                type="number"
                autoComplete="off"
              />
            </BlockStack>
          </Card>

          {/* Additional display prices */}
          <Card>
            <BlockStack gap="400">
              <Button
                variant="plain"
                onClick={() => setShowPriceExtras(!showPriceExtras)}
                disclosure={showPriceExtras ? "up" : "down"}
              >
                Additional display prices
              </Button>
              <Collapsible open={showPriceExtras} id="price-extras">
                <BlockStack gap="300">
                  <FormLayout.Group>
                    <TextField
                      label="Compare-at price"
                      value={compareAtPrice}
                      onChange={setCompareAtPrice}
                      prefix="$"
                      type="number"
                      autoComplete="off"
                    />
                    <Select
                      label="Unit price"
                      placeholder="--"
                      options={[
                        { label: "per item", value: "item" },
                        { label: "per kg", value: "kg" },
                        { label: "per lb", value: "lb" },
                      ]}
                      value=""
                      onChange={() => {}}
                    />
                  </FormLayout.Group>
                  <Checkbox
                    label="Charge tax on this product"
                    checked={chargeTax}
                    onChange={setChargeTax}
                  />
                  <InlineStack gap="400">
                    <Text as="span" variant="bodySm" tone="subdued">
                      Cost --
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      Profit --
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      Margin --
                    </Text>
                  </InlineStack>
                </BlockStack>
              </Collapsible>
            </BlockStack>
          </Card>

          {/* Inventory */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingSm">
                  Inventory
                </Text>
                <Checkbox
                  label="Inventory tracked"
                  checked={trackInventory}
                  onChange={setTrackInventory}
                />
              </InlineStack>
              <Box background="bg-surface-secondary" borderRadius="200" padding="300">
                <InlineStack align="space-between">
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Quantity
                  </Text>
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Quantity
                  </Text>
                </InlineStack>
              </Box>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="span" variant="bodyMd">
                  Shop location
                </Text>
                <div style={{ width: 100 }}>
                  <TextField
                    label="Quantity"
                    labelHidden
                    value={inventory}
                    onChange={setInventory}
                    type="number"
                    autoComplete="off"
                  />
                </div>
              </InlineStack>
            </BlockStack>
          </Card>

          {/* More details (SKU, Barcode) */}
          <Card>
            <BlockStack gap="400">
              <Button
                variant="plain"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                disclosure={showMoreDetails ? "up" : "down"}
              >
                More details
              </Button>
              <Collapsible open={showMoreDetails} id="more-details">
                <BlockStack gap="300">
                  <FormLayout.Group>
                    <TextField
                      label="SKU (Stock Keeping Unit)"
                      value={sku}
                      onChange={setSku}
                      autoComplete="off"
                    />
                    <TextField
                      label="Barcode (ISBN, UPC, GTIN, etc.)"
                      value={barcode}
                      onChange={setBarcode}
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                  <Checkbox
                    label="Continue selling when out of stock"
                    checked={continueSellingOos}
                    onChange={setContinueSellingOos}
                  />
                </BlockStack>
              </Collapsible>
            </BlockStack>
          </Card>

          {/* Shipping */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingSm">
                  Shipping
                </Text>
                <Checkbox label="Physical product" checked={isPhysical} onChange={setIsPhysical} />
              </InlineStack>
              {isPhysical && (
                <FormLayout>
                  <FormLayout.Group>
                    <Select
                      label="Package"
                      options={[
                        {
                          label:
                            "Store default \u2022 Sample box - 22 \u00d7 13.7 \u00d7 4.2 cm, 0 kg",
                          value: "default",
                        },
                      ]}
                      value="default"
                      onChange={() => {}}
                    />
                    <TextField
                      label="Product weight"
                      value={weight}
                      onChange={setWeight}
                      type="number"
                      autoComplete="off"
                      connectedRight={
                        <Select
                          label="Unit"
                          labelHidden
                          options={[
                            { label: "kg", value: "kg" },
                            { label: "lb", value: "lb" },
                            { label: "g", value: "g" },
                            { label: "oz", value: "oz" },
                          ]}
                          value={weightUnit}
                          onChange={setWeightUnit}
                        />
                      }
                    />
                  </FormLayout.Group>
                </FormLayout>
              )}
            </BlockStack>
          </Card>

          {/* Customs information */}
          {isPhysical && (
            <Card>
              <BlockStack gap="400">
                <Button
                  variant="plain"
                  onClick={() => setShowCustomsInfo(!showCustomsInfo)}
                  disclosure={showCustomsInfo ? "up" : "down"}
                >
                  Customs information
                </Button>
                <Collapsible open={showCustomsInfo} id="customs-info">
                  <BlockStack gap="300">
                    <Select
                      label="Country/Region of origin"
                      placeholder="Select"
                      options={[
                        { label: "United States", value: "US" },
                        { label: "India", value: "IN" },
                        { label: "China", value: "CN" },
                        { label: "United Kingdom", value: "GB" },
                      ]}
                      value={countryOfOrigin}
                      onChange={setCountryOfOrigin}
                    />
                    <TextField
                      label="Harmonized System (HS) code"
                      value={hsCode}
                      onChange={setHsCode}
                      placeholder="Enter a 6-digit code or search by keyword"
                      autoComplete="off"
                    />
                  </BlockStack>
                </Collapsible>
              </BlockStack>
            </Card>
          )}

          {/* Variants */}
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Variants
              </Text>
              {variantOptions.map((option, optIndex) => (
                <Card key={optIndex}>
                  <BlockStack gap="300">
                    <TextField
                      label="Option name"
                      value={option.name}
                      onChange={(val) => updateOptionName(optIndex, val)}
                      autoComplete="off"
                      error={option.name === "" ? "Option name is required." : undefined}
                    />
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      Option values
                    </Text>
                    {option.values.map((val, valIndex) => (
                      <TextField
                        key={valIndex}
                        label={`Value ${valIndex + 1}`}
                        labelHidden
                        value={val}
                        onChange={(v) => updateOptionValue(optIndex, valIndex, v)}
                        autoComplete="off"
                      />
                    ))}
                    <InlineStack align="space-between">
                      <Button tone="critical" onClick={() => removeVariantOption(optIndex)}>
                        Delete
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setVariantOptions((prev) => {
                            const next = [...prev];
                            next[optIndex] = {
                              ...next[optIndex],
                              values: [...next[optIndex].values, ""],
                            };
                            return next;
                          });
                        }}
                      >
                        Done
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Card>
              ))}
              <Button icon={PlusIcon} variant="plain" onClick={addVariantOption}>
                {variantOptions.length === 0
                  ? "Add options like size or color"
                  : "Add another option"}
              </Button>
            </BlockStack>
          </Card>

          {/* Search engine listing */}
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Search engine listing
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Add a title and description to see how this product might appear in a search engine
                listing
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Sidebar */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Status
              </Text>
              <Select
                label="Status"
                labelHidden
                options={[
                  { label: "Active", value: "active" },
                  { label: "Draft", value: "draft" },
                  { label: "Archived", value: "archived" },
                ]}
                value={status}
                onChange={setStatus}
              />
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingSm">
                  Publishing
                </Text>
                <Button variant="plain" onClick={() => setPublishingOpen(true)}>
                  Manage
                </Button>
              </InlineStack>
              <InlineStack gap="200">
                {onlineStoreEnabled && <Badge>Online Store</Badge>}
                {posEnabled && <Badge>Point of Sale</Badge>}
              </InlineStack>
            </BlockStack>
            <Modal
              open={publishingOpen}
              onClose={() => setPublishingOpen(false)}
              title="Manage publishing"
            >
              <Modal.Section>
                <BlockStack gap="400">
                  <TextField
                    label="Search channels"
                    labelHidden
                    placeholder="Search channels"
                    value=""
                    onChange={() => {}}
                    prefix={<Icon source={SearchIcon} />}
                    autoComplete="off"
                  />
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        Sales Channels
                      </Text>
                      <Checkbox
                        label=""
                        labelHidden
                        checked={onlineStoreEnabled && posEnabled}
                        onChange={(checked) => {
                          setOnlineStoreEnabled(checked);
                          setPosEnabled(checked);
                        }}
                      />
                    </InlineStack>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="span" variant="bodyMd">
                        Online Store
                      </Text>
                      <Checkbox
                        label=""
                        labelHidden
                        checked={onlineStoreEnabled}
                        onChange={setOnlineStoreEnabled}
                      />
                    </InlineStack>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="span" variant="bodyMd">
                        Point of Sale
                      </Text>
                      <Checkbox
                        label=""
                        labelHidden
                        checked={posEnabled}
                        onChange={setPosEnabled}
                      />
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Modal.Section>
              <Modal.Section>
                <InlineStack align="end" gap="200">
                  <Button onClick={() => setPublishingOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => setPublishingOpen(false)}>
                    Done
                  </Button>
                </InlineStack>
              </Modal.Section>
            </Modal>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Product organization
              </Text>
              <FormLayout>
                <TextField label="Type" value={type} onChange={setType} autoComplete="off" />
                <TextField label="Vendor" value={vendor} onChange={setVendor} autoComplete="off" />
                <TextField
                  label="Collections"
                  value=""
                  onChange={() => {}}
                  autoComplete="off"
                  placeholder="Search collections"
                />
                <TextField label="Tags" value={tags} onChange={setTags} autoComplete="off" />
              </FormLayout>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Theme template
              </Text>
              <Select
                label="Theme template"
                labelHidden
                options={[{ label: "Default product", value: "default" }]}
                value={themeTemplate}
                onChange={setThemeTemplate}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
