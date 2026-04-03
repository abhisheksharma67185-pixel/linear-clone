"use client";

import {
  Page,
  Card,
  DataTable,
} from "@shopify/polaris";

const menus = [
  ["Main menu", "Home, Catalog, Contact"],
  ["Footer menu", "Search"],
  ["Customer account main menu", "Orders, Profile"],
];

export default function MenusPage() {
  return (
    <Page
      title="Menus"
      primaryAction={{ content: "Create menu" }}
      secondaryActions={[{ content: "URL redirects" }]}
    >
      <Card padding="0">
        <DataTable
          columnContentTypes={["text", "text"]}
          headings={["Menu", "Menu items"]}
          rows={menus}
        />
      </Card>
    </Page>
  );
}
