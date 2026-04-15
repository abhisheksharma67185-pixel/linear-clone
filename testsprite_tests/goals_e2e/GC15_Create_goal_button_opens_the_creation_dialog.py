import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC15 — 'Create goal' button opens the creation dialog
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Click 'Create goal'
# Plan assertion: A dialog with a Name input and a Create submit button is visible

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
        # Dialog is a fixed overlay (not role=dialog); scope by the overlay container.
        overlay = page.locator('div.fixed.inset-0.z-50').first
        await expect(overlay).to_be_visible()
        await expect(overlay.get_by_placeholder("e.g. Increase revenue by 20%")).to_be_visible()
        # Submit button "Create" lives inside the overlay (not the top-nav Create)
        await expect(overlay.get_by_role("button", name="Create", exact=True)).to_be_visible()

        print("GC15: PASS")

    except Exception as e:
        print(f"GC15: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
