import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC046 — Follow and unfollow a goal
# Category: Goals / OKR Tracking
# Priority: Low
# Plan description: Toggles follow state for a goal and confirms the UI follow indicator updates accordingly.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Sidebar -> goals
# 6. Open a goal from the list
# 7. Toggle follow control to follow
# 8. Toggle follow control again to unfollow
# 9. ASSERT: goal shown as not followed

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

        await page.goto("http://localhost:3000/goals")

        # -> Step 6: open a goal
        frame = context.pages[-1]
        # TODO(locator): first goal row link on /goals
        goal_link = frame.locator('xpath=TODO_FIRST_GOAL_ROW_LINK_XPATH').nth(0)
        await asyncio.sleep(3); await goal_link.click()

        # -> Step 7: follow
        frame = context.pages[-1]
        # TODO(locator): follow toggle button in goal detail header
        follow_btn = frame.locator('xpath=TODO_FOLLOW_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await follow_btn.click()

        # -> Step 8: unfollow (same button)
        frame = context.pages[-1]
        # TODO(locator): after follow, button may say "Following" — click to unfollow
        unfollow_btn = frame.locator('xpath=TODO_FOLLOW_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await unfollow_btn.click()

        # --> Assertion: goal not followed
        frame = context.pages[-1]
        # TODO(assert): check button text is "Follow" (not "Following"), or aria-pressed="false"
        follow_label = frame.get_by_role('button', name="Follow")
        await expect(follow_label.first).to_be_visible()
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
