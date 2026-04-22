"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

// Constrain Select to string values — that's all we use it for. Keeping
// Value=string lets us pass clean (v: string | null) handlers everywhere.
type StringSelectRootProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Root<string>>,
  "value" | "defaultValue" | "onValueChange"
> & {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

function Select({
  value,
  defaultValue,
  onValueChange,
  ...props
}: StringSelectRootProps) {
  return (
    <SelectPrimitive.Root<string>
      value={value ?? null}
      defaultValue={defaultValue ?? undefined}
      onValueChange={onValueChange ? (v) => onValueChange(v) : undefined}
      {...props}
    />
  )
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>,
) {
  return <SelectPrimitive.Value {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "border-input data-[active=true]:bg-accent data-[popup-open]:bg-accent flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "[&>span]:line-clamp-1 dark:bg-input/30 dark:hover:bg-input/50",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="size-4 opacity-50">
        <IconChevronDown className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={4} className="z-50 outline-none">
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "bg-popover text-popover-foreground relative z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border shadow-md outline-none",
            "max-h-[min(var(--available-height),24rem)]",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            "data-[side=bottom]:translate-y-0 data-[side=top]:translate-y-0 transition-opacity duration-150",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List className="p-1">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <IconCheck className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
