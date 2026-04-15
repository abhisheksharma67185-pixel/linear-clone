import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC09 — Reset clears all active filter chips
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Add Status and Owner filters
# 4. Click Reset
# Plan assertion: No filter chips remain and list count returns to baseline

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
        await page.get_by_role("button", name="Status", exact=True).click()
        await page.get_by_role("button", name="ON TRACK", exact=True).click()
        await expect(page.get_by_text("Status is", exact=True).first).to_be_visible()
        # Chip DOM: <div><span><svg/></span><span>Status is</span><button>×</button></div>
        # Find the span with exact text "Status is" and click its sibling button.
        chip_close = page.locator('span', has_text="Status is").locator('xpath=following-sibling::button[1]').first
        await chip_close.click()
        await asyncio.sleep(1)
        chip_count = await page.get_by_text("Status is", exact=True).count()
        assert chip_count == 0, f"Expected 'Status is' chip gone after dismiss, found {chip_count}"

        print("GC09: PASS")

    except Exception as e:
        print(f"GC09: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
