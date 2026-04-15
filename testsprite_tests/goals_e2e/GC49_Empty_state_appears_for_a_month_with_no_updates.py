import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC49 — Empty state appears for a month with no updates
# Route: /goals/status-updates
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals/status-updates
# 3. Click prev-month until a month with no updates is reached (cap at 12 attempts)
# Plan assertion: 'No updates for <MONTH>' empty-state is visible

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

        await page.goto("http://localhost:3000/goals/status-updates")
        # Prev-month button: immediate preceding sibling button of the h2 month heading.
        prev_btn = page.locator("h2").first.locator("xpath=preceding-sibling::button[1]")
        found = False
        for _ in range(14):
            await prev_btn.click()
            await asyncio.sleep(0.8)
            if await page.get_by_text(re.compile(r"No updates (for|in)")).count() > 0:
                found = True
                break
        assert found, "Never reached a month with 'No updates for ...' empty state"

        print("GC49: PASS")

    except Exception as e:
        print(f"GC49: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
