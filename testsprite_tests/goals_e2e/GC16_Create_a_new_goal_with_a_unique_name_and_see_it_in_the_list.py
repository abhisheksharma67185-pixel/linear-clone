import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC16 — Create a new goal with a unique name and see it in the list
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Open Create goal dialog
# 4. Fill Name = 'E2E-Goal-' + timestamp
# 5. Submit
# Plan assertion: Dialog closes; new goal name is visible in the list after refresh/re-render

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

        import time
        new_name = f"E2E-Goal-{int(time.time())}"
        await page.goto("http://localhost:3000/goals")
        await page.get_by_role("button", name="Create goal").click()
        await asyncio.sleep(1)
        overlay = page.locator('div.fixed.inset-0.z-50').first
        await overlay.get_by_placeholder("e.g. Increase revenue by 20%").fill(new_name)
        await overlay.get_by_role("button", name="Create", exact=True).click()
        await asyncio.sleep(2)
        # After create, new goal should be listed. Reload to ensure list is fresh.
        await page.reload()
        await asyncio.sleep(2)
        await expect(page.get_by_text(new_name, exact=False).first).to_be_visible()

        print("GC16: PASS")

    except Exception as e:
        print(f"GC16: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
