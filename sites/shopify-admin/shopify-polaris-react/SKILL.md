---
name: shopify-polaris-react
description: Shopify Polaris React expert guidance — component API, layout system, form patterns, data tables, modals, navigation, theming, and admin app design. Use when building embedded Shopify admin apps with @shopify/polaris, composing admin UI, designing CRUD flows, or troubleshooting Polaris component issues. Triggers on @shopify/polaris imports, Polaris component usage (<Page>, <Card>, <IndexTable>), or polaris.shopify.com references.
user-invocable: false
---

# Shopify Polaris React (`@shopify/polaris` v13.x)

The component library for building embedded Shopify admin applications. Components are imported from `@shopify/polaris` and require `AppProvider` at the root. Polaris handles all styling internally via CSS modules and design tokens — you compose layouts with layout components, not CSS classes.

**Do NOT confuse with Polaris Web Components** (`s-*` elements for App Home). This skill covers the React library only.

## Principles

1. **Use Polaris components, not HTML.** Never use raw `<div>`, `<h1>`, `<button>`, `<table>` when a Polaris component exists.
2. **Use token values, not CSS.** Spacing, colors, and radii use `@shopify/polaris-tokens` values (`'400'`, `'bg-surface'`), never raw CSS or Tailwind.
3. **Compose with layout components.** Use `BlockStack`, `InlineStack`, `Box` for spacing — never inline styles or margin hacks.
4. **Use `Page` as the top-level wrapper.** Every admin view starts with `<Page>` with `title`, `primaryAction`, `backAction`.
5. **Card is a plain container.** v13 Card has no `title` or `sectioned` — compose structure with `BlockStack` + `Text` + `Divider`.

## Critical Rules

These rules are **always enforced**. Each links to a file with Incorrect/Correct code pairs.

### Layout & Spacing → [layout.md](./rules/layout.md)

- **Use `BlockStack`/`InlineStack` for spacing.** Never `<div style={{marginTop: 16}}>` or custom flex wrappers.
- **Use `Box` for padding and backgrounds.** Never inline `style={{padding: ...}}`.
- **Use token SpaceScale values.** `gap="400"` not `gap="16px"`. Valid: `'050'`–`'3200'`.
- **Use `Layout` for two-column pages.** `Layout.Section variant="oneThird"` for sidebars.
- **Use `Layout.AnnotatedSection` for settings.** Title + description on the left, Card on the right.

### Typography → [typography.md](./rules/typography.md)

- **Use `Text`, not raw HTML headings.** `<Text variant="headingLg" as="h2">` not `<h2>`.
- **Use `variant` for sizing.** `headingXs`–`heading3xl`, `bodyXs`–`bodyLg`.
- **Use `tone` for color.** `subdued`, `critical`, `success`, `caution` — never raw color classes.
- **Use `fontWeight` for emphasis.** `regular`, `medium`, `semibold`, `bold`.

### Forms & Inputs → [forms.md](./rules/forms.md)

- **Use `Form` + `FormLayout` for form structure.** Never raw `<form>` with manual spacing.
- **Use `FormLayout.Group` for inline fields.** `condensed` for tight groups like city/state/zip.
- **`TextField` onChange is `(value, id)`.** Not an event — `onChange={(val) => setName(val)}`.
- **`Select` onChange is `(value, id)`.** Same pattern — not event-based.
- **Use `ChoiceList` for radio/checkbox groups.** Not manual `RadioButton` loops.
- **Use `error` prop for validation.** `<TextField error="Required" />` not custom error divs.

### Component Structure → [composition.md](./rules/composition.md)

- **Card has NO `title` or `sectioned` in v13.** Use `BlockStack` + `Text` inside Card.
- **LegacyCard is deprecated.** Always use `Card` + `BlockStack`.
- **LegacyStack is deprecated.** Use `BlockStack` / `InlineStack`.
- **LegacyTabs is deprecated.** Use `Tabs`.
- **Modal requires `title`.** It's a required prop, not optional.
- **Toast must be inside `Frame`.** It uses Frame's toast manager.
- **IndexTable.Row needs `position`.** Pass the array index.
- **Use `Popover` + `ActionList` for dropdown menus.** Not custom dropdowns.
- **Use `Banner` for status messages.** Not custom alert divs.
- **Use `EmptyState` for empty views.** Not custom placeholder markup.
- **Use `SkeletonPage` / `SkeletonBodyText` for loading.** Not custom spinners.

### Button → [button.md](./rules/button.md)

- **`variant` controls visual style.** `'primary'` | `'secondary'` | `'tertiary'` | `'plain'` | `'monochromePlain'`.
- **`tone` controls color meaning.** `'critical'` | `'success'` — combine with any variant.
- **Destructive = `variant="primary" tone="critical"`.** Not `variant="destructive"` (doesn't exist).
- **`size` options.** `'micro'` | `'slim'` | `'medium'` | `'large'`.
- **Icons use `icon` prop.** `icon={PlusIcon}` from `@shopify/polaris-icons`, not children. Also accepts `icon={<PlusIcon />}`.
- **No `isLoading` prop.** Use `loading` (boolean).
- **Link button uses `url` prop.** `<Button url="/path">` not wrapping in `<a>`.
- **`disclosure` shows a caret.** `disclosure="down"` | `"up"` | `"select"` | `true`.
- **`fullWidth` stretches to container.** Boolean prop.
- **`accessibilityLabel` for icon-only buttons.** Required when no text children.

### Icons → [icons.md](./rules/icons.md)

- **Import from `@shopify/polaris-icons`.** `import {PlusIcon} from '@shopify/polaris-icons'`.
- **Pass as component reference.** `icon={PlusIcon}` not `icon={<PlusIcon />}`.
- **Standalone icons use `Icon` component.** `<Icon source={SearchIcon} tone="subdued" />`.
- **Don't size icons manually.** Components handle icon sizing.

## Key Patterns

```tsx
// Layout: BlockStack, not divs with margins.
<BlockStack gap="400">           // ✓ correct
  <Text variant="headingMd" as="h2">Title</Text>
  <Text>Description</Text>
</BlockStack>
<div style={{marginBottom: 16}}>  // ✗ wrong
  <h2>Title</h2>
  <p>Description</p>
</div>

// Card structure: compose with BlockStack + Text.
<Card>                           // ✓ correct (v13)
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Orders</Text>
    <Text tone="subdued">Recent order activity</Text>
  </BlockStack>
</Card>
<Card title="Orders" sectioned>  // ✗ wrong (v13 has no title/sectioned)
  <p>Recent order activity</p>
</Card>

// Button: variant + tone, not "destructive" variant.
<Button variant="primary" tone="critical" onClick={handleDelete}>  // ✓ correct
  Delete
</Button>
<Button variant="destructive" onClick={handleDelete}>             // ✗ wrong

// Form: Form + FormLayout, not raw form.
<Form onSubmit={handleSubmit}>    // ✓ correct
  <FormLayout>
    <TextField label="Name" value={name} onChange={setName} />
    <Button submit variant="primary">Save</Button>
  </FormLayout>
</Form>
<form onSubmit={handleSubmit}>    // ✗ wrong
  <div className="field">
    <label>Name</label>
    <input value={name} onChange={(e) => setName(e.target.value)} />
  </div>
</form>

// TextField: onChange is (value, id), not event.
<TextField label="Email" onChange={(value) => setEmail(value)} />  // ✓ correct
<TextField label="Email" onChange={(e) => setEmail(e.target.value)} />  // ✗ wrong

// Token spacing: string values, not numbers.
<BlockStack gap="400">  // ✓ correct
<BlockStack gap={16}>   // ✗ wrong
<Box padding="400">     // ✓ correct
<Box padding="16px">    // ✗ wrong

// Status messages: Banner, not custom divs.
<Banner tone="success" title="Saved">  // ✓ correct
  <p>Changes saved successfully.</p>
</Banner>
<div className="success-alert">        // ✗ wrong
  <p>Changes saved successfully.</p>
</div>

// Data tables: IndexTable, not raw tables.
<IndexTable                     // ✓ correct
  headings={[{title: 'Name'}]}
  itemCount={items.length}
>
  {items.map((item, i) => (
    <IndexTable.Row id={item.id} position={i}>
      <IndexTable.Cell>{item.name}</IndexTable.Cell>
    </IndexTable.Row>
  ))}
</IndexTable>
<table>                         // ✗ wrong
  <thead><tr><th>Name</th></tr></thead>
  <tbody>{items.map(...)}</tbody>
</table>
```

## Component Selection

| Need | Use |
|------|-----|
| Page wrapper with title/actions | `Page` |
| Content container | `Card` (plain, compose with BlockStack) |
| Two-column layout | `Layout` + `Layout.Section variant="oneThird"` |
| Settings layout | `Layout.AnnotatedSection` |
| Vertical spacing | `BlockStack` with `gap` |
| Horizontal spacing | `InlineStack` with `gap` |
| Generic container | `Box` with token padding/background |
| Responsive grid | `InlineGrid` / `Grid` |
| Text/headings | `Text` with `variant` and `as` |
| Actions | `Button` with `variant` and `tone` |
| Button groups | `ButtonGroup` |
| Text input | `TextField` |
| Dropdown | `Select` |
| Searchable dropdown | `Autocomplete` / `Combobox` |
| Checkbox/radio groups | `ChoiceList` |
| Boolean toggle | `Checkbox` (forms) / `SettingToggle` (settings) |
| Status indicator | `Badge` with `tone` and `progress` |
| Status message | `Banner` with `tone` |
| Modal dialog | `Modal` with `title`, `primaryAction` |
| Dropdown menu | `Popover` + `ActionList` |
| Data table with selection | `IndexTable` |
| Simple data table | `DataTable` |
| Object list with actions | `ResourceList` + `ResourceItem` |
| Tab navigation | `Tabs` |
| Brief notification | `Toast` (inside `Frame`) |
| App shell | `Frame` + `Navigation` + `TopBar` |
| Filtering | `IndexFilters` / `Filters` |
| Empty view | `EmptyState` |
| Loading skeleton | `SkeletonPage` + `SkeletonBodyText` |
| Loading spinner | `Spinner` |
| Progress indicator | `ProgressBar` |
| Divider | `Divider` |
| Expandable content | `Collapsible` |
| Color picker | `ColorPicker` |
| Date picker | `DatePicker` |
| File upload | `DropZone` |
| Thumbnail image | `Thumbnail` |
| User avatar | `Avatar` |
| Pagination | `Pagination` |
| Breadcrumbs | `Page backAction` (not a standalone component in v13) |
| Tooltip | `Tooltip` |
| Inline link | `Link` |
| Bulleted/numbered list | `List` + `List.Item` |
| Autocomplete list | `Listbox` |
| Label tag/chip | `Tag` |
| Inline code snippet | `InlineCode` |
| Unsaved changes bar | `ContextualSaveBar` (inside `Frame`) |
| Bottom-of-page actions | `PageActions` |
| Connect external account | `AccountConnection` |
| Promotional card | `CalloutCard` |
| Term/description pairs | `DescriptionList` |
| Help link at page bottom | `FooterHelp` |
| Full-width top bar | `FullscreenBar` |
| Rich media card | `MediaCard` |
| Option list (non-form) | `OptionList` |
| Range/slider input | `RangeSlider` |
| Edge-to-edge bleed | `Bleed` |
| Empty search results | `EmptySearchResult` |

## Composition Recipes

### Settings Page (Annotated)

```tsx
<Page title="Settings" narrowWidth>
  <Layout>
    <Layout.AnnotatedSection title="Store details" description="Used on invoices.">
      <Card>
        <FormLayout>
          <TextField label="Store name" value={name} onChange={setName} />
          <TextField label="Email" type="email" value={email} onChange={setEmail} />
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  </Layout>
</Page>
```

### CRUD List Page

```tsx
<Page title="Products" primaryAction={{content: 'Add product', onAction: openCreate}}>
  <Card padding="0">
    <IndexTable
      resourceName={{singular: 'product', plural: 'products'}}
      headings={[{title: 'Product'}, {title: 'Status'}, {title: 'Inventory'}]}
      itemCount={products.length}
      selectedItemsCount={selected.length}
      onSelectionChange={handleSelection}
      bulkActions={[{content: 'Delete', destructive: true, onAction: handleBulkDelete}]}
    >
      {products.map((p, i) => (
        <IndexTable.Row id={p.id} key={p.id} position={i} selected={selected.includes(p.id)}>
          <IndexTable.Cell><Text fontWeight="bold">{p.title}</Text></IndexTable.Cell>
          <IndexTable.Cell><Badge tone={p.active ? 'success' : undefined}>{p.status}</Badge></IndexTable.Cell>
          <IndexTable.Cell>{p.inventory}</IndexTable.Cell>
        </IndexTable.Row>
      ))}
    </IndexTable>
  </Card>
</Page>
```

### Detail Page

```tsx
<Page
  title={product.title}
  backAction={{content: 'Products', url: '/products'}}
  primaryAction={{content: 'Save', onAction: handleSave, loading: saving}}
  secondaryActions={[{content: 'Delete', destructive: true, onAction: openDeleteModal}]}
>
  <Layout>
    <Layout.Section>
      <Card>
        <FormLayout>
          <TextField label="Title" value={title} onChange={setTitle} />
          <TextField label="Description" value={desc} onChange={setDesc} multiline={4} />
        </FormLayout>
      </Card>
    </Layout.Section>
    <Layout.Section variant="oneThird">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingSm" as="h3">Status</Text>
          <Select label="Status" options={statusOptions} value={status} onChange={setStatus} />
        </BlockStack>
      </Card>
    </Layout.Section>
  </Layout>
</Page>
```

### Dropdown Menu

```tsx
const [active, setActive] = useState(false);
const activator = <Button onClick={() => setActive(true)} disclosure>More actions</Button>;

<Popover active={active} activator={activator} onClose={() => setActive(false)}>
  <ActionList
    items={[
      {content: 'Edit', onAction: handleEdit},
      {content: 'Delete', destructive: true, onAction: handleDelete},
    ]}
  />
</Popover>
```

## Setup

### AppProvider (Required Root)

```tsx
import enTranslations from '@shopify/polaris/locales/en.json';
import {AppProvider} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

<AppProvider i18n={enTranslations}>
  {children}
</AppProvider>
```

- `i18n` is **required**
- Import the CSS — `@shopify/polaris/build/esm/styles.css`
- `linkComponent` for custom routing (Next.js, React Router)
- `theme` for `ThemeName` from `@shopify/polaris-tokens`

## Token System

Always use token values from `@shopify/polaris-tokens`, not raw CSS:

| Token | Values |
|-------|--------|
| SpaceScale | `'0'` `'025'` `'050'` `'100'` `'150'` `'200'` `'300'` `'400'` `'500'` `'600'` `'800'` `'1000'` `'1200'` `'1600'` `'2000'` `'2400'` `'2800'` `'3200'` |
| ColorBackground | `'bg-surface'` `'bg-surface-secondary'` `'bg-fill-brand'` `'bg-fill-critical'` etc. |
| BorderRadius | `'0'` `'050'` `'100'` `'150'` `'200'` `'300'` `'400'` `'500'` `'750'` `'full'` |
| Breakpoints | `'xs'` `'sm'` `'md'` `'lg'` `'xl'` |

Responsive props: `padding={{xs: '200', md: '400'}}`.

## Anti-Patterns

- Raw `<div>`, `<h1>`, `<button>`, `<table>`, `<form>` when Polaris components exist
- `LegacyCard`, `LegacyStack`, `LegacyTabs` in new code
- Card with `title` or `sectioned` props (removed in v13)
- `Button variant="destructive"` (use `tone="critical"`)
- Inline styles for spacing (`style={{margin: 16}}`)
- Raw CSS/Tailwind classes on Polaris components
- `onChange={(e) => setValue(e.target.value)}` on TextField/Select (not event-based)
- `<table>` for data — use IndexTable or DataTable
- Custom alert/success divs — use Banner
- Custom loading spinners — use Spinner/SkeletonPage
- Toast rendered outside Frame

## Detailed References

- [rules/layout.md](./rules/layout.md) — BlockStack, InlineStack, Box, Layout, Grid, token spacing
- [rules/typography.md](./rules/typography.md) — Text variants, tones, as prop, fontWeight
- [rules/forms.md](./rules/forms.md) — Form, FormLayout, TextField, Select, ChoiceList, validation
- [rules/composition.md](./rules/composition.md) — Card v13, Modal, Banner, EmptyState, Toast, Skeleton
- [rules/button.md](./rules/button.md) — variant, tone, size, icon, loading, url
- [rules/icons.md](./rules/icons.md) — @shopify/polaris-icons imports, Icon component, passing icons

## Official Documentation

- [Polaris Components](https://polaris.shopify.com/components)
- [Polaris Tokens](https://polaris.shopify.com/tokens)
- [Polaris Icons](https://polaris.shopify.com/icons)
- [GitHub: @shopify/polaris](https://github.com/Shopify/polaris)
