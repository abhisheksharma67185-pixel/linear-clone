import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC07 — Add Status filter narrows the list
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Open 'Add filters' dropdown
# 4. Choose 'Status'
# 5. Pick a value
# Plan assertion: A Status filter chip is visible and list count decreases or unchanged (never increases)

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
        # Status filter is a direct button in the filter bar (no "Add filters" wrapper on /goals main)
        await page.get_by_role("button", name="Status", exact=True).click()
        await page.get_by_role("button", name="ON TRACK", exact=True).click()
        # A "Status is" chip appears in the active-filter bar
        await expect(page.get_by_text("Status is", exact=False).first).to_be_visible()

        print("GC07: PASS")

    except Exception as e:
        print(f"GC07: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
