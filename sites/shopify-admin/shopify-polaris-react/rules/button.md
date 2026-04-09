# Button

## Contents

- variant controls visual style
- tone controls color meaning
- Destructive buttons
- size options
- Icons use icon prop
- No isLoading — use loading
- Link buttons use url prop
- disclosure, fullWidth, textAlign
- accessibilityLabel for icon-only buttons

---

## variant controls visual style

| Variant | Use for |
|---------|---------|
| `'primary'` | Primary page action (Save, Create) |
| `'secondary'` | Default button (default if omitted) |
| `'tertiary'` | Low-emphasis actions |
| `'plain'` | Inline text-like actions |
| `'monochromePlain'` | Plain button that inherits parent color |

**Incorrect:**

```tsx
<button className="btn-primary">Save</button>
```

**Correct:**

```tsx
<Button variant="primary">Save</Button>
```

---

## tone controls color meaning

Tone adds semantic color to any variant.

```tsx
<Button tone="critical">Delete</Button>                    // subtle destructive
<Button variant="primary" tone="critical">Delete</Button>  // prominent destructive
<Button tone="success">Approve</Button>                    // success action
```

---

## Destructive buttons

There is NO `variant="destructive"`. Use `tone="critical"`.

**Incorrect:**

```tsx
<Button variant="destructive">Delete</Button>
<Button color="red">Delete</Button>
```

**Correct:**

```tsx
<Button variant="primary" tone="critical">Delete</Button>  // prominent destructive
<Button tone="critical">Delete</Button>                     // subtle destructive
```

In action objects (Modal, Page, etc.), use `destructive: true`:

```tsx
<Modal
  primaryAction={{content: 'Delete', destructive: true, onAction: handleDelete}}
/>
<Page
  secondaryActions={[{content: 'Delete', destructive: true, onAction: handleDelete}]}
/>
```

---

## size options

| Size | Use for |
|------|---------|
| `'micro'` | Compact UI, inline actions |
| `'slim'` | Secondary actions in tight spaces |
| `'medium'` | Default (omit size prop) |
| `'large'` | Prominent standalone actions |

---

## Icons use icon prop

Pass icon components from `@shopify/polaris-icons` via the `icon` prop.

**Incorrect:**

```tsx
import {PlusIcon} from '@shopify/polaris-icons';
<Button><PlusIcon /> Add product</Button>
```

**Correct:**

```tsx
import {PlusIcon} from '@shopify/polaris-icons';
<Button icon={PlusIcon}>Add product</Button>
// Also valid — icon accepts React.ReactElement | IconSource:
<Button icon={<PlusIcon />}>Add product</Button>
```

Icon-only button (requires `accessibilityLabel`):

```tsx
<Button icon={DeleteIcon} accessibilityLabel="Delete" />
```

---

## No isLoading — use loading

**Incorrect:**

```tsx
<Button isLoading={saving}>Save</Button>
<Button isPending={saving}>Save</Button>
```

**Correct:**

```tsx
<Button variant="primary" loading={saving} onClick={handleSave}>Save</Button>
```

The `loading` prop replaces button text with a spinner and disables the button.

---

## Link buttons use url prop

For navigation, use `url` instead of wrapping in `<a>` or `<Link>`.

**Incorrect:**

```tsx
<a href="/products"><Button>View products</Button></a>
<Link to="/products"><Button>View products</Button></Link>
```

**Correct:**

```tsx
<Button url="/products">View products</Button>
<Button url="https://shopify.dev" external>Documentation</Button>
```

Use `external` for links that open in a new tab. Use `target` for specific window targeting.

---

## disclosure, fullWidth, textAlign

**`disclosure`** adds a caret icon. Values: `'down'` | `'up'` | `'select'` | `true` (defaults to down).

```tsx
<Button disclosure>More actions</Button>
<Button disclosure="up">Show less</Button>
<Button disclosure="select">Choose option</Button>
```

**`fullWidth`** stretches the button to fill its container:

```tsx
<Button variant="primary" fullWidth>Continue</Button>
```

**`textAlign`** controls text alignment: `'left'` | `'right'` | `'center'` | `'start'` | `'end'`.

```tsx
<Button textAlign="left" fullWidth>Left-aligned action</Button>
```

---

## accessibilityLabel for icon-only buttons

Icon-only buttons **must** have `accessibilityLabel` since there's no visible text.

**Incorrect:**

```tsx
<Button icon={DeleteIcon} />
```

**Correct:**

```tsx
<Button icon={DeleteIcon} accessibilityLabel="Delete product" />
```

Also use for buttons where the visible text is ambiguous:

```tsx
<Button icon={ExportIcon} accessibilityLabel="Export orders as CSV">Export</Button>
```
