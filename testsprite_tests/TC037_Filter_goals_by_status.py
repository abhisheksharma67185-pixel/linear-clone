import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC037 — Filter goals by status
# Category: Goals / OKR Tracking
# Priority: Medium
# Plan description: Filters the goals list by a selected status and updates the list accordingly.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Sidebar -> goals
# 6. Open status filter control
# 7. Select a status option
# 8. ASSERT: goals list shows only goals matching status

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

        # -> Step 5
        await page.goto("http://localhost:3000/goals")

        # -> Step 6
        frame = context.pages[-1]
        # TODO(locator): status filter trigger on goals toolbar
        status_trigger = frame.locator('xpath=TODO_STATUS_FILTER_TRIGGER_XPATH').nth(0)
        await asyncio.sleep(3); await status_trigger.click()

        # -> Step 7
        frame = context.pages[-1]
        # TODO(locator): a status option (e.g. "On track")
        status_option = frame.locator('xpath=TODO_STATUS_OPTION_XPATH').nth(0)
        await asyncio.sleep(3); await status_option.click()

        # --> Assertion
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert "/goals" in current_url, f"Expected /goals, got {current_url}"
        # TODO(assert): every visible row shows selected status chip
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
