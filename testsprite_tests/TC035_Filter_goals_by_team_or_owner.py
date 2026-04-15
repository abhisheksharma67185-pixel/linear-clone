import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC035 — Filter goals by team or owner
# Category: Goals / OKR Tracking
# Priority: Medium
# Plan description: Applies team or owner filtering on the goals list and updates the list to match the selected filter.
#
# Steps:
# 1. /login
# 2. email
# 3. password (skip)
# 4. submit
# 5. Click sidebar goals
# 6. Open filtering controls
# 7. Select a team or owner filter option
# 8. ASSERT: goals list shows only goals matching the filter
#
# SCAFFOLD STATUS: Placeholder locators.
# Goals route: /goals.

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

        # -> Step 5: goals
        await page.goto("http://localhost:3000/goals")

        # -> Step 6: open filtering controls
        frame = context.pages[-1]
        # TODO(locator): filter-bar trigger (team/owner) on /goals toolbar
        filter_trigger = frame.locator('xpath=TODO_GOALS_FILTER_TRIGGER_XPATH').nth(0)
        await asyncio.sleep(3); await filter_trigger.click()

        # -> Step 7: select a team or owner option
        frame = context.pages[-1]
        # TODO(locator): first team/owner option in open popover
        filter_option = frame.locator('xpath=TODO_GOALS_FILTER_OPTION_XPATH').nth(0)
        await asyncio.sleep(3); await filter_option.click()

        # --> Assertion: URL reflects filter or list updates
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert "/goals" in current_url, f"Expected /goals URL, got {current_url}"
        # TODO(assert): verify row count changed OR every visible goal shows selected team/owner chip
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
