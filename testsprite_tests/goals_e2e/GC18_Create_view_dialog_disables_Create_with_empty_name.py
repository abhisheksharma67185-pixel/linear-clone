import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC18 — Create view dialog disables Create with empty name
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Click 'Create view'
# Plan assertion: Dialog opens and the 'Create' button is disabled while name is empty

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
        # Open the Create view dialog (triggered by the "Create view" button in the filter bar)
        await page.get_by_role("button", name="Create view").first.click()
        await asyncio.sleep(1)
        dlg = page.get_by_role("dialog")
        await expect(dlg).to_be_visible()
        # The submit button is labelled "Create view" (NOT "Create") and is disabled until name is non-empty
        submit = dlg.get_by_role("button", name="Create view", exact=True)
        await expect(submit).to_be_disabled()

        print("GC18: PASS")

    except Exception as e:
        print(f"GC18: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
