import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC17 — Create goal with empty name blocks submission
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Open Create goal dialog
# 4. Leave Name blank
# 5. Attempt submit
# Plan assertion: Submit button is disabled OR a validation error is visible; dialog remains open

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
        await page.get_by_role("button", name="Create goal").click()
        await asyncio.sleep(1)
        overlay = page.locator('div.fixed.inset-0.z-50').first
        await expect(overlay).to_be_visible()
        submit = overlay.get_by_role("button", name="Create", exact=True)
        # Either the Create button is disabled OR clicking it keeps the overlay visible
        disabled = await submit.is_disabled()
        if disabled:
            pass  # disabled state satisfies assertion
        else:
            await submit.click()
            await asyncio.sleep(1)
            # Overlay must still be visible (submission blocked)
            await expect(overlay).to_be_visible()

        print("GC17: PASS")

    except Exception as e:
        print(f"GC17: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
