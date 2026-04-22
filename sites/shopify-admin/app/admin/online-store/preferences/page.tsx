"use client";

import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  BlockStack,
  Text,
  Banner,
  Box,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

export default function PreferencesPage() {
  const [title, setTitle] = useState("My Store");
  const [metaDescription, setMetaDescription] = useState("");
  const [gaAccount, setGaAccount] = useState("");
  const [fbPixel, setFbPixel] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setShowBanner(false);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    setShowBanner(true);
  }, []);

  return (
    <Page
      title="Preferences"
      primaryAction={{ content: "Save", loading: saving, onAction: handleSave }}
    >
      {showBanner && (
        <Box paddingBlockEnd="400">
          <Banner tone="success" onDismiss={() => setShowBanner(false)}>
            Preferences saved successfully.
          </Banner>
        </Box>
      )}
      <Layout>
        <Layout.AnnotatedSection
          title="Title and meta description"
          description="The title and meta description help define how your store shows up on search engines."
        >
          <Card>
            <FormLayout>
              <TextField
                label="Homepage title"
                value={title}
                onChange={setTitle}
                autoComplete="off"
              />
              <TextField
                label="Homepage meta description"
                value={metaDescription}
                onChange={setMetaDescription}
                multiline={3}
                autoComplete="off"
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Social sharing image"
          description="When you share a link to your store on social media, an image is shown in the post."
        >
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodySm" tone="subdued">
                Add a social sharing image to display when your store is shared on social media.
              </Text>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Google Analytics"
          description="Google Analytics enables you to track the visitors to your store."
        >
          <Card>
            <FormLayout>
              <TextField
                label="Google Analytics account"
                value={gaAccount}
                onChange={setGaAccount}
                placeholder="UA-XXXXX-X"
                autoComplete="off"
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Facebook Pixel"
          description="Facebook Pixel helps you track conversions from Facebook ads."
        >
          <Card>
            <FormLayout>
              <TextField
                label="Facebook Pixel ID"
                value={fbPixel}
                onChange={setFbPixel}
                autoComplete="off"
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Password protection"
          description="Restrict access to visitors with the password."
        >
          <Card>
            <FormLayout>
              <TextField
                label="Password"
                value={password}
                onChange={setPassword}
                type="password"
                autoComplete="off"
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}
