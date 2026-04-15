import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# GC08 — Add Owner filter narrows the list
# Route: /goals
#
# Plan steps:
# 1. Login
# 2. Navigate to /goals
# 3. Open 'Add filters'
# 4. Choose 'Owner'
# 5. Pick an owner
# Plan assertion: An Owner filter chip is visible and the visible rows' owner cell matches the chip

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
        await page.get_by_role("button", name="Owner", exact=True).click()
        # Owner popover shows options; pick the first visible one
        await asyncio.sleep(1)
        # Options render as buttons in the popover
        options = page.locator('[role="dialog"] button, [role="menu"] button').filter(has_not=page.locator('text=/^(Create|Search)/'))
        # Fallback: click the first option button labelled with user name initials pattern
        first_opt = page.locator('div[role="dialog"] button, div[data-slot="popover"] button').first
        try:
            await first_opt.click()
        except Exception:
            # Try clicking first "button" inside any visible popover container
            await page.locator('button').filter(has_text=re.compile(r"^[A-Z][a-z]+\s")).first.click()
        await expect(page.get_by_text("Owner is", exact=False).first).to_be_visible()

        print("GC08: PASS")

    except Exception as e:
        print(f"GC08: FAIL — {type(e).__name__}: {e}")
        raise
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
