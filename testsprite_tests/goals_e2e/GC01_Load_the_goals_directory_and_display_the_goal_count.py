import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC01 — Load the goals directory and display the goal count
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Wait for list render
# Plan assertion: A 'N goal(s)' count label is visible and N > 0

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
        count_el = page.get_by_text(re.compile(r"\d+ goals?\b"))
        await expect(count_el.first).to_be_visible()

        print("GC01: PASS")

    except Exception as e:
        print(f"GC01: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
