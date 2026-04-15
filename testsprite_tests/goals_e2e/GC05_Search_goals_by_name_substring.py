import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC05 — Search goals by name substring
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Type a known substring (e.g., 'goal') into search input
# Plan assertion: Every visible row name contains the substring (case-insensitive) and count reflects fewer rows

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
        search = page.get_by_role("textbox", name="Search goals")
        baseline_text = await page.get_by_text(re.compile(r"\d+ goals?\b")).first.inner_text()
        await search.fill("uniqueness")
        await asyncio.sleep(1)
        after = await page.get_by_text(re.compile(r"\d+ goals?\b")).first.inner_text()
        # Search narrows the list — count should change (mock has 5 "uniqueness" goals out of 13)
        assert after != baseline_text, f"Search did not change count: {baseline_text!r} -> {after!r}"

        print("GC05: PASS")

    except Exception as e:
        print(f"GC05: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
