import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC31 — View mode toggle offers List and Card
# Route: /goals/following
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals/following
# Plan assertion: Two view-mode buttons are visible; one corresponds to list, one to card layout

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

        await page.goto("http://localhost:3000/goals/following")
        await asyncio.sleep(1.5)  # let SPA hydrate so Tailwind classes are attached
        # View-mode toggle: two adjacent icon-only buttons in main with rounded-l-md + rounded-r-md.
        # Use two separate locators (comma-CSS can be finicky for class matches in Playwright)
        left = page.locator('main button[class*="rounded-l-md"]')
        right = page.locator('main button[class*="rounded-r-md"]')
        left_count = await left.count()
        right_count = await right.count()
        assert left_count >= 1 and right_count >= 1, (
            f"Expected both rounded-l-md and rounded-r-md view-mode buttons "
            f"(got left={left_count}, right={right_count})"
        )

        print("GC31: PASS")

    except Exception as e:
        print(f"GC31: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
