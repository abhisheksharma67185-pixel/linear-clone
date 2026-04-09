# Icons

## Contents

- Import from @shopify/polaris-icons
- Pass as component reference
- Standalone icons use Icon component
- Don't size icons manually

---

## Import from @shopify/polaris-icons

All icons come from the `@shopify/polaris-icons` package. Never use raw SVGs or other icon libraries.

**Incorrect:**

```tsx
import { FaPlus } from 'react-icons/fa';
<Button><FaPlus /> Add</Button>
```

**Correct:**

```tsx
import {PlusIcon} from '@shopify/polaris-icons';
<Button icon={PlusIcon}>Add</Button>
```

Common icons: `PlusIcon`, `DeleteIcon`, `EditIcon`, `SearchIcon`, `ChevronDownIcon`, `ChevronUpIcon`, `ExportIcon`, `ImportIcon`, `ViewIcon`, `HideIcon`, `RefreshIcon`, `SettingsIcon`, `HomeIcon`, `OrderIcon`, `ProductIcon`, `CustomerIcon`.

---

## Pass as component reference

Icons are passed as references, not rendered JSX elements.

The `icon` prop accepts both `IconSource` (component reference) and `React.ReactElement` (JSX):

```tsx
// Both are valid:
<Button icon={PlusIcon}>Add</Button>
<Button icon={<PlusIcon />}>Add</Button>
```

**Incorrect** — don't manually size icons:

```tsx
<Button icon={<PlusIcon width={16} height={16} />}>Add</Button>
```

---

## Standalone icons use Icon component

For icons outside of Button, use the `Icon` component.

**Incorrect:**

```tsx
<PlusIcon style={{width: 20, height: 20, color: '#666'}} />
```

**Correct:**

```tsx
<Icon source={SearchIcon} tone="subdued" />
<Icon source={CheckIcon} tone="success" />
<Icon source={AlertCircleIcon} tone="critical" />
```

Icon tones: `'base'`, `'inherit'`, `'subdued'`, `'caution'`, `'warning'`, `'critical'`, `'interactive'`, `'info'`, `'success'`, `'primary'`, `'emphasis'`, `'magic'`, `'text-inverse'`, `'textCaution'`, `'textWarning'`, `'textCritical'`, `'textInfo'`, `'textSuccess'`, `'textPrimary'`, `'textMagic'`.

---

## Don't size icons manually

Polaris components handle icon sizing. Never add size classes or inline styles.

**Incorrect:**

```tsx
<Icon source={PlusIcon} style={{width: 16, height: 16}} />
<Button icon={PlusIcon} className="icon-sm">Add</Button>
```

**Correct:**

```tsx
<Icon source={PlusIcon} />
<Button icon={PlusIcon}>Add</Button>
```

The Icon component and Button handle sizing automatically based on context.
