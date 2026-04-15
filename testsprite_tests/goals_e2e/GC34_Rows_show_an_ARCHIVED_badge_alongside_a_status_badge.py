import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC34 — Rows show an ARCHIVED badge alongside a status badge
# Route: /goals/archived
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals/archived
# Plan assertion: At least one row renders an 'ARCHIVED' label/badge and a status label

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=["--window-size=1440,900", "--disable-dev-shm-usage", "--ipc=host", "--single-process"],
        )
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        context.set_default_timeout(8000)
        page = await context.new_page()

        # Login (email-only form on /login)
        await page.goto("http://localhost:3000/login")
        await page.get_by_role("textbox", name="Enter your email").fill("example@gmail.com")
        await page.get_by_role("button", name="Continue", exact=True).click()
        # Post-login lands on / (home). Wait briefly before navigating.
        await asyncio.sleep(1.5)

        await page.goto("http://localhost:3000/goals/archived")
        # At least one "ARCHIVED" badge
        await expect(page.get_by_text("ARCHIVED", exact=True).first).to_be_visible()
        # And at least one status badge alongside it
        found = False
        for s in ("ON TRACK", "AT RISK", "OFF TRACK", "DONE", "PAUSED", "CANCELLED", "PENDING", "COMPLETED"):
            if await page.get_by_text(s, exact=True).count() > 0:
                found = True
                break
        assert found, "No status badge found alongside ARCHIVED"

        print("GC34: PASS")

    except Exception as e:
        print(f"GC34: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
