import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC42 — Month navigation prev/next updates the displayed month
# Route: /goals/status-updates
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals/status-updates
# 3. Note current month label
# 4. Click next-month arrow
# Plan assertion: Month label changes to a different month

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
        # Month label is an h2 (e.g., "April"). Its flanking buttons are icon-only.
        month_heading = page.locator("h2").first
        before = (await month_heading.inner_text()).strip()
        # Next button: the button that is an immediate following sibling of the month heading
        next_btn = page.locator("h2").first.locator("xpath=following-sibling::button[1]")
        await next_btn.click()
        await asyncio.sleep(1)
        after = (await month_heading.inner_text()).strip()
        assert before != after, f"Month heading unchanged: {before!r} -> {after!r}"

        print("GC42: PASS")

    except Exception as e:
        print(f"GC42: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
