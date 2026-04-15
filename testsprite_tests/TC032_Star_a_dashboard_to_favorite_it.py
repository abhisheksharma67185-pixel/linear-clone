import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC032 — Star a dashboard to favorite it
# Category: Dashboards
# Priority: Medium
# Plan description: Stars a dashboard and confirms it is shown as favorited in the UI state.
#
# Steps (from testsprite_frontend_test_plan.json):
# 1. Navigate to /login
# 2. Fill email with {{LOGIN_USER}}
# 3. Fill password with {{LOGIN_PASSWORD}}   (app is email-only — skip)
# 4. Submit login
# 5. Click sidebar link to dashboards
# 6. Open a dashboard from the list
# 7. Toggle star control to favorite
# 8. ASSERT: dashboard shown as starred/favorited
#
# SCAFFOLD STATUS: Placeholder locators — fill in via browser_snapshot.
# Dashboards route: /dashboards (list), /dashboards/[id] (detail)

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process",
            ],
        )
        context = await browser.new_context()
        context.set_default_timeout(5000)
        page = await context.new_page()

        # -> Step 1: /login
        await page.goto("http://localhost:3000/login")

        # -> Step 2: email
        frame = context.pages[-1]
        email_elem = frame.locator('xpath=/html/body/div[2]/div[4]/form/div/input').nth(0)
        await asyncio.sleep(3); await email_elem.fill('example@gmail.com')

        # -> Step 4: submit
        frame = context.pages[-1]
        submit_elem = frame.locator('xpath=/html/body/div[2]/div[4]/form/button').nth(0)
        await asyncio.sleep(3); await submit_elem.click()

        # -> Step 5: navigate to dashboards list
        await page.goto("http://localhost:3000/dashboards")

        # -> Step 6: open first dashboard in list
        frame = context.pages[-1]
        # TODO(locator): first dashboard row link on /dashboards list
        dashboard_link = frame.locator('xpath=TODO_DASHBOARD_ROW_LINK_XPATH').nth(0)
        await asyncio.sleep(3); await dashboard_link.click()

        # -> Step 7: toggle star control to favorite
        frame = context.pages[-1]
        # TODO(locator): star button in dashboard detail header (aria-label likely "Star" or "Favorite")
        star_btn = frame.locator('xpath=TODO_STAR_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await star_btn.click()

        # --> Assertion: starred state visible
        frame = context.pages[-1]
        # TODO(assert): check aria-pressed="true" / filled star icon / data-starred="true"
        starred_indicator = frame.locator('xpath=TODO_STARRED_INDICATOR_XPATH').nth(0)
        await expect(starred_indicator).to_be_visible()
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
