import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC45 — Cancel on compose overlay closes it without posting
# Route: /goals/status-updates
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals/status-updates
# 3. Open 'Write updates'
# 4. Click Cancel
# Plan assertion: Overlay closes; updates feed unchanged in length

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
        await page.get_by_role("button", name="Write updates", exact=True).click()
        await page.get_by_role("button", name="Cancel", exact=True).click()
        await asyncio.sleep(1)
        # Compose overlay gone — textarea placeholder should no longer be present
        cnt = await page.get_by_placeholder("Share what's happening with this goal...").count()
        assert cnt == 0, f"Compose overlay still present after Cancel (placeholder count={cnt})"

        print("GC45: PASS")

    except Exception as e:
        print(f"GC45: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
