# Component Composition

## Contents

- Card has no title or sectioned in v13
- Legacy components are deprecated
- Modal requires title
- Toast must be inside Frame
- IndexTable.Row needs position
- Use Popover + ActionList for menus
- Use Banner for status messages
- Use EmptyState for empty views
- Use Skeleton components for loading

---

## Card has no title or sectioned in v13

Card is a plain container. Compose structure with BlockStack, Text, and Divider.

**Incorrect:**

```tsx
<Card title="Products" sectioned>
  <p>Your product list</p>
</Card>
```

**Correct:**

```tsx
<Card>
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Products</Text>
    <Text tone="subdued">Your product list</Text>
  </BlockStack>
</Card>
```

For multiple sections, use Divider:

```tsx
<Card>
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Details</Text>
    <TextField label="Name" value={name} onChange={setName} />
  </BlockStack>
  <Divider />
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Pricing</Text>
    <TextField label="Price" value={price} onChange={setPrice} type="currency" prefix="$" />
  </BlockStack>
</Card>
```

Card props: `background` (ColorBackgroundAlias, default `'bg-surface'`), `padding` (SpaceScale or responsive, default `{xs: '400'}`), `roundedAbove` (BreakpointsAlias, default `'sm'`).

---

## Legacy components are deprecated

| Deprecated | Use Instead |
|-----------|-------------|
| `LegacyCard` | `Card` + `BlockStack` |
| `LegacyStack` | `BlockStack` / `InlineStack` |
| `LegacyTabs` | `Tabs` |
| `TextContainer` | `BlockStack` |
| `Stack` | `BlockStack` / `InlineStack` |

---

## Modal requires title

`title` is a required prop on Modal.

**Incorrect:**

```tsx
<Modal open={active} onClose={handleClose}>
  <Modal.Section>
    <Text>Are you sure?</Text>
  </Modal.Section>
</Modal>
```

**Correct:**

```tsx
<Modal
  open={active}
  onClose={handleClose}
  title="Delete product?"
  primaryAction={{content: 'Delete', destructive: true, onAction: handleDelete}}
  secondaryActions={[{content: 'Cancel', onAction: handleClose}]}
>
  <Modal.Section>
    <Text>This action cannot be undone.</Text>
  </Modal.Section>
</Modal>
```

Modal has a `sectioned` shorthand — when `true`, wraps children in `Modal.Section` automatically:

```tsx
<Modal open={active} onClose={handleClose} title="Confirm" sectioned>
  <Text>This action cannot be undone.</Text>
</Modal>
```

Modal sizes: `'small'`, `'large'`, `'fullScreen'`.

---

## Toast must be inside Frame

Toast uses Frame's internal toast manager. Rendering outside Frame will silently fail.

**Incorrect:**

```tsx
function MyPage() {
  return (
    <Page title="Settings">
      <Toast content="Saved" onDismiss={() => {}} />
    </Page>
  );
}
```

**Correct:**

```tsx
function App() {
  const [toastActive, setToastActive] = useState(false);
  const toastMarkup = toastActive ? (
    <Toast content="Saved" onDismiss={() => setToastActive(false)} duration={3000} />
  ) : null;

  return (
    <Frame>
      <Page title="Settings">{/* content */}</Page>
      {toastMarkup}
    </Frame>
  );
}
```

---

## IndexTable.Row needs position

Always pass `position` (the array index) to IndexTable.Row.

**Incorrect:**

```tsx
{items.map((item) => (
  <IndexTable.Row id={item.id} key={item.id}>
    <IndexTable.Cell>{item.name}</IndexTable.Cell>
  </IndexTable.Row>
))}
```

**Correct:**

```tsx
{items.map((item, index) => (
  <IndexTable.Row id={item.id} key={item.id} position={index} selected={selectedResources.includes(item.id)}>
    <IndexTable.Cell>{item.name}</IndexTable.Cell>
  </IndexTable.Row>
))}
```

---

## Use Popover + ActionList for menus

Never build custom dropdown menus.

**Correct:**

```tsx
const [active, setActive] = useState(false);
const activator = <Button onClick={() => setActive(true)} disclosure>More</Button>;

<Popover active={active} activator={activator} onClose={() => setActive(false)}>
  <ActionList
    items={[
      {content: 'Edit', onAction: handleEdit},
      {content: 'Duplicate', onAction: handleDuplicate},
      {content: 'Delete', destructive: true, onAction: handleDelete},
    ]}
  />
</Popover>
```

For grouped actions, use `sections`:

```tsx
<ActionList
  sections={[
    {title: 'Actions', items: [{content: 'Edit'}, {content: 'Duplicate'}]},
    {title: 'Destructive', items: [{content: 'Delete', destructive: true}]},
  ]}
/>
```

---

## Use Banner for status messages

**Incorrect:**

```tsx
<div className="success-banner" style={{background: '#e6f9e6', padding: 16, borderRadius: 8}}>
  <p style={{color: 'green'}}>Product saved successfully!</p>
</div>
```

**Correct:**

```tsx
<Banner
  title="Product saved"
  tone="success"
  onDismiss={() => setBannerVisible(false)}
>
  <p>Your changes have been saved.</p>
</Banner>
```

Banner tones: `'success'`, `'info'`, `'warning'`, `'critical'`.

---

## Use EmptyState for empty views

**Incorrect:**

```tsx
<div style={{textAlign: 'center', padding: 40}}>
  <h3>No products yet</h3>
  <p>Add your first product to get started.</p>
  <button>Add product</button>
</div>
```

**Correct:**

```tsx
<Card>
  <EmptyState
    heading="No products yet"
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    action={{content: 'Add product', onAction: handleAdd}}
  >
    <p>Add your first product to get started.</p>
  </EmptyState>
</Card>
```

---

## Use Skeleton components for loading

**Incorrect:**

```tsx
if (loading) return <div className="spinner">Loading...</div>;
```

**Correct:**

```tsx
if (loading) {
  return (
    <SkeletonPage title="Products" primaryAction>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <SkeletonBodyText lines={3} />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
```

Skeleton components: `SkeletonPage`, `SkeletonBodyText`, `SkeletonDisplayText`, `SkeletonThumbnail`, `SkeletonTabs`.
