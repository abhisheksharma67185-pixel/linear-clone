import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC21 — Detail sidebar shows Owner, Team, Target date, Progress
# Route: /goals/[id]
#
# Plan steps:
# 1. Login
# 2. Open any /goals/[id]
# Plan assertion: Labels 'Status', 'Progress', 'Owner', 'Team', 'Target date' are all visible in the sidebar

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
        for label in ("Status", "Progress", "Owner", "Team", "Target date"):
            await expect(page.get_by_text(label, exact=True).first).to_be_visible()

        print("GC21: PASS")

    except Exception as e:
        print(f"GC21: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
