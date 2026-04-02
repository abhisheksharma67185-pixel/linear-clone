"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  FormLayout,
  TextField,
  Select,
  ChoiceList,
  Checkbox,
  Banner,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function NewDiscountPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<string>("code");
  const [valueType, setValueType] = useState<string[]>(["percentage"]);
  const [value, setValue] = useState("");
  const [startsAt, setStartsAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endsAt, setEndsAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");

    const body = {
      title,
      code: type === "code" ? code : undefined,
      type,
      valueType: valueType[0],
      value,
      startsAt,
      endsAt: hasEndDate ? endsAt : undefined,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
      status: "active",
    };

    const res = await fetch("/api/data/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create discount");
      setSaving(false);
      return;
    }

    router.push("/admin/discounts");
    setSaving(false);
  }, [title, code, type, valueType, value, startsAt, hasEndDate, endsAt, usageLimit, router]);

  return (
    <Page
      title="Create discount"
      backAction={{
        content: "Discounts",
        onAction: () => router.push("/admin/discounts"),
      }}
      primaryAction={{
        content: "Save discount",
        loading: saving,
        onAction: handleSave,
      }}
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
                Discount details
              </Text>
              <FormLayout>
                <TextField
                  label="Discount title"
                  value={title}
                  onChange={setTitle}
                  autoComplete="off"
                />
                <Select
                  label="Discount type"
                  options={[
                    { label: "Discount code", value: "code" },
                    { label: "Automatic discount", value: "automatic" },
                  ]}
                  value={type}
                  onChange={setType}
                />
                {type === "code" && (
                  <TextField
                    label="Discount code"
                    value={code}
                    onChange={setCode}
                    autoComplete="off"
                    helpText="Customers will enter this code at checkout"
                  />
                )}
              </FormLayout>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Value
              </Text>
              <ChoiceList
                title="Discount value type"
                titleHidden
                choices={[
                  { label: "Percentage", value: "percentage" },
                  { label: "Fixed amount", value: "fixed_amount" },
                  { label: "Free shipping", value: "free_shipping" },
                ]}
                selected={valueType}
                onChange={setValueType}
              />
              {valueType[0] !== "free_shipping" && (
                <TextField
                  label={
                    valueType[0] === "percentage"
                      ? "Percentage value"
                      : "Discount amount"
                  }
                  value={value}
                  onChange={setValue}
                  prefix={valueType[0] === "fixed_amount" ? "$" : undefined}
                  suffix={valueType[0] === "percentage" ? "%" : undefined}
                  type="number"
                  autoComplete="off"
                />
              )}
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Active dates
              </Text>
              <FormLayout>
                <TextField
                  label="Start date"
                  value={startsAt}
                  onChange={setStartsAt}
                  type="date"
                  autoComplete="off"
                />
                <Checkbox
                  label="Set end date"
                  checked={hasEndDate}
                  onChange={setHasEndDate}
                />
                {hasEndDate && (
                  <TextField
                    label="End date"
                    value={endsAt}
                    onChange={setEndsAt}
                    type="date"
                    autoComplete="off"
                  />
                )}
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Summary
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {title || "No title yet"}
              </Text>
              <Text as="p" variant="bodySm">
                {valueType[0] === "percentage"
                  ? `${value || "0"}% off`
                  : valueType[0] === "fixed_amount"
                    ? `$${value || "0"} off`
                    : "Free shipping"}
              </Text>
              {type === "code" && code && (
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  Code: {code}
                </Text>
              )}
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Usage limits
              </Text>
              <TextField
                label="Total usage limit"
                value={usageLimit}
                onChange={setUsageLimit}
                type="number"
                helpText="Leave blank for unlimited"
                autoComplete="off"
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
