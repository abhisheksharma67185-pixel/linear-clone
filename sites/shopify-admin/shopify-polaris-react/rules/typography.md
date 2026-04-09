# Typography

## Contents

- Use Text component, not raw HTML
- Use variant for sizing
- Use tone for color
- Use fontWeight for emphasis
- Use as prop for semantics

---

## Use Text component, not raw HTML

Never use raw `<h1>`, `<h2>`, `<p>`, `<span>` for text.

**Incorrect:**

```tsx
<h2>Product details</h2>
<p style={{color: '#666'}}>Manage your product information.</p>
```

**Correct:**

```tsx
<Text variant="headingMd" as="h2">Product details</Text>
<Text tone="subdued">Manage your product information.</Text>
```

---

## Use variant for sizing

Variants control font size and line height. Always specify a variant.

| Variant | Use for |
|---------|---------|
| `heading3xl` | Page hero titles (deprecated, use `heading2xl`) |
| `heading2xl` | Major section headers |
| `headingXl` | Page titles |
| `headingLg` | Section titles |
| `headingMd` | Card titles |
| `headingSm` | Subsection titles |
| `headingXs` | Small labels |
| `bodyLg` | Emphasized body text |
| `bodyMd` | Default body text |
| `bodySm` | Secondary text, captions |
| `bodyXs` | Fine print, metadata |

---

## Use tone for color

Never use raw colors on text. Use the `tone` prop.

**Incorrect:**

```tsx
<Text style={{color: 'red'}}>Error occurred</Text>
<span className="text-gray-500">Optional field</span>
```

**Correct:**

```tsx
<Text tone="critical">Error occurred</Text>
<Text tone="subdued">Optional field</Text>
```

Available tones: `'base'`, `'disabled'`, `'inherit'`, `'success'`, `'critical'`, `'caution'`, `'subdued'`, `'text-inverse'`, `'text-inverse-secondary'`, `'magic'`, `'magic-subdued'`.

---

## Use fontWeight for emphasis

**Incorrect:**

```tsx
<Text variant="bodyMd"><strong>Important</strong></Text>
<span style={{fontWeight: 600}}>Key metric</span>
```

**Correct:**

```tsx
<Text variant="bodyMd" fontWeight="bold">Important</Text>
<Text variant="bodyMd" fontWeight="semibold">Key metric</Text>
```

Available weights: `'regular'`, `'medium'`, `'semibold'`, `'bold'`.

---

## Use as prop for semantics

The `as` prop controls the rendered HTML element. Match heading level to document hierarchy.

```tsx
<Text variant="headingLg" as="h1">Page Title</Text>
<Text variant="headingMd" as="h2">Section Title</Text>
<Text variant="headingSm" as="h3">Subsection</Text>
<Text variant="bodyMd" as="p">Body content</Text>
<Text variant="bodySm" as="span">Inline text</Text>
```

Valid elements: `'dt'`, `'dd'`, `'h1'`–`'h6'`, `'p'`, `'span'`, `'strong'`, `'legend'`.
