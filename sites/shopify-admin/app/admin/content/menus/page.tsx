"use client";

import {
  Page,
  Card,
  DataTable,
  Modal,
  TextField,
  Toast,
  Frame,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

const initialMenus: [string, string][] = [
  ["Main menu", "Home, Catalog, Contact"],
  ["Footer menu", "Search"],
  ["Customer account main menu", "Orders, Profile"],
];

export default function MenusPage() {
  const [menuList, setMenuList] = useState<[string, string][]>(initialMenus);
  const [showModal, setShowModal] = useState(false);
  const [newMenuTitle, setNewMenuTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const handleCreate = useCallback(() => {
    if (newMenuTitle.trim()) {
      setMenuList((prev) => [...prev, [newMenuTitle.trim(), ""]]);
      setNewMenuTitle("");
      setShowModal(false);
      setToastMessage(`Menu "${newMenuTitle.trim()}" created`);
    }
  }, [newMenuTitle]);

  return (
    <Frame>
      <Page
        title="Menus"
        primaryAction={{
          content: "Create menu",
          onAction: () => setShowModal(true),
        }}
        secondaryActions={[
          {
            content: "URL redirects",
            onAction: () => setToastMessage("Redirects coming soon"),
          },
        ]}
      >
        <Card padding="0">
          <DataTable
            columnContentTypes={["text", "text"]}
            headings={["Menu", "Menu items"]}
            rows={menuList}
          />
        </Card>
      </Page>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create menu"
        primaryAction={{
          content: "Create",
          onAction: handleCreate,
          disabled: !newMenuTitle.trim(),
        }}
        secondaryActions={[
          { content: "Cancel", onAction: () => setShowModal(false) },
        ]}
      >
        <Modal.Section>
          <TextField
            label="Menu title"
            value={newMenuTitle}
            onChange={setNewMenuTitle}
            autoComplete="off"
            placeholder="e.g. Sidebar menu"
          />
        </Modal.Section>
      </Modal>

      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage("")} />
      )}
    </Frame>
  );
}
