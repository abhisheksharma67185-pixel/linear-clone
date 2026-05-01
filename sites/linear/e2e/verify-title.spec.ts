import { test, expect } from "@playwright/test"

const SECTIONS: Array<{ section: string; title: string }> = [
  { section: "preferences", title: "Preferences" },
  { section: "profile", title: "Profile" },
  { section: "initiatives", title: "Initiatives" },
  { section: "pulse", title: "Pulse" },
  { section: "applications", title: "Applications" },
  { section: "connected-accounts", title: "Connected accounts" },
]

for (const { section, title } of SECTIONS) {
  test(`tab title for ?section=${section} is "${title}" from initial HTML`, async ({
    page,
  }) => {
    // Capture the title parsed from the SSR response BEFORE any client JS
    // hydrates — that's the title the browser tab shows during the F5 →
    // JS-load gap. If this comes back as the URL or "localhost", the bug
    // (round 5 regression) is back.
    const response = await page.goto(
      `http://localhost:3000/settings?section=${section}`,
      { waitUntil: "commit" }
    )
    expect(response?.ok()).toBeTruthy()
    const html = await response!.text()
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/)
    expect(match, "SSR HTML must contain a <title> tag").not.toBeNull()
    expect(match![1]).toBe(title)
  })
}
