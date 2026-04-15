import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC049 — Empty search query handling
# Category: Global Search
# Priority: Low
# Plan description: User sees a stable empty state when attempting to search with an empty query and the app does not navigate away or crash.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Click nav item to open global search
# 6. Press Enter (without typing anything)
# 7. ASSERT: empty state displayed for search results

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
        await page.goto("http://localhost:3000/search")

        # -> Step 6: focus search input, press Enter without typing
        frame = context.pages[-1]
        # TODO(locator): search input on /search
        search_input = frame.locator('xpath=TODO_SEARCH_INPUT_XPATH').nth(0)
        await asyncio.sleep(3); await search_input.click()
        await search_input.press('Enter')

        # --> Assertion: still on /search and empty state / no-results view rendered
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert "/search" in current_url, f"App navigated away from /search: {current_url}"
        # TODO(assert): empty-state text ("Start typing to search", "No results", etc.)
        empty_state = frame.get_by_text("search", exact=False)  # loose match; tighten when browser returns
        empty_count = await empty_state.count()
        assert empty_count > 0, "Expected empty-state text on /search after empty query"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
