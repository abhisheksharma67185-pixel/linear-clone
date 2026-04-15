import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC40 — Empty state shows when search matches nothing
# Route: /goals/archived
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals/archived
# 3. Type a garbage string like 'zzz-no-match-zzz'
# Plan assertion: Empty-state copy 'We couldn't find any goals matching your search.' is visible

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
        await page.get_by_role("textbox", name="Search goals").fill("zzz-no-match-zzz")
        await asyncio.sleep(1)
        await expect(page.get_by_text("couldn't find any goals", exact=False).first).to_be_visible()

        print("GC40: PASS")

    except Exception as e:
        print(f"GC40: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
