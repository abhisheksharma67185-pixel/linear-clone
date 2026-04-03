"use client";

import { Page, Layout, Card, FormLayout, TextField, Select, Banner } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import type { StoreSettings } from "../../lib/mock-data";

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{
    tone: "success" | "critical";
    message: string;
  } | null>(null);

  // Form fields
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("");
  const [timezone, setTimezone] = useState("");
  const [weightUnit, setWeightUnit] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    fetch("/api/data/settings")
      .then((r) => r.json())
      .then((data: StoreSettings) => {
        setSettings(data);
        setStoreName(data.storeName);
        setEmail(data.email);
        setPhone(data.phone);
        setCurrency(data.currency);
        setTimezone(data.timezone);
        setWeightUnit(data.weightUnit);
        setAddress1(data.address.address1);
        setCity(data.address.city);
        setProvince(data.address.province);
        setCountry(data.address.country);
        setZip(data.address.zip);
      });
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setBanner(null);

    const body = {
      storeName,
      email,
      phone,
      currency,
      timezone,
      weightUnit,
      address: {
        firstName: "Store",
        lastName: "Admin",
        address1,
        city,
        province,
        country,
        zip,
      },
    };

    const res = await fetch("/api/data/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      setSettings(data);
      setBanner({ tone: "success", message: "Settings saved" });
    } else {
      setBanner({ tone: "critical", message: "Failed to save settings" });
    }
    setSaving(false);
  }, [
    storeName,
    email,
    phone,
    currency,
    timezone,
    weightUnit,
    address1,
    city,
    province,
    country,
    zip,
  ]);

  if (!settings) return null;

  return (
    <Page
      title="Settings"
      primaryAction={{
        content: "Save",
        loading: saving,
        onAction: handleSave,
      }}
    >
      {banner && (
        <div style={{ marginBottom: 16 }}>
          <Banner tone={banner.tone} onDismiss={() => setBanner(null)}>
            {banner.message}
          </Banner>
        </div>
      )}

      <Layout>
        <Layout.AnnotatedSection
          title="Store details"
          description="Your store name and contact information"
        >
          <Card>
            <FormLayout>
              <TextField
                label="Store name"
                value={storeName}
                onChange={setStoreName}
                autoComplete="off"
              />
              <TextField
                label="Store contact email"
                value={email}
                onChange={setEmail}
                type="email"
                autoComplete="off"
              />
              <TextField label="Store phone" value={phone} onChange={setPhone} autoComplete="off" />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Store address"
          description="This address will appear on your invoices"
        >
          <Card>
            <FormLayout>
              <TextField
                label="Address"
                value={address1}
                onChange={setAddress1}
                autoComplete="off"
              />
              <FormLayout.Group>
                <TextField label="City" value={city} onChange={setCity} autoComplete="off" />
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
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Standards and formats"
          description="Currency, weight units, and timezone"
        >
          <Card>
            <FormLayout>
              <Select
                label="Currency"
                options={[
                  { label: "US Dollar (USD)", value: "USD" },
                  { label: "Canadian Dollar (CAD)", value: "CAD" },
                  { label: "British Pound (GBP)", value: "GBP" },
                  { label: "Euro (EUR)", value: "EUR" },
                ]}
                value={currency}
                onChange={setCurrency}
              />
              <Select
                label="Weight unit"
                options={[
                  { label: "Pounds (lb)", value: "lb" },
                  { label: "Kilograms (kg)", value: "kg" },
                ]}
                value={weightUnit}
                onChange={setWeightUnit}
              />
              <Select
                label="Timezone"
                options={[
                  { label: "Eastern Time (US)", value: "America/New_York" },
                  { label: "Central Time (US)", value: "America/Chicago" },
                  { label: "Pacific Time (US)", value: "America/Los_Angeles" },
                  { label: "UTC", value: "UTC" },
                ]}
                value={timezone}
                onChange={setTimezone}
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}
