# Layout & Spacing

## Contents

- Use BlockStack/InlineStack for spacing
- Use Box for padding and backgrounds
- Use token SpaceScale values
- Use Layout for two-column pages
- Use Layout.AnnotatedSection for settings
- Responsive props

---

## Use BlockStack/InlineStack for spacing

Never use raw divs with margins or custom flex wrappers.

**Incorrect:**

```tsx
<div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</div>
```

**Correct:**

```tsx
<BlockStack gap="400">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</BlockStack>
```

For horizontal layout:

**Incorrect:**

```tsx
<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

**Correct:**

```tsx
<InlineStack align="space-between" blockAlign="center">
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</InlineStack>
```

BlockStack props: `gap`, `align` ('start'|'center'|'end'|'space-between'|'space-around'|'space-evenly'), `inlineAlign` ('start'|'center'|'end'|'baseline'|'stretch'), `as` ('div'|'span'|'ul'|'ol'|'li'|'fieldset').

InlineStack props: `gap`, `align`, `blockAlign`, `wrap` (default true), `direction` ('row'|'row-reverse').

---

## Use Box for padding and backgrounds

Never use inline styles for padding, backgrounds, or borders.

**Incorrect:**

```tsx
<div style={{padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8}}>
  <Text>Content</Text>
</div>
```

**Correct:**

```tsx
<Box padding="400" background="bg-surface-secondary" borderRadius="200">
  <Text>Content</Text>
</Box>
```

Box accepts directional padding: `paddingBlock`, `paddingInline`, `paddingBlockStart`, `paddingBlockEnd`, `paddingInlineStart`, `paddingInlineEnd`.

---

## Use token SpaceScale values

All spacing values are string token references, not numbers or CSS units.

**Incorrect:**

```tsx
<BlockStack gap={16}>
<Box padding="16px">
<InlineStack gap="1rem">
```

**Correct:**

```tsx
<BlockStack gap="400">
<Box padding="400">
<InlineStack gap="300">
```

Valid SpaceScale: `'0'`, `'025'`, `'050'`, `'100'`, `'150'`, `'200'`, `'300'`, `'400'`, `'500'`, `'600'`, `'800'`, `'1000'`, `'1200'`, `'1600'`, `'2000'`, `'2400'`, `'2800'`, `'3200'`.

---

## Use Layout for two-column pages

**Incorrect:**

```tsx
<div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
  <Card>Main content</Card>
  <Card>Sidebar</Card>
</div>
```

**Correct:**

```tsx
<Layout>
  <Layout.Section>
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Main content</Text>
      </BlockStack>
    </Card>
  </Layout.Section>
  <Layout.Section variant="oneThird">
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Sidebar</Text>
      </BlockStack>
    </Card>
  </Layout.Section>
</Layout>
```

`Layout.Section` variants: `oneHalf`, `oneThird`, `fullWidth`.

---

## Use Layout.AnnotatedSection for settings

**Incorrect:**

```tsx
<div style={{display: 'grid', gridTemplateColumns: '1fr 2fr'}}>
  <div>
    <h3>Store details</h3>
    <p>Shopify and your customers will use this information.</p>
  </div>
  <Card>
    <TextField label="Store name" />
  </Card>
</div>
```

**Correct:**

```tsx
<Layout>
  <Layout.AnnotatedSection
    title="Store details"
    description="Shopify and your customers will use this information."
  >
    <Card>
      <FormLayout>
        <TextField label="Store name" value={name} onChange={setName} />
      </FormLayout>
    </Card>
  </Layout.AnnotatedSection>
</Layout>
```

---

## Responsive props

Box, BlockStack, InlineStack, and Card accept responsive props using breakpoint objects:

```tsx
<Box padding={{xs: '200', sm: '400', lg: '600'}}>
<Card padding={{xs: '400', sm: '500'}}>
<BlockStack gap={{xs: '200', md: '400'}}>
```

Breakpoints: `xs` (0px), `sm` (490px), `md` (768px), `lg` (1040px), `xl` (1440px).
