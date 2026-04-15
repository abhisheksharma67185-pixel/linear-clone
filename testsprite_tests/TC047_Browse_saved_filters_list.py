import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC047 — Browse saved filters list
# Category: Filters (Saved Searches)
# Priority: Low
# Plan description: Loads the saved filters list and shows available filters or a clear empty state.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Sidebar -> filters
# 6. ASSERT: saved filters list displayed OR empty state shown

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

        await page.goto("http://localhost:3000/filters")

        # --> Assertion
        frame = context.pages[-1]
        # TODO(assert): filter rows OR empty state
        filter_rows = frame.locator('xpath=TODO_FILTER_ROW_XPATH')
        empty_state = frame.get_by_text("No filters", exact=False)
        rows_count = await filter_rows.count()
        empty_count = await empty_state.count()
        assert rows_count > 0 or empty_count > 0, "Neither filters list nor empty state rendered"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
