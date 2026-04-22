"use client";

import { Frame, Navigation, TopBar, Icon, Popover, ActionList, Text } from "@shopify/polaris";
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
  NotificationIcon,
  AppsIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [navAvatarOpen, setNavAvatarOpen] = useState(false);

  const toggleMobileNav = useCallback(() => setMobileNavActive((a) => !a), []);

  const shopifyLogo = (
    <a
      href="/admin"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        textDecoration: "none",
        paddingLeft: "16px",
      }}
      aria-label="Shopify"
    >
      <svg
        width="22"
        height="26"
        viewBox="0 0 22 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M18.7 5.6L17.9 5.5C17.8 4.9 17.4 0.8 13.1 0.6C12.7 0.6 12.4 0.7 12.1 0.9C11.8 0.5 11.4 0.3 10.8 0.3C8.9 0.4 8 2.5 7.7 3.7L6.2 3.9C5.7 4 5.3 4.4 5.2 4.9L4 19.3C3.9 19.8 4.3 20.3 4.8 20.4L17.9 22.9C18.4 23 18.9 22.6 19 22.1L20.4 6.7C20.5 6.2 20.1 5.7 19.6 5.6L18.7 5.6Z"
          fill="#95BF47"
        />
        <path
          d="M13.1 1.1C16.8 1.3 17.2 5.1 17.3 5.4L14.1 4.9C14.1 4.9 13.7 2.6 11.8 2.3C11.5 2.2 11.3 2.2 11 2.3L10.8 0.7C11.1 0.6 11.3 0.5 11.6 0.5C12.1 0.6 12.6 0.8 13.1 1.1Z"
          fill="#5E8E3E"
        />
        <path
          d="M14.2 5.1L11.1 4.6C11.1 4.6 11.4 2.6 12.2 2.3C13.8 2.9 14.2 5.1 14.2 5.1Z"
          fill="white"
        />
      </svg>
      <span
        style={{
          color: "white",
          fontSize: "17px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          fontFamily: "inherit",
        }}
      >
        shopify
      </span>
    </a>
  );

  const iconBtnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.75)",
  };

  const appsActivator = (
    <button
      onClick={() => setAppsOpen((o) => !o)}
      style={iconBtnStyle}
      aria-label="Apps"
      aria-expanded={appsOpen}
      aria-haspopup="true"
    >
      <div style={{ filter: "brightness(0) invert(1)", opacity: 0.75, display: "flex" }}>
        <Icon source={AppsIcon} />
      </div>
    </button>
  );

  const bellActivator = (
    <button
      onClick={() => setBellOpen((o) => !o)}
      style={iconBtnStyle}
      aria-label="Notifications"
      aria-expanded={bellOpen}
      aria-haspopup="true"
    >
      <div style={{ filter: "brightness(0) invert(1)", opacity: 0.75, display: "flex" }}>
        <Icon source={NotificationIcon} />
      </div>
    </button>
  );

  const storeActivator = (
    <button
      onClick={() => setStoreOpen((o) => !o)}
      style={{ ...iconBtnStyle, gap: "8px", paddingLeft: "8px", paddingRight: "4px" }}
      aria-label="My Store menu"
      aria-expanded={storeOpen}
      aria-haspopup="true"
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#00A47C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          fontSize: "11px",
          flexShrink: 0,
          letterSpacing: "0.02em",
        }}
      >
        MS
      </div>
      <span style={{ color: "white", fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" }}>
        My Store
      </span>
    </button>
  );

  const navAvatarActivator = (
    <button
      onClick={() => setNavAvatarOpen((o) => !o)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 8px",
        borderRadius: "6px",
        width: "100%",
      }}
      aria-label="Account menu"
      aria-expanded={navAvatarOpen}
      aria-haspopup="true"
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#6366f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          fontSize: "12px",
          flexShrink: 0,
        }}
      >
        N
      </div>
      <span style={{ fontSize: "13px", fontWeight: 500, color: "#e5e7eb" }}>My account</span>
    </button>
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      onNavigationToggle={toggleMobileNav}
      contextControl={shopifyLogo}
      secondaryMenu={
        <div style={{ display: "flex", alignItems: "center", gap: "2px", paddingRight: "4px" }}>
          <Popover active={appsOpen} activator={appsActivator} onClose={() => setAppsOpen(false)}>
            <ActionList
              actionRole="menuitem"
              sections={[
                {
                  items: [
                    {
                      content: "Installed apps",
                      onAction: () => {
                        router.push("/admin/apps");
                        setAppsOpen(false);
                      },
                    },
                  ],
                },
                {
                  items: [
                    {
                      content: "App store",
                      onAction: () => {
                        router.push("/admin/apps/add");
                        setAppsOpen(false);
                      },
                    },
                  ],
                },
              ]}
            />
          </Popover>

          <Popover active={bellOpen} activator={bellActivator} onClose={() => setBellOpen(false)}>
            <div style={{ padding: "20px 24px", minWidth: "220px", textAlign: "center" }}>
              <Text as="p" tone="subdued">
                No new notifications
              </Text>
            </div>
          </Popover>

          <Popover
            active={storeOpen}
            activator={storeActivator}
            onClose={() => setStoreOpen(false)}
          >
            <ActionList
              actionRole="menuitem"
              items={[
                {
                  content: "Your profile",
                  onAction: () => {
                    router.push("/admin/profile");
                    setStoreOpen(false);
                  },
                },
                {
                  content: "Manage account",
                  onAction: () => {
                    router.push("/admin/account");
                    setStoreOpen(false);
                  },
                },
                {
                  content: "Log out",
                  onAction: () => {
                    router.push("/admin/logout");
                    setStoreOpen(false);
                  },
                },
              ]}
            />
          </Popover>
        </div>
      }
      searchField={
        <div
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchValue.trim()) {
              router.push(`/admin/search?q=${encodeURIComponent(searchValue.trim())}`);
            }
          }}
        >
          <TopBar.SearchField onChange={setSearchValue} value={searchValue} placeholder="Search" />
        </div>
      }
    />
  );

  const navigationMarkup = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
                  url: "/admin/analytics/live",
                  label: "Live View",
                  onClick: () => router.push("/admin/analytics/live"),
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
              subNavigationItems: [
                {
                  url: "/admin/online-store/themes",
                  label: "Themes",
                  onClick: () => router.push("/admin/online-store/themes"),
                },
                {
                  url: "/admin/online-store/pages",
                  label: "Pages",
                  onClick: () => router.push("/admin/online-store/pages"),
                },
                {
                  url: "/admin/online-store/preferences",
                  label: "Preferences",
                  onClick: () => router.push("/admin/online-store/preferences"),
                },
              ],
            },
          ]}
          separator
        />
        <Navigation.Section
          title="Apps"
          action={{
            icon: PlusCircleIcon,
            accessibilityLabel: "Add app",
            onClick: () => router.push("/admin/apps/add"),
          }}
          items={[]}
          separator
        />
        <Navigation.Section
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

      {/* Bottom account avatar */}
      <div style={{ padding: "0 4px 4px" }}>
        <Popover
          active={navAvatarOpen}
          activator={navAvatarActivator}
          onClose={() => setNavAvatarOpen(false)}
          preferredPosition="above"
        >
          <ActionList
            actionRole="menuitem"
            items={[
              {
                content: "Your profile",
                onAction: () => {
                  router.push("/admin/profile");
                  setNavAvatarOpen(false);
                },
              },
              {
                content: "Manage account",
                onAction: () => {
                  router.push("/admin/account");
                  setNavAvatarOpen(false);
                },
              },
              {
                content: "Log out",
                onAction: () => {
                  router.push("/admin/logout");
                  setNavAvatarOpen(false);
                },
              },
            ]}
          />
        </Popover>
      </div>

      {/* Trial banner */}
      <div style={{ padding: "4px 12px 12px" }}>
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "8px",
            padding: "12px 14px",
            color: "white",
          }}
        >
          <p style={{ fontSize: "12px", margin: 0, color: "#9ca3af", lineHeight: 1.4 }}>
            Trial ends in 3 days
          </p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "3px 0 10px",
              lineHeight: 1.4,
            }}
          >
            Subscribe for ₹20
          </p>
          <button
            style={{
              width: "100%",
              padding: "7px 0",
              background: "white",
              color: "#1a1a1a",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Frame
      topBar={topBarMarkup}
      navigation={navigationMarkup}
      showMobileNavigation={mobileNavActive}
      onNavigationDismiss={toggleMobileNav}
    >
      {children}
    </Frame>
  );
}
