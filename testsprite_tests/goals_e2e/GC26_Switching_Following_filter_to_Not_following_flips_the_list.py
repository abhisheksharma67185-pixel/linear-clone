import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC26 — Switching 'Following' filter to 'Not following' flips the list
# Route: /goals/following
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals/following
# 3. Open Following filter dropdown
# 4. Choose 'Not following'
# Plan assertion: Visible rows no longer match the original following set (or count changes)

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
        await asyncio.sleep(1)
        baseline = await page.get_by_text(re.compile(r"\d+ goals?\b")).first.inner_text()
        # "Following" chip is a button in the filter bar; click it to open a dropdown MENU.
        # The options inside the menu are role=menuitem (not buttons).
        await page.get_by_role("button", name="Following", exact=True).click()
        await asyncio.sleep(0.5)
        await page.get_by_role("menuitem", name="Not following", exact=True).click()
        await asyncio.sleep(1)
        after = await page.get_by_text(re.compile(r"\d+ goals?\b")).first.inner_text()
        assert after != baseline, f"Switching to 'Not following' did not change count: {baseline!r}"

        print("GC26: PASS")

    except Exception as e:
        print(f"GC26: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
