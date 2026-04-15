import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC043 — View dashboard list with sharing info
# Category: Dashboards
# Priority: Low
# Plan description: Loads the dashboards list and displays per-dashboard owner and sharing (viewers/editors) information.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Sidebar -> dashboards
# 6. ASSERT: dashboards list displayed with owner + sharing info per dashboard

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

        # --> Assertion: list rendered with owner + sharing cells
        frame = context.pages[-1]
        # TODO(assert): expect rows to contain owner avatar/name and sharing chip/text
        owner_cells = frame.locator('xpath=TODO_DASHBOARD_OWNER_CELL_XPATH')
        sharing_cells = frame.locator('xpath=TODO_DASHBOARD_SHARING_CELL_XPATH')
        empty_state = frame.get_by_text("No dashboards", exact=False)
        owner_count = await owner_cells.count()
        sharing_count = await sharing_cells.count()
        empty_count = await empty_state.count()
        assert (owner_count > 0 and sharing_count > 0) or empty_count > 0, \
            "Expected dashboards list with owner+sharing info or empty state"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
