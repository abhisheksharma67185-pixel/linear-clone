import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC040 — Filter dashboards by owner
# Category: Dashboards
# Priority: Medium
# Plan description: Applies an owner filter on the dashboards list and shows only dashboards matching the selected owner.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Sidebar -> dashboards
# 6. Open owner filter control
# 7. Select an owner option
# 8. ASSERT: dashboards list shows only dashboards for the selected owner

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=["--window-size=1280,720", "--disable-dev-shm-usage", "--ipc=host", "--single-process"],
        )
        context = await browser.new_context()
        context.set_default_timeout(5000)
        page = await context.new_page()

        # Login
        await page.goto("http://localhost:3000/login")
        frame = context.pages[-1]
        await asyncio.sleep(3); await frame.locator('xpath=/html/body/div[2]/div[4]/form/div/input').nth(0).fill('example@gmail.com')
        await asyncio.sleep(3); await frame.locator('xpath=/html/body/div[2]/div[4]/form/button').nth(0).click()

        await page.goto("http://localhost:3000/dashboards")

        # -> Step 6: open owner filter
        frame = context.pages[-1]
        # TODO(locator): owner filter trigger on /dashboards toolbar
        owner_trigger = frame.locator('xpath=TODO_DASHBOARDS_OWNER_FILTER_TRIGGER_XPATH').nth(0)
        await asyncio.sleep(3); await owner_trigger.click()

        # -> Step 7: pick an owner
        frame = context.pages[-1]
        # TODO(locator): first owner option in popover
        owner_option = frame.locator('xpath=TODO_OWNER_OPTION_XPATH').nth(0)
        await asyncio.sleep(3); await owner_option.click()

        # --> Assertion
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert "/dashboards" in current_url, f"Expected /dashboards, got {current_url}"
        # TODO(assert): every visible row's owner column matches selected owner
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
