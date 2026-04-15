import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC033 — Filter backlog by epic
# Category: Sprint Backlog Management
# Priority: Medium
# Plan description: User can filter the backlog by epic and see the backlog contents update to match the selected epic filter.
#
# Steps:
# 1. /login
# 2. email
# 3. password (skip)
# 4. submit
# 5. Click sidebar projects
# 6. Select a project
# 7. Click backlog tab
# 8. Select an epic value in the backlog epic filter
# 9. ASSERT: backlog list updates to match the filter
#
# SCAFFOLD STATUS: Placeholder locators.
# Backlog route: /projects/[key]/backlog. Default project key: SCRUM.

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

        # -> Step 5-7: navigate directly to SCRUM backlog
        await page.goto("http://localhost:3000/projects/SCRUM/backlog")

        # -> Step 8: open epic filter and select a value
        frame = context.pages[-1]
        # TODO(locator): epic filter trigger button on backlog toolbar
        epic_filter_btn = frame.locator('xpath=TODO_EPIC_FILTER_TRIGGER_XPATH').nth(0)
        await asyncio.sleep(3); await epic_filter_btn.click()

        frame = context.pages[-1]
        # TODO(locator): first epic option in dropdown
        epic_option = frame.locator('xpath=TODO_EPIC_OPTION_XPATH').nth(0)
        await asyncio.sleep(3); await epic_option.click()

        # --> Assertion: backlog list updated (at least renders without error)
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert "/backlog" in current_url, f"Expected backlog URL, got {current_url}"
        # TODO(assert): verify visible issues all belong to selected epic (check epic chip on cards)
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
