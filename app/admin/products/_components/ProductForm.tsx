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
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../../../lib/mock-data";

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
  const [price, setPrice] = useState(product?.price ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ?? "",
  );
  const [inventory, setInventory] = useState(
    String(product?.inventory ?? "0"),
  );
  const [status, setStatus] = useState<string>(product?.status ?? "draft");
  const [vendor, setVendor] = useState(product?.vendor ?? "");
  const [type, setType] = useState(product?.type ?? "");
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "");

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

    const url = isNew
      ? "/api/data/products"
      : `/api/data/products/${product?.id}`;
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
    title, description, price, compareAtPrice, inventory,
    status, vendor, type, tags, isNew, product?.id, router,
  ]);

  const handleDelete = useCallback(async () => {
    if (!product?.id) return;
    const res = await fetch(`/api/data/products/${product.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  }, [product, router]);

  return (
    <Page
      title={isNew ? "Add product" : title}
      backAction={{ content: "Products", onAction: () => router.push("/admin/products") }}
      primaryAction={{
        content: "Save",
        loading: saving,
        onAction: handleSave,
      }}
      secondaryActions={
        isNew
          ? []
          : [{ content: "Delete", destructive: true, onAction: handleDelete }]
      }
    >
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Banner tone="critical">{error}</Banner>
        </div>
      )}

      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Product details
              </Text>
              <FormLayout>
                <TextField
                  label="Title"
                  value={title}
                  onChange={setTitle}
                  autoComplete="off"
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  multiline={4}
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Pricing
              </Text>
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    label="Price"
                    value={price}
                    onChange={setPrice}
                    type="currency"
                    prefix="$"
                    autoComplete="off"
                  />
                  <TextField
                    label="Compare-at price"
                    value={compareAtPrice}
                    onChange={setCompareAtPrice}
                    type="currency"
                    prefix="$"
                    autoComplete="off"
                  />
                </FormLayout.Group>
              </FormLayout>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Inventory
              </Text>
              <FormLayout>
                <TextField
                  label="Quantity"
                  value={inventory}
                  onChange={setInventory}
                  type="number"
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Status
              </Text>
              <Select
                label="Product status"
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
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Organization
              </Text>
              <FormLayout>
                <TextField
                  label="Vendor"
                  value={vendor}
                  onChange={setVendor}
                  autoComplete="off"
                />
                <TextField
                  label="Product type"
                  value={type}
                  onChange={setType}
                  autoComplete="off"
                />
                <TextField
                  label="Tags"
                  value={tags}
                  onChange={setTags}
                  helpText="Comma-separated"
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
