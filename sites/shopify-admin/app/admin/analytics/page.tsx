"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  InlineGrid,
  Box,
  Button,
  Link,
  Popover,
  ActionList,
  DatePicker,
} from "@shopify/polaris";
import { CalendarIcon, MoneyFilledIcon } from "@shopify/polaris-icons";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Range } from "@shopify/polaris";

// ─── Currency ──────────────────────────────────────────────────────────────

const CURRENCIES = [
  { code: "USD", label: "USD $", symbol: "$" },
  { code: "EUR", label: "EUR €", symbol: "€" },
  { code: "GBP", label: "GBP £", symbol: "£" },
  { code: "INR", label: "INR ₹", symbol: "₹" },
  { code: "JPY", label: "JPY ¥", symbol: "¥" },
  { code: "AUD", label: "AUD $", symbol: "A$" },
  { code: "CAD", label: "CAD $", symbol: "CA$" },
  { code: "CHF", label: "CHF Fr", symbol: "Fr" },
  { code: "CNY", label: "CNY ¥", symbol: "CN¥" },
  { code: "HKD", label: "HKD $", symbol: "HK$" },
  { code: "SGD", label: "SGD $", symbol: "S$" },
  { code: "KRW", label: "KRW ₩", symbol: "₩" },
  { code: "MXN", label: "MXN $", symbol: "MX$" },
  { code: "NZD", label: "NZD $", symbol: "NZ$" },
  { code: "SEK", label: "SEK kr", symbol: "kr" },
  { code: "NOK", label: "NOK kr", symbol: "kr" },
  { code: "DKK", label: "DKK kr", symbol: "kr" },
  { code: "BRL", label: "BRL R$", symbol: "R$" },
  { code: "ZAR", label: "ZAR R", symbol: "R" },
  { code: "AED", label: "AED د.إ", symbol: "د.إ" },
  { code: "SAR", label: "SAR ر.س", symbol: "ر.س" },
  { code: "THB", label: "THB ฿", symbol: "฿" },
  { code: "IDR", label: "IDR Rp", symbol: "Rp" },
  { code: "MYR", label: "MYR RM", symbol: "RM" },
  { code: "PHP", label: "PHP ₱", symbol: "₱" },
  { code: "TWD", label: "TWD NT$", symbol: "NT$" },
  { code: "TRY", label: "TRY ₺", symbol: "₺" },
  { code: "PLN", label: "PLN zł", symbol: "zł" },
  { code: "CZK", label: "CZK Kč", symbol: "Kč" },
  { code: "HUF", label: "HUF Ft", symbol: "Ft" },
  { code: "ILS", label: "ILS ₪", symbol: "₪" },
  { code: "VND", label: "VND ₫", symbol: "₫" },
  { code: "PKR", label: "PKR ₨", symbol: "₨" },
  { code: "NGN", label: "NGN ₦", symbol: "₦" },
  { code: "KES", label: "KES KSh", symbol: "KSh" },
  { code: "EGP", label: "EGP E£", symbol: "E£" },
  { code: "BDT", label: "BDT ৳", symbol: "৳" },
  { code: "CLP", label: "CLP $", symbol: "CL$" },
  { code: "COP", label: "COP $", symbol: "CO$" },
  { code: "ARS", label: "ARS $", symbol: "AR$" },
  { code: "RUB", label: "RUB ₽", symbol: "₽" },
];

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(amount);
}

// ─── BFCM helper ───────────────────────────────────────────────────────────

function getBFCMRange(year: number): { start: Date; end: Date } {
  // Thanksgiving = 4th Thursday of November
  const nov1 = new Date(year, 10, 1);
  const dow = nov1.getDay(); // 0=Sun … 4=Thu
  const firstThursday = dow <= 4 ? 5 - dow : 12 - dow;
  const thanksgiving = new Date(year, 10, firstThursday + 21);
  const blackFriday = new Date(thanksgiving);
  blackFriday.setDate(thanksgiving.getDate() + 1);
  const cyberMonday = new Date(thanksgiving);
  cyberMonday.setDate(thanksgiving.getDate() + 4);
  return { start: blackFriday, end: cyberMonday };
}

// ─── Range ─────────────────────────────────────────────────────────────────

type SubItem = { label: string; value: string };
type RangeItem = { label: string; value: string; children?: SubItem[] };

const _thisYear = new Date().getFullYear();

const RANGES: RangeItem[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  {
    label: "Last", value: "last",
    children: [
      { label: "Last 7 days", value: "last-7" },
      { label: "Last 30 days", value: "last-30" },
      { label: "Last 90 days", value: "last-90" },
      { label: "Last 12 months", value: "last-12m" },
    ],
  },
  {
    label: "Period to date", value: "period-to-date",
    children: [
      { label: "Week to date", value: "week-to-date" },
      { label: "Month to date", value: "month-to-date" },
      { label: "Quarter to date", value: "quarter-to-date" },
      { label: "Year to date", value: "year-to-date" },
    ],
  },
  {
    label: "Black Friday Cyber Monday", value: "bfcm",
    children: [
      { label: `This year (${_thisYear})`, value: "bfcm-this" },
      { label: `Last year (${_thisYear - 1})`, value: "bfcm-last" },
      { label: `2 years ago (${_thisYear - 2})`, value: "bfcm-2ago" },
    ],
  },
  {
    label: "Quarters", value: "quarters",
    children: [
      { label: "This quarter", value: "this-quarter" },
      { label: "Last quarter", value: "last-quarter" },
      { label: "Quarter 2 years ago", value: "quarter-2ago" },
    ],
  },
  { label: "Custom range", value: "custom" },
];

function getParentValue(value: string): string {
  for (const r of RANGES) {
    if (r.children?.some((c) => c.value === value)) return r.value;
  }
  return value;
}

function getRangeLabel(value: string): string {
  for (const r of RANGES) {
    if (r.value === value) return r.label;
    if (r.children) {
      for (const c of r.children) {
        if (c.value === value) return c.label;
      }
    }
  }
  return "Today";
}

const COMPARISONS = [
  { label: "No comparison", value: "no-comparison" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Previous year", value: "previous-year" },
  { label: "Previous year (match day of week)", value: "previous-year-match" },
  { label: "Custom", value: "custom" },
];


const SPARK_DATA = [
  { h: 0, v: 120 }, { h: 1, v: 95 }, { h: 2, v: 80 }, { h: 3, v: 70 },
  { h: 4, v: 85 }, { h: 5, v: 110 }, { h: 6, v: 160 }, { h: 7, v: 230 },
  { h: 8, v: 310 }, { h: 9, v: 420 }, { h: 10, v: 510 }, { h: 11, v: 580 },
  { h: 12, v: 620 }, { h: 13, v: 590 }, { h: 14, v: 560 }, { h: 15, v: 610 },
  { h: 16, v: 670 }, { h: 17, v: 720 }, { h: 18, v: 690 }, { h: 19, v: 640 },
  { h: 20, v: 580 }, { h: 21, v: 490 }, { h: 22, v: 380 }, { h: 23, v: 250 },
];

const COMPARE_SPARK_DATA = [
  { h: 0, c: 90 }, { h: 1, c: 75 }, { h: 2, c: 60 }, { h: 3, c: 55 },
  { h: 4, c: 65 }, { h: 5, c: 88 }, { h: 6, c: 130 }, { h: 7, c: 190 },
  { h: 8, c: 260 }, { h: 9, c: 370 }, { h: 10, c: 450 }, { h: 11, c: 510 },
  { h: 12, c: 540 }, { h: 13, c: 520 }, { h: 14, c: 495 }, { h: 15, c: 540 },
  { h: 16, c: 600 }, { h: 17, c: 640 }, { h: 18, c: 610 }, { h: 19, c: 570 },
  { h: 20, c: 510 }, { h: 21, c: 420 }, { h: 22, c: 320 }, { h: 23, c: 210 },
];

const MERGED_DATA = SPARK_DATA.map((d, i) => ({ ...d, c: COMPARE_SPARK_DATA[i].c }));

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  reportUrl,
}: {
  title: string;
  value: string;
  reportUrl?: string;
}) {
  return (
    <Card>
      <BlockStack gap="200">
        <div className="plain-card-title">
          <Text as="h3" variant="bodySm" tone="subdued">
            {reportUrl ? <Link url={reportUrl}>{title}</Link> : title}
          </Text>
        </div>
        <InlineStack gap="100" blockAlign="center">
          <Text as="p" variant="headingMd">
            {value}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            —
          </Text>
        </InlineStack>
        <div
          style={{
            height: "3px",
            width: "60px",
            borderRadius: "2px",
            backgroundColor: "#2C6ECB",
          }}
        />
      </BlockStack>
    </Card>
  );
}

function ChartCard({
  title,
  value,
  showChart,
  reportUrl: _reportUrl,
  chartType = "area",
  showComparison = false,
  mainDateLabel,
  compDateLabel,
}: {
  title: string;
  value?: string;
  showChart?: boolean;
  reportUrl?: string;
  chartType?: "area" | "line";
  showComparison?: boolean;
  mainDateLabel?: string;
  compDateLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const data = useMemo(() => MERGED_DATA, []);

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          {title}
        </Text>
        {value && (
          <InlineStack gap="100" blockAlign="center">
            <Text as="p" variant="headingLg">
              {value}
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              —
            </Text>
          </InlineStack>
        )}
        {showChart ? (
          <>
            <div style={{ height: 300 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === "line" ? (
                    <LineChart data={data}>
                      <Tooltip />
                      <Line type="monotone" dataKey="v" stroke="#2C6ECB" strokeWidth={2} dot={false} />
                      {showComparison && (
                        <Line type="monotone" dataKey="c" stroke="#94A3B8" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                      )}
                    </LineChart>
                  ) : (
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2C6ECB" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2C6ECB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip />
                      <Area type="monotone" dataKey="v" stroke="#2C6ECB" fill="url(#cg)" fillOpacity={0.1} strokeWidth={2} dot={false} />
                      {showComparison && (
                        <Area type="monotone" dataKey="c" stroke="#94A3B8" fill="none" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                      )}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
            {showComparison && mainDateLabel && compDateLabel && (
              <div style={{ display: "flex", gap: 16, paddingTop: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6D7175" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2C6ECB", display: "inline-block", flexShrink: 0 }} />
                  {mainDateLabel}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6D7175" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#94A3B8", display: "inline-block", flexShrink: 0 }} />
                  {compDateLabel}
                </span>
              </div>
            )}
          </>
        ) : (
          <Box minHeight="120px" padding="800">
            <Text as="p" variant="bodySm" tone="subdued" alignment="center">
              No data for this date range
            </Text>
          </Box>
        )}
      </BlockStack>
    </Card>
  );
}

function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; formattedValue: string; slug: string }[];
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          {title}
        </Text>
        <BlockStack gap="200">
          {items.map((item) => (
            <InlineStack key={item.label} align="space-between" blockAlign="center">
              <Link url={`/admin/analytics/reports/${item.slug}`}>{item.label}</Link>
              <InlineStack gap="200" blockAlign="center">
                <Text as="span" variant="bodyMd">
                  {item.formattedValue}
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  —
                </Text>
              </InlineStack>
            </InlineStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

function ConversionBreakdownCard({ reportUrl: _r }: { reportUrl?: string }) {
  const cols = [
    { label: "Sessions", value: "100%", sub: "1,204x" },
    { label: "Added to cart", value: "12.1%", sub: "146x" },
    { label: "Reached checkout", value: "5.8%", sub: "70x" },
    { label: "Completed", value: "3.5%", sub: "42x" },
  ];
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          Conversion rate breakdown
        </Text>
        <InlineStack gap="100" blockAlign="center">
          <Text as="p" variant="headingLg">
            3.5%
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            —
          </Text>
        </InlineStack>
        <InlineStack gap="400" wrap={false}>
          {cols.map((col) => (
            <Box key={col.label} width="25%">
              <BlockStack gap="100">
                <Text as="span" variant="bodySm" tone="subdued">
                  {col.label}
                </Text>
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                  {col.value}
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  {col.sub}
                </Text>
              </BlockStack>
            </Box>
          ))}
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function CohortCard({ reportUrl: _r }: { reportUrl?: string }) {
  const months = [
    "Aug 2025",
    "Sep 2025",
    "Oct 2025",
    "Nov 2025",
    "Dec 2025",
    "Jan 2026",
    "Feb 2026",
    "Mar 2026",
  ];
  const cohortData = [
    [8.2, 5.1, 3.8, 2.9, 2.1, 1.5, 1.2, 0.8],
    [7.5, 4.8, 3.2, 2.5, 1.9, 1.1, 0.9],
    [9.1, 5.6, 4.0, 3.1, 2.3, 1.7],
    [6.8, 4.2, 2.9, 2.0, 1.4],
    [8.4, 5.3, 3.5, 2.6],
    [7.9, 4.9, 3.3],
    [10.2, 6.1],
    [8.7],
  ];
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          Customer cohort analysis
        </Text>
        <InlineStack gap="200" wrap={false}>
          <Box>
            <BlockStack gap="100">
              <Text as="span" variant="bodySm" fontWeight="semibold">
                Cohort
              </Text>
              {months.map((m) => (
                <Text key={m} as="span" variant="bodySm">
                  {m}
                </Text>
              ))}
            </BlockStack>
          </Box>
          <Box width="100%">
            <BlockStack gap="100">
              <Text as="span" variant="bodySm" fontWeight="semibold">
                Months
              </Text>
              {months.map((m, i) => (
                <InlineStack key={m} gap="300">
                  {cohortData[i].map((val, j) => (
                    <Text key={j} as="span" variant="bodySm" tone="success">
                      {val}%
                    </Text>
                  ))}
                </InlineStack>
              ))}
            </BlockStack>
          </Box>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();

  const [currency, setCurrency] = useState("INR");
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const [selectedRange, setSelectedRange] = useState("today");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState("today");
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);
  const rangeButtonRef = useRef<HTMLDivElement>(null);
  const rangeDropdownRef = useRef<HTMLDivElement>(null);
  const [rangePos, setRangePos] = useState({ top: 0, left: 0 });
  const [pageMounted, setPageMounted] = useState(false);
  useEffect(() => { setPageMounted(true); }, []);

  const today = new Date();
  // Fix 2: left calendar = previous month, right = current month
  const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
  const prevMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const [rangeMonth, setRangeMonth] = useState(prevMonth);
  const [rangeYear, setRangeYear] = useState(prevMonthYear);
  const [rangeDates, setRangeDates] = useState<Range>({ start: today, end: today });
  const [showTimeRow, setShowTimeRow] = useState(false);
  const [startTime, setStartTime] = useState("12:00 AM");
  const [endTime, setEndTime] = useState("11:59 PM");

  const [dateOpen, setDateOpen] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState("yesterday");

  const fmt = useCallback(
    (amount: number) => formatCurrency(amount, currency),
    [currency],
  );

  const rangeLabel = getRangeLabel(selectedRange);
  const activeParentValue = getParentValue(pendingRange);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const prevYear = new Date(today);
  prevYear.setFullYear(today.getFullYear() - 1);

  const fmt2 = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const compDateLabel = selectedComparison === "no-comparison" ? "No comparison"
    : selectedComparison === "yesterday" ? fmt2(yesterday)
    : selectedComparison === "previous-year" ? fmt2(prevYear)
    : selectedComparison === "previous-year-match" ? fmt2(prevYear)
    : fmt2(yesterday);

  // Fix 7: pill shows the comparison type label, not the date
  const compPillLabel = COMPARISONS.find((c) => c.value === selectedComparison)?.label ?? "Compare";

  const mainDateLabel = fmt2(today);
  const showComparison = selectedComparison !== "no-comparison";

  const currencyObj = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[3];

  const salesBreakdown = [
    { label: "Gross sales", amount: 14102.8, slug: "gross-sales" },
    { label: "Discounts", amount: -423.08, slug: "discounts" },
    { label: "Returns", amount: -189.5, slug: "returns" },
    { label: "Net sales", amount: 13490.22, slug: "net-sales" },
    { label: "Shipping charges", amount: 312.4, slug: "shipping" },
    { label: "Return fees", amount: 0.0, slug: "return-fees" },
    { label: "Taxes", amount: 955.3, slug: "taxes" },
    { label: "Total sales", amount: 12847.32, slug: "total-sales" },
  ];

  const handleRangeSelect = (value: string) => {
    // Parent with children → toggle submenu, don't apply range
    const parent = RANGES.find((r) => r.value === value);
    if (parent?.children) {
      setExpandedPreset((prev) => (prev === value ? null : value));
      return;
    }

    setPendingRange(value);
    const t = new Date();

    if (value === "today") {
      setRangeDates({ start: t, end: t });
    } else if (value === "yesterday") {
      const y = new Date(t); y.setDate(t.getDate() - 1);
      setRangeDates({ start: y, end: y });
    } else if (value === "last-7") {
      const s = new Date(t); s.setDate(t.getDate() - 7);
      setRangeDates({ start: s, end: t });
    } else if (value === "last-30") {
      const s = new Date(t); s.setDate(t.getDate() - 30);
      setRangeDates({ start: s, end: t });
    } else if (value === "last-90") {
      const s = new Date(t); s.setDate(t.getDate() - 90);
      setRangeDates({ start: s, end: t });
    } else if (value === "last-12m") {
      const s = new Date(t); s.setMonth(t.getMonth() - 12);
      setRangeDates({ start: s, end: t });
    } else if (value === "week-to-date") {
      const s = new Date(t); s.setDate(t.getDate() - t.getDay());
      setRangeDates({ start: s, end: t });
    } else if (value === "month-to-date") {
      setRangeDates({ start: new Date(t.getFullYear(), t.getMonth(), 1), end: t });
    } else if (value === "quarter-to-date") {
      const qm = Math.floor(t.getMonth() / 3) * 3;
      setRangeDates({ start: new Date(t.getFullYear(), qm, 1), end: t });
    } else if (value === "year-to-date") {
      setRangeDates({ start: new Date(t.getFullYear(), 0, 1), end: t });
    } else if (value === "this-quarter") {
      const qm = Math.floor(t.getMonth() / 3) * 3;
      setRangeDates({ start: new Date(t.getFullYear(), qm, 1), end: new Date(t.getFullYear(), qm + 3, 0) });
    } else if (value === "last-quarter") {
      const qm = Math.floor(t.getMonth() / 3) * 3;
      const lqm = qm === 0 ? 9 : qm - 3;
      const lqy = qm === 0 ? t.getFullYear() - 1 : t.getFullYear();
      setRangeDates({ start: new Date(lqy, lqm, 1), end: new Date(lqy, lqm + 3, 0) });
    } else if (value === "quarter-2ago") {
      const qm = Math.floor(t.getMonth() / 3) * 3;
      let q2m = qm - 6;
      let q2y = t.getFullYear();
      if (q2m < 0) { q2m += 12; q2y -= 1; }
      setRangeDates({ start: new Date(q2y, q2m, 1), end: new Date(q2y, q2m + 3, 0) });
    } else if (value === "bfcm-this") {
      setRangeDates(getBFCMRange(t.getFullYear()));
    } else if (value === "bfcm-last") {
      setRangeDates(getBFCMRange(t.getFullYear() - 1));
    } else if (value === "bfcm-2ago") {
      setRangeDates(getBFCMRange(t.getFullYear() - 2));
    }
  };

  const handleRangeApply = () => {
    setSelectedRange(pendingRange);
    setRangeOpen(false);
    router.push(`/admin/analytics?range=${pendingRange}`);
  };

  const openRangePicker = () => {
    if (rangeButtonRef.current) {
      const r = rangeButtonRef.current.getBoundingClientRect();
      setRangePos({ top: r.bottom + 4, left: r.left });
    }
    // Auto-expand parent submenu if current selection is a sub-item
    const parent = getParentValue(pendingRange);
    if (parent !== pendingRange) setExpandedPreset(parent);
    setRangeOpen((o) => !o);
  };

  // Close range picker on outside click
  useEffect(() => {
    if (!rangeOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        !rangeButtonRef.current?.contains(e.target as Node) &&
        !rangeDropdownRef.current?.contains(e.target as Node)
      ) {
        setRangeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [rangeOpen]);

  const rangeActivator = (
    <Button
      size="slim"
      icon={CalendarIcon}
      disclosure="down"
      onClick={openRangePicker}
      accessibilityLabel="Select date range"
    >
      {rangeLabel}
    </Button>
  );

  const CompareIcon = () => (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 5h11M9 3l3 2-3 2" />
      <path d="M15 11H4M7 9l-3 2 3 2" />
    </svg>
  );

  const dateActivator = (
    <button
      onClick={() => setDateOpen((o) => !o)}
      aria-label="Select comparison period"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 10px", background: "#ffffff", border: "1px solid #e1e3e5",
        borderRadius: 20, fontSize: 13, cursor: "pointer", color: "#1a1a1a", fontFamily: "inherit",
      }}
    >
      <CompareIcon />
      <span>{compPillLabel}</span>
      <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M5 8l5 5 5-5H5z"/></svg>
    </button>
  );

  const currencyActivator = (
    <Button
      size="slim"
      icon={MoneyFilledIcon}
      disclosure="down"
      onClick={() => setCurrencyOpen((o) => !o)}
      accessibilityLabel="Select currency"
    >
      {currencyObj.label}
    </Button>
  );

  return (
    <Page
      title="Analytics"
      primaryAction={{
        content: "New exploration",
        onAction: () => router.push("/admin/analytics/explorations/new"),
      }}
      fullWidth
    >
      {/* Fix 1: CSS override for Polaris DatePicker range band */}
      <style>{`
        .Polaris-DatePicker__Day--inRange:not(.Polaris-DatePicker__Day--selected) {
          background-color: #E3F1F8 !important;
          border-radius: 0 !important;
          color: #202223 !important;
        }
        td:has(> .Polaris-DatePicker__Day--inRange:not(.Polaris-DatePicker__Day--selected)) {
          background: #E3F1F8;
        }
        td:has(> .Polaris-DatePicker__Day--selected):not(:has(> .Polaris-DatePicker__Day--inRange)) {
          background: transparent;
        }
      `}</style>

      <BlockStack gap="400">
        {/* Subtitle row */}
        <p style={{ margin: 0, marginTop: -12, fontSize: 13, color: "#6D7175", fontWeight: 400 }}>
          Last refreshed: 5:41 PM
        </p>
        {/* Filter pills */}
        <InlineStack gap="200" blockAlign="center">
          {/* Range picker activator */}
          <div ref={rangeButtonRef} style={{ display: "inline-block" }}>
            {rangeActivator}
          </div>

          {/* Range picker dropdown — fixed-position */}
          {pageMounted && rangeOpen && (
            <div
              ref={rangeDropdownRef}
              style={{
                position: "fixed",
                top: rangePos.top,
                left: Math.min(rangePos.left, Math.max(0, (typeof window !== "undefined" ? window.innerWidth : 1440) - 920 - 8)),
                width: 920,
                zIndex: 700,
                background: "#ffffff",
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex" }}>
                {/* Left: preset list with submenus (fixes 3–6) */}
                <div style={{ width: 240, borderRight: "1px solid #e1e3e5", flexShrink: 0, paddingTop: 8, paddingBottom: 8, overflowY: "auto" }}>
                  {RANGES.map((r) => {
                    const isActiveParent = activeParentValue === r.value;
                    const isLeafActive = pendingRange === r.value;
                    const isHighlighted = isActiveParent || isLeafActive;
                    const isExpanded = expandedPreset === r.value;

                    return (
                      <div key={r.value}>
                        <button
                          onClick={() => handleRangeSelect(r.value)}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "6px 16px",
                            border: "none",
                            background: "transparent",
                            fontWeight: isHighlighted ? 600 : 400,
                            fontSize: 14,
                            cursor: "pointer",
                            color: "#202223",
                            fontFamily: "inherit",
                          }}
                        >
                          <span style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: 6,
                            background: isHighlighted ? "#f3f3f3" : "transparent",
                          }}>
                            <span>{r.label}</span>
                            {r.children && (
                              <svg
                                viewBox="0 0 20 20" width="14" height="14" fill="currentColor"
                                aria-hidden="true"
                                style={{
                                  flexShrink: 0, opacity: 0.5,
                                  transform: isExpanded ? "rotate(90deg)" : "none",
                                  transition: "transform 0.15s",
                                }}
                              >
                                <path d="M8 5l5 5-5 5V5z"/>
                              </svg>
                            )}
                          </span>
                        </button>
                        {/* Submenu */}
                        {r.children && isExpanded && (
                          <div style={{ paddingLeft: 8, paddingBottom: 4 }}>
                            {r.children.map((child) => (
                              <button
                                key={child.value}
                                onClick={() => handleRangeSelect(child.value)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  textAlign: "left",
                                  padding: "5px 16px",
                                  border: "none",
                                  background: "transparent",
                                  fontWeight: pendingRange === child.value ? 600 : 400,
                                  fontSize: 13,
                                  cursor: "pointer",
                                  color: "#202223",
                                  fontFamily: "inherit",
                                }}
                              >
                                <span style={{
                                  display: "block",
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  background: pendingRange === child.value ? "#f3f3f3" : "transparent",
                                }}>
                                  {child.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Right: date inputs + multiMonth DatePicker */}
                <div style={{ flex: 1, padding: 20, minWidth: 0 }}>
                  {/* Date row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      readOnly
                      value={rangeDates.start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      style={{ flex: 1, padding: "10px 14px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, background: "#fff", color: "#202223", fontFamily: "inherit" }}
                    />
                    <span style={{ color: "#6d7175", fontSize: 18, flexShrink: 0 }}>→</span>
                    <input
                      type="text"
                      readOnly
                      value={rangeDates.end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      style={{ flex: 1, padding: "10px 14px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, background: "#fff", color: "#202223", fontFamily: "inherit" }}
                    />
                    <button
                      onClick={() => setShowTimeRow((v) => !v)}
                      style={{
                        padding: "9px 10px", border: "1px solid #c9cccf", borderRadius: 8,
                        background: showTimeRow ? "#f3f3f3" : "#fff",
                        cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0,
                      }}
                    >
                      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke={showTimeRow ? "#202223" : "#6d7175"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/>
                      </svg>
                    </button>
                  </div>
                  {/* Time row */}
                  {showTimeRow && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid #c9cccf", borderRadius: 8, background: "#fff" }}>
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#6d7175" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/>
                        </svg>
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: 14, color: "#202223", fontFamily: "inherit", background: "transparent", width: "100%" }}
                        />
                      </div>
                      <span style={{ color: "#6d7175", fontSize: 18, flexShrink: 0 }}>→</span>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid #c9cccf", borderRadius: 8, background: "#fff" }}>
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#6d7175" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/>
                        </svg>
                        <input
                          type="text"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: 14, color: "#202223", fontFamily: "inherit", background: "transparent", width: "100%" }}
                        />
                      </div>
                    </div>
                  )}
                  {!showTimeRow && <div style={{ marginBottom: 12 }} />}
                  {/* Fix 2: start from previous month so left=prev, right=current */}
                  <DatePicker
                    month={rangeMonth}
                    year={rangeYear}
                    selected={rangeDates}
                    onMonthChange={(m, y) => { setRangeMonth(m); setRangeYear(y); }}
                    onChange={(range) => setRangeDates(range)}
                    allowRange
                    multiMonth
                  />
                </div>
              </div>
              {/* Footer */}
              <div style={{ borderTop: "1px solid #e1e3e5", padding: "14px 20px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button onClick={() => setRangeOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleRangeApply}>Apply</Button>
              </div>
            </div>
          )}

          {/* Fix 7: compare pill with correct label */}
          <Popover
            active={dateOpen}
            activator={dateActivator}
            onClose={() => setDateOpen(false)}
            preferredAlignment="left"
          >
            <div style={{ width: 320, paddingTop: 8, paddingBottom: 8 }}>
              {COMPARISONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setSelectedComparison(c.value); setDateOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 16px",
                    border: "none",
                    background: selectedComparison === c.value ? "#f1f1f1" : "transparent",
                    fontWeight: selectedComparison === c.value ? 600 : 400,
                    fontSize: 14,
                    cursor: "pointer",
                    color: "#202223",
                    fontFamily: "inherit",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Popover>

          <Popover
            active={currencyOpen}
            activator={currencyActivator}
            onClose={() => setCurrencyOpen(false)}
          >
            <ActionList
              actionRole="menuitem"
              items={CURRENCIES.map((c) => ({
                content: c.label,
                active: c.code === currency,
                onAction: () => {
                  setCurrency(c.code);
                  setCurrencyOpen(false);
                },
              }))}
            />
          </Popover>
        </InlineStack>

        {/* Top stats */}
        <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
          <StatCard
            title="Gross sales"
            value={fmt(14102.8)}
            reportUrl="/admin/analytics/reports/gross-sales"
          />
          <StatCard
            title="Returning customer rate"
            value="32.4%"
            reportUrl="/admin/analytics/reports/returning-customer-rate"
          />
          <StatCard
            title="Orders fulfilled"
            value="38"
            reportUrl="/admin/analytics/reports/orders-fulfilled"
          />
          <StatCard title="Orders" value="42" reportUrl="/admin/analytics/reports/orders" />
        </InlineGrid>

        {/* Total sales over time + breakdown */}
        <InlineGrid columns={{ xs: 1, lg: "2fr 1fr" }} gap="400">
          <ChartCard
            title="Total sales over time"
            value={fmt(12847.32)}
            showChart
            reportUrl="/admin/analytics/reports/total-sales"
            showComparison={showComparison}
            mainDateLabel={mainDateLabel}
            compDateLabel={compDateLabel}
          />
          <BreakdownCard
            title="Total sales breakdown"
            items={salesBreakdown.map((item) => ({
              label: item.label,
              formattedValue: fmt(item.amount),
              slug: item.slug,
            }))}
          />
        </InlineGrid>

        {/* Three chart row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard
            title="Total sales by sales channel"
            reportUrl="/admin/analytics/reports/sales-by-channel"
          />
          <ChartCard
            title="Average order value over time"
            value={fmt(305.89)}
            showChart
            chartType="line"
            reportUrl="/admin/analytics/reports/average-order-value"
            showComparison={showComparison}
            mainDateLabel={mainDateLabel}
            compDateLabel={compDateLabel}
          />
          <ChartCard
            title="Total sales by product"
            reportUrl="/admin/analytics/reports/sales-by-product"
          />
        </InlineGrid>

        {/* Sessions + conversion row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard
            title="Sessions over time"
            value="1,204"
            showChart
            reportUrl="/admin/analytics/reports/sessions"
            showComparison={showComparison}
            mainDateLabel={mainDateLabel}
            compDateLabel={compDateLabel}
          />
          <ChartCard
            title="Conversion rate over time"
            value="3.5%"
            showChart
            reportUrl="/admin/analytics/reports/conversion-rate"
            showComparison={showComparison}
            mainDateLabel={mainDateLabel}
            compDateLabel={compDateLabel}
          />
          <ConversionBreakdownCard reportUrl="/admin/analytics/reports/conversion-rate" />
        </InlineGrid>

        {/* Device / location / social */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard
            title="Sessions by device type"
            reportUrl="/admin/analytics/reports/sessions-by-device"
          />
          <ChartCard
            title="Sessions by location"
            reportUrl="/admin/analytics/reports/sessions-by-location"
          />
          <ChartCard
            title="Total sales by social referrer"
            reportUrl="/admin/analytics/reports/sales-by-social-referrer"
          />
        </InlineGrid>

        {/* Cohort + landing page */}
        <InlineGrid columns={{ xs: 1, lg: "2fr 1fr" }} gap="400">
          <CohortCard reportUrl="/admin/analytics/reports/customer-cohorts" />
          <ChartCard
            title="Sessions by landing page"
            reportUrl="/admin/analytics/reports/sessions-by-landing-page"
          />
        </InlineGrid>

        {/* Referrer row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard
            title="Sessions by social referrer"
            reportUrl="/admin/analytics/reports/sessions-by-social-referrer"
          />
          <ChartCard
            title="Total sales by referrer"
            reportUrl="/admin/analytics/reports/sales-by-referrer"
          />
          <ChartCard
            title="Performance by referring channel"
            reportUrl="/admin/analytics/reports/performance-by-channel"
          />
        </InlineGrid>

        {/* Bottom row */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard
            title="Sessions by referrer"
            reportUrl="/admin/analytics/reports/sessions-by-referrer"
          />
          <ChartCard
            title="Total sales by POS location"
            reportUrl="/admin/analytics/reports/sales-by-pos-location"
          />
          <ChartCard
            title="Products by sell-through rate"
            reportUrl="/admin/analytics/reports/sell-through-rate"
          />
        </InlineGrid>

        {/* POS staff */}
        <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
          <ChartCard
            title="POS staff sales total"
            reportUrl="/admin/analytics/reports/pos-staff-sales"
          />
        </InlineGrid>

        {/* Footer */}
        <Box paddingBlock="400">
          <Text as="p" variant="bodySm" alignment="center">
            Learn more about <Link url="/admin/analytics/learn">analytics</Link>
          </Text>
        </Box>
      </BlockStack>
    </Page>
  );
}
