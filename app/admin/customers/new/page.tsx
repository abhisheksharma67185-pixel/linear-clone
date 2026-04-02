"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  FormLayout,
  TextField,
  Banner,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function NewCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");

    const body = {
      firstName,
      lastName,
      email,
      phone,
      address: { firstName, lastName, address1, city, province, country, zip },
      location: city && country ? `${city}, ${country}` : "",
      notes,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const res = await fetch("/api/data/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create customer");
      setSaving(false);
      return;
    }

    const saved = await res.json();
    router.push(`/admin/customers/${saved.id}`);
    setSaving(false);
  }, [
    firstName, lastName, email, phone,
    address1, city, province, country, zip,
    notes, tags, router,
  ]);

  return (
    <Page
      title="New customer"
      backAction={{
        content: "Customers",
        onAction: () => router.push("/admin/customers"),
      }}
      primaryAction={{
        content: "Save customer",
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
                Customer overview
              </Text>
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    label="First name"
                    value={firstName}
                    onChange={setFirstName}
                    autoComplete="off"
                  />
                  <TextField
                    label="Last name"
                    value={lastName}
                    onChange={setLastName}
                    autoComplete="off"
                  />
                </FormLayout.Group>
                <TextField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  autoComplete="off"
                />
                <TextField
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Address
              </Text>
              <FormLayout>
                <TextField
                  label="Address"
                  value={address1}
                  onChange={setAddress1}
                  autoComplete="off"
                />
                <FormLayout.Group>
                  <TextField
                    label="City"
                    value={city}
                    onChange={setCity}
                    autoComplete="off"
                  />
                  <TextField
                    label="State/Province"
                    value={province}
                    onChange={setProvince}
                    autoComplete="off"
                  />
                </FormLayout.Group>
                <FormLayout.Group>
                  <TextField
                    label="Country"
                    value={country}
                    onChange={setCountry}
                    autoComplete="off"
                  />
                  <TextField
                    label="ZIP/Postal code"
                    value={zip}
                    onChange={setZip}
                    autoComplete="off"
                  />
                </FormLayout.Group>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Notes
              </Text>
              <TextField
                label="Notes"
                labelHidden
                value={notes}
                onChange={setNotes}
                multiline={4}
                autoComplete="off"
              />
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Tags
              </Text>
              <TextField
                label="Tags"
                labelHidden
                value={tags}
                onChange={setTags}
                helpText="Comma-separated"
                autoComplete="off"
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
