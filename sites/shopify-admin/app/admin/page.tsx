"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Button,
  InlineGrid,
  Divider,
  TextField,
  Link,
} from "@shopify/polaris";
import { EditIcon, PlusIcon, ArrowUpIcon, XIcon } from "@shopify/polaris-icons";
import { useState } from "react";

function SetupCard({
  title,
  description,
  actionLabel,
  secondaryActionLabel,
  linkText,
}: {
  title: string;
  description: string;
  actionLabel: string;
  secondaryActionLabel?: string;
  linkText?: string;
}) {
  return (
    <Card padding="0">
      <Box
        background="bg-surface-secondary"
        minHeight="200px"
        padding="800"
        borderRadius="300"
      />
      <Box padding="400">
        <BlockStack gap="300">
          <Text as="h3" variant="headingSm" fontWeight="semibold">
            {title}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {description}
            {linkText && (
              <>
                {" "}
                <Link>{linkText}</Link>
              </>
            )}
          </Text>
          <InlineStack gap="300">
            <Button>{actionLabel}</Button>
            {secondaryActionLabel && (
              <Button variant="plain">{secondaryActionLabel}</Button>
            )}
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}

function SmallSetupCard({
  title,
  actionLabel,
  badge,
  children,
}: {
  title: string;
  actionLabel: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card padding="400">
      <BlockStack gap="300">
        <InlineStack gap="200" blockAlign="center">
          <Text as="h3" variant="headingSm" fontWeight="semibold">
            {title}
          </Text>
          {badge && (
            <Box
              background="bg-surface-secondary"
              borderRadius="200"
              padding="100"
              paddingInlineStart="200"
              paddingInlineEnd="200"
            >
              <Text as="span" variant="bodySm" tone="subdued">
                {badge}
              </Text>
            </Box>
          )}
        </InlineStack>
        {children}
        <div>
          <Button size="slim">{actionLabel}</Button>
        </div>
      </BlockStack>
    </Card>
  );
}

export default function AdminDashboard() {
  const [askValue, setAskValue] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  return (
    <Page>
      <BlockStack gap="400">
        {/* Promotional banner */}
        {showBanner && (
          <Box
            background="bg-fill-inverse"
            padding="300"
            paddingInlineStart="400"
            paddingInlineEnd="400"
            borderRadius="300"
          >
            <InlineStack align="space-between" blockAlign="center">
              <Text as="span" variant="bodySm" tone="text-inverse">
                Get 3 months for $1/month
              </Text>
              <InlineStack gap="200" blockAlign="center">
                <Button
                  size="slim"
                  onClick={() => {}}
                >
                  Select a plan
                </Button>
                <Button
                  variant="plain"
                  icon={XIcon}
                  accessibilityLabel="Dismiss"
                  onClick={() => setShowBanner(false)}
                />
              </InlineStack>
            </InlineStack>
          </Box>
        )}

        {/* Greeting */}
        <Text as="h1" variant="headingLg">
          Hey there, let&apos;s get started.
        </Text>

        {/* Ask anything input */}
        <Card>
          <BlockStack gap="200">
            <TextField
              label=""
              labelHidden
              placeholder="Ask anything..."
              value={askValue}
              onChange={setAskValue}
              autoComplete="off"
              connectedRight={
                <InlineStack gap="100">
                  <Button
                    icon={PlusIcon}
                    variant="tertiary"
                    accessibilityLabel="Add"
                  />
                  <Button
                    icon={ArrowUpIcon}
                    variant="tertiary"
                    accessibilityLabel="Submit"
                  />
                </InlineStack>
              }
            />
          </BlockStack>
        </Card>

        {/* Store name */}
        <Card>
          <InlineStack gap="200" align="start" blockAlign="center">
            <Text as="h2" variant="headingMd">
              Add store name
            </Text>
            <Button
              variant="plain"
              icon={EditIcon}
              accessibilityLabel="Edit store name"
            />
          </InlineStack>
        </Card>

        {/* Main setup cards */}
        <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
          <SetupCard
            title="Add your first product"
            description="Start by adding a product and a few key details. Not ready?"
            linkText="Start with a sample product"
            actionLabel="Add product"
            secondaryActionLabel="Import"
          />
          <SetupCard
            title="Customize your online store"
            description="Choose or generate a custom theme, then add your logo, colors, and images."
            actionLabel="Customize theme"
          />
        </InlineGrid>

        {/* Smaller setup cards */}
        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          <SmallSetupCard title="Set up a payment provider" actionLabel="Activate">
            <InlineStack gap="200">
              {/* Payment provider logos placeholder */}
              <Box
                background="bg-surface-secondary"
                borderRadius="100"
                padding="200"
                paddingInlineStart="300"
                paddingInlineEnd="300"
              >
                <Text as="span" variant="bodySm" tone="subdued">
                  PayPal
                </Text>
              </Box>
              <Box
                background="bg-surface-secondary"
                borderRadius="100"
                padding="200"
                paddingInlineStart="300"
                paddingInlineEnd="300"
              >
                <Text as="span" variant="bodySm" tone="subdued">
                  Visa
                </Text>
              </Box>
              <Box
                background="bg-surface-secondary"
                borderRadius="100"
                padding="200"
                paddingInlineStart="300"
                paddingInlineEnd="300"
              >
                <Text as="span" variant="bodySm" tone="subdued">
                  MC
                </Text>
              </Box>
            </InlineStack>
          </SmallSetupCard>

          <SmallSetupCard title="Review your shipping rates" actionLabel="Review">
            <Box
              background="bg-surface-secondary"
              borderRadius="100"
              padding="200"
              maxWidth="40px"
            >
              <Text as="span" variant="bodySm" alignment="center">
                🇺🇸
              </Text>
            </Box>
          </SmallSetupCard>

          <SmallSetupCard
            title="Customize domain"
            badge="Get $20"
            actionLabel="Customize"
          >
            <Box
              background="bg-surface-secondary"
              borderRadius="200"
              padding="200"
              paddingInlineStart="300"
              paddingInlineEnd="300"
            >
              <Text as="span" variant="bodySm" tone="subdued">
                mystore.myshopify.com
              </Text>
            </Box>
          </SmallSetupCard>
        </InlineGrid>

        {/* Motivational footer */}
        <Divider />
        <Box paddingBlock="200">
          <InlineStack align="center" gap="200">
            <Text as="p" variant="bodySm" tone="subdued">
              Every 24 seconds a merchant makes their first sale
            </Text>
          </InlineStack>
        </Box>
      </BlockStack>
    </Page>
  );
}
