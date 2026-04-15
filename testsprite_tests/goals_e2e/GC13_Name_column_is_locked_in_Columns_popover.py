import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC13 — Name column is locked in Columns popover
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Open Columns popover
# Plan assertion: The 'Name' entry has a lock indicator or is disabled (cannot be toggled off)

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
        dlg = page.get_by_role("dialog")
        await expect(dlg).to_be_visible()
        # Rows live as direct children of the scrollable list container.
        # The "Name" row is locked — it has no toggle button; every other row does.
        rows = dlg.locator('.max-h-80.overflow-y-auto > div')
        name_row = rows.filter(has_text="Name").first
        status_row = rows.filter(has_text="Status").first
        name_buttons = await name_row.locator('button').count()
        status_buttons = await status_row.locator('button').count()
        assert name_buttons == 0, f"Expected Name row to have 0 toggle buttons (locked), got {name_buttons}"
        assert status_buttons >= 1, f"Expected Status row to have a toggle button, got {status_buttons}"

        print("GC13: PASS")

    except Exception as e:
        print(f"GC13: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
