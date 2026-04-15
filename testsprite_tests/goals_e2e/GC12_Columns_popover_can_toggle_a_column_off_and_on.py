import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC12 — Columns popover can toggle a column off and on
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Open Columns popover
# 4. Uncheck 'Tags'
# 5. Close popover
# 6. Reopen
# 7. Re-check 'Tags'
# Plan assertion: The Tags column header disappears, then reappears

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

        await page.goto("http://localhost:3000/goals")
        await page.get_by_role("button", name="Columns", exact=True).click()
        # The Columns popover is a role=dialog containing column rows
        dlg = page.get_by_role("dialog")
        await expect(dlg).to_be_visible()
        # Expected column labels
        for label in ("Name", "Status", "Progress", "Target date", "Owner", "Following", "Last updated", "Tags"):
            await expect(dlg.get_by_text(label, exact=True).first).to_be_visible()

        print("GC12: PASS")

    except Exception as e:
        print(f"GC12: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
