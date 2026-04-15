import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC039 — View issue history and activity feed
# Category: Issue Detail View
# Priority: Medium
# Plan description: User can view an issue's change history and activity feed on the issue detail view.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Click nav item to open global search
# 6. Fill valid search term
# 7. Click an issue result
# 8. ASSERT: issue activity feed and change history displayed

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

        # -> Step 6: fill search
        frame = context.pages[-1]
        # TODO(locator): search input on /search
        search_input = frame.locator('xpath=TODO_SEARCH_INPUT_XPATH').nth(0)
        await asyncio.sleep(3); await search_input.fill('login')

        # -> Step 7: click an issue result (Issues group)
        frame = context.pages[-1]
        # TODO(locator): first result under "Issues" group heading
        issue_result = frame.locator('xpath=TODO_ISSUE_RESULT_XPATH').nth(0)
        await asyncio.sleep(3); await issue_result.click()

        # --> Assertion: activity + history visible
        frame = context.pages[-1]
        # TODO(assert): find "Activity" or "History" tab / section heading
        activity_section = frame.get_by_text("Activity", exact=False)
        await expect(activity_section.first).to_be_visible()
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
