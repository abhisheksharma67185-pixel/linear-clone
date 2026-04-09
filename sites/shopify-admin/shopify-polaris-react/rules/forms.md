# Forms & Inputs

## Contents

- Use Form + FormLayout
- FormLayout.Group for inline fields
- TextField onChange signature
- Select onChange signature
- ChoiceList for radio/checkbox groups
- Validation with error prop

---

## Use Form + FormLayout

Always wrap forms in `Form` + `FormLayout`, never raw `<form>` with manual spacing.

**Incorrect:**

```tsx
<form onSubmit={handleSubmit}>
  <div style={{marginBottom: 16}}>
    <label>Name</label>
    <input value={name} onChange={(e) => setName(e.target.value)} />
  </div>
  <div style={{marginBottom: 16}}>
    <label>Email</label>
    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  </div>
  <button type="submit">Save</button>
</form>
```

**Correct:**

```tsx
<Form onSubmit={handleSubmit}>
  <FormLayout>
    <TextField label="Name" value={name} onChange={setName} autoComplete="name" />
    <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
    <Button submit variant="primary">Save</Button>
  </FormLayout>
</Form>
```

---

## FormLayout.Group for inline fields

Use `FormLayout.Group` to place fields side by side. Use `condensed` for tight groups.

**Incorrect:**

```tsx
<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16}}>
  <TextField label="City" value={city} onChange={setCity} />
  <TextField label="State" value={state} onChange={setState} />
  <TextField label="Zip" value={zip} onChange={setZip} />
</div>
```

**Correct:**

```tsx
<FormLayout>
  <FormLayout.Group condensed>
    <TextField label="City" value={city} onChange={setCity} />
    <TextField label="State" value={state} onChange={setState} />
    <TextField label="Zip" value={zip} onChange={setZip} />
  </FormLayout.Group>
</FormLayout>
```

---

## TextField onChange signature

TextField's `onChange` receives `(value: string, id: string)`, NOT an event.

**Incorrect:**

```tsx
<TextField
  label="Name"
  onChange={(e) => setName(e.target.value)}
/>
```

**Correct:**

```tsx
<TextField
  label="Name"
  value={name}
  onChange={(value) => setName(value)}
/>
// or simply:
<TextField label="Name" value={name} onChange={setName} />
```

---

## Select onChange signature

Same as TextField — receives `(value: string, id: string)`.

**Incorrect:**

```tsx
<Select
  label="Country"
  options={countries}
  onChange={(e) => setCountry(e.target.value)}
/>
```

**Correct:**

```tsx
<Select
  label="Country"
  options={[
    {label: 'United States', value: 'US'},
    {label: 'Canada', value: 'CA'},
  ]}
  value={country}
  onChange={setCountry}
/>
```

---

## ChoiceList for radio/checkbox groups

Use `ChoiceList`, not manual `RadioButton` or `Checkbox` loops.

**Incorrect:**

```tsx
<BlockStack gap="200">
  <RadioButton label="Draft" checked={status === 'draft'} onChange={() => setStatus('draft')} />
  <RadioButton label="Active" checked={status === 'active'} onChange={() => setStatus('active')} />
</BlockStack>
```

**Correct:**

```tsx
<ChoiceList
  title="Status"
  choices={[
    {label: 'Draft', value: 'draft'},
    {label: 'Active', value: 'active'},
  ]}
  selected={[status]}
  onChange={(value) => setStatus(value[0])}
/>
```

For multiple selection, add `allowMultiple`:

```tsx
<ChoiceList title="Tags" choices={tagOptions} selected={tags} onChange={setTags} allowMultiple />
```

`onChange` signature is `(selected: string[], name: string)` — receives an array of selected values and the field name.

---

## Validation with error prop

Use the `error` prop on form controls. Never build custom error markup.

**Incorrect:**

```tsx
<TextField label="Email" value={email} onChange={setEmail} />
{emailError && <p style={{color: 'red'}}>{emailError}</p>}
```

**Correct:**

```tsx
<TextField
  label="Email"
  value={email}
  onChange={setEmail}
  error={emailError}
  helpText="We'll use this to contact you"
/>
```

The `error` prop accepts `string | boolean | ReactNode`. When truthy, it styles the field as invalid and displays the error message.
