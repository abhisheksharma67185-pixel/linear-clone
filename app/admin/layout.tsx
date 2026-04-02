"use client";

import { Frame, Navigation, TopBar } from "@shopify/polaris";
import {
  HomeIcon,
  OrderIcon,
  ProductIcon,
  PersonIcon,
  ChartVerticalFilledIcon,
  SettingsIcon,
  ContentIcon,
  DiscountIcon,
  StoreOnlineIcon,
  MegaphoneIcon,
  MarketsIcon,
  PlusCircleIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [userMenuActive, setUserMenuActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const toggleMobileNav = useCallback(
    () => setMobileNavActive((active) => !active),
    [],
  );
  const toggleUserMenu = useCallback(
    () => setUserMenuActive((active) => !active),
    [],
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      onNavigationToggle={toggleMobileNav}
      userMenu={
        <TopBar.UserMenu
          actions={[
            { items: [{ content: "Manage account" }] },
            { items: [{ content: "Log out" }] },
          ]}
          name="My Store"
          initials="MS"
          open={userMenuActive}
          onToggle={toggleUserMenu}
        />
      }
      searchField={
        <TopBar.SearchField
          onChange={setSearchValue}
          value={searchValue}
          placeholder="Search"
        />
      }
    />
  );

  const navigationMarkup = (
    <Navigation location={pathname}>
      <Navigation.Section
        items={[
          {
            url: "/admin",
            label: "Home",
            icon: HomeIcon,
            exactMatch: true,
            onClick: () => router.push("/admin"),
          },
          {
            url: "/admin/orders",
            label: "Orders",
            icon: OrderIcon,
            onClick: () => router.push("/admin/orders"),
            subNavigationItems: [
              {
                url: "/admin/orders/drafts",
                label: "Drafts",
                onClick: () => router.push("/admin/orders/drafts"),
              },
              {
                url: "/admin/orders/abandoned-checkouts",
                label: "Abandoned checkouts",
                onClick: () => router.push("/admin/orders/abandoned-checkouts"),
              },
            ],
          },
          {
            url: "/admin/products",
            label: "Products",
            icon: ProductIcon,
            onClick: () => router.push("/admin/products"),
            subNavigationItems: [
              {
                url: "/admin/products/collections",
                label: "Collections",
                onClick: () => router.push("/admin/products/collections"),
              },
              {
                url: "/admin/products/inventory",
                label: "Inventory",
                onClick: () => router.push("/admin/products/inventory"),
              },
              {
                url: "/admin/products/purchase-orders",
                label: "Purchase orders",
                onClick: () => router.push("/admin/products/purchase-orders"),
              },
              {
                url: "/admin/products/transfers",
                label: "Transfers",
                onClick: () => router.push("/admin/products/transfers"),
              },
              {
                url: "/admin/products/gift-cards",
                label: "Gift cards",
                onClick: () => router.push("/admin/products/gift-cards"),
              },
            ],
          },
          {
            url: "/admin/customers",
            label: "Customers",
            icon: PersonIcon,
            onClick: () => router.push("/admin/customers"),
            subNavigationItems: [
              {
                url: "/admin/customers/segments",
                label: "Segments",
                onClick: () => router.push("/admin/customers/segments"),
              },
            ],
          },
          {
            url: "/admin/marketing",
            label: "Marketing",
            icon: MegaphoneIcon,
            onClick: () => router.push("/admin/marketing"),
            subNavigationItems: [
              {
                url: "/admin/marketing/campaigns",
                label: "Campaigns",
                onClick: () => router.push("/admin/marketing/campaigns"),
              },
              {
                url: "/admin/marketing/attribution",
                label: "Attribution",
                onClick: () => router.push("/admin/marketing/attribution"),
              },
              {
                url: "/admin/marketing/automations",
                label: "Automations",
                onClick: () => router.push("/admin/marketing/automations"),
              },
            ],
          },
          {
            url: "/admin/discounts",
            label: "Discounts",
            icon: DiscountIcon,
            onClick: () => router.push("/admin/discounts"),
          },
          {
            url: "/admin/content",
            label: "Content",
            icon: ContentIcon,
            onClick: () => router.push("/admin/content"),
            subNavigationItems: [
              {
                url: "/admin/content/metaobjects",
                label: "Metaobjects",
                onClick: () => router.push("/admin/content/metaobjects"),
              },
              {
                url: "/admin/content/files",
                label: "Files",
                onClick: () => router.push("/admin/content/files"),
              },
              {
                url: "/admin/content/menus",
                label: "Menus",
                onClick: () => router.push("/admin/content/menus"),
              },
              {
                url: "/admin/content/blog-posts",
                label: "Blog posts",
                onClick: () => router.push("/admin/content/blog-posts"),
              },
            ],
          },
          {
            url: "/admin/markets",
            label: "Markets",
            icon: MarketsIcon,
            onClick: () => router.push("/admin/markets"),
            subNavigationItems: [
              {
                url: "/admin/markets/catalogs",
                label: "Catalogs",
                onClick: () => router.push("/admin/markets/catalogs"),
              },
              {
                url: "/admin/markets/rollouts",
                label: "Rollouts",
                onClick: () => router.push("/admin/markets/rollouts"),
              },
            ],
          },
          {
            url: "/admin/analytics",
            label: "Analytics",
            icon: ChartVerticalFilledIcon,
            onClick: () => router.push("/admin/analytics"),
            subNavigationItems: [
              {
                url: "/admin/analytics/reports",
                label: "Reports",
                onClick: () => router.push("/admin/analytics/reports"),
              },
              {
                url: "/admin/analytics/live-view",
                label: "Live View",
                onClick: () => router.push("/admin/analytics/live-view"),
              },
            ],
          },
        ]}
        separator
      />
      <Navigation.Section
        title="Sales channels"
        items={[
          {
            url: "/admin/online-store",
            label: "Online Store",
            icon: StoreOnlineIcon,
            onClick: () => router.push("/admin/online-store"),
          },
        ]}
        separator
      />
      <Navigation.Section
        title="Apps"
        action={{
          icon: PlusCircleIcon,
          accessibilityLabel: "Add app",
          onClick: () => router.push("/admin/apps"),
        }}
        items={[]}
      />
      <Navigation.Section
        fill
        title=""
        items={[
          {
            url: "/admin/settings",
            label: "Settings",
            icon: SettingsIcon,
            onClick: () => router.push("/admin/settings"),
          },
        ]}
      />
    </Navigation>
  );

  return (
    <Frame
      topBar={topBarMarkup}
      navigation={navigationMarkup}
      showMobileNavigation={mobileNavActive}
      onNavigationDismiss={toggleMobileNav}
      logo={{
        topBarSource:
          "https://cdn.shopify.com/shopifycloud/web/assets/v1/vite/client/en/assets/shopify-logo-white-BKwm4Bz8.svg",
        accessibilityLabel: "Shopify",
        width: 86,
      }}
    >
      {children}
    </Frame>
  );
}
