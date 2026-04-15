import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC048 — Unstar a dashboard
# Category: Dashboards
# Priority: Low
# Plan description: Unstars a previously starred dashboard and confirms it is no longer favorited in the UI state.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Sidebar -> dashboards
# 6. Open a dashboard from the list
# 7. Toggle star to favorite
# 8. Toggle star again to remove favorite
# 9. ASSERT: dashboard shown as NOT starred

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

        # -> Step 6: open first dashboard
        frame = context.pages[-1]
        # TODO(locator): first dashboard row link
        dashboard_link = frame.locator('xpath=TODO_DASHBOARD_ROW_LINK_XPATH').nth(0)
        await asyncio.sleep(3); await dashboard_link.click()

        # -> Step 7: star it
        frame = context.pages[-1]
        # TODO(locator): star button on dashboard header
        star_btn = frame.locator('xpath=TODO_STAR_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await star_btn.click()

        # -> Step 8: unstar (click same button)
        frame = context.pages[-1]
        unstar_btn = frame.locator('xpath=TODO_STAR_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await unstar_btn.click()

        # --> Assertion: not starred
        frame = context.pages[-1]
        # TODO(assert): aria-pressed="false" OR outline-star icon (not filled)
        unstarred_indicator = frame.locator('xpath=TODO_UNSTARRED_INDICATOR_XPATH').nth(0)
        await expect(unstarred_indicator).to_be_visible()
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
