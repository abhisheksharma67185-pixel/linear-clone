import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC20 — Detail view header shows goal name + status badge
# Route: /goals/[id]
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Open first goal detail
# Plan assertion: Heading text is non-empty and a status badge is visible in the header

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
        await page.locator('a[href^="/goals/goal-"]').first.click()
        await asyncio.sleep(2)
        # Detail view has an h1 with the goal name
        heading_text = (await page.locator("h1").first.inner_text()).strip()
        assert heading_text, "Detail heading is empty"
        # And a status badge (one of the known labels) visible somewhere near the heading
        found = False
        for s in ("ON TRACK", "AT RISK", "OFF TRACK", "DONE", "PAUSED", "CANCELLED", "PENDING", "COMPLETED"):
            if await page.get_by_text(s, exact=True).count() > 0:
                found = True
                break
        assert found, "No status badge found on detail view"

        print("GC20: PASS")

    except Exception as e:
        print(f"GC20: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
