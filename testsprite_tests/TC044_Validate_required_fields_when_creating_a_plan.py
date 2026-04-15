import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC044 — Validate required fields when creating a plan
# Category: Plans and Roadmap
# Priority: Low
# Plan description: Verifies the plan creation form prevents submission when required fields are missing and shows a validation error.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Sidebar -> plans
# 6. Open create-plan form
# 7. Submit form WITHOUT filling required fields
# 8. ASSERT: form validation error visible

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

        await page.goto("http://localhost:3000/plans")

        # -> Step 6: open create-plan form
        frame = context.pages[-1]
        # TODO(locator): create-plan button on /plans
        create_plan_btn = frame.locator('xpath=TODO_CREATE_PLAN_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await create_plan_btn.click()

        # -> Step 7: submit empty form
        frame = context.pages[-1]
        # TODO(locator): submit button in plan dialog
        submit_btn = frame.locator('xpath=TODO_SUBMIT_PLAN_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await submit_btn.click()

        # --> Assertion: validation error visible
        frame = context.pages[-1]
        # TODO(assert): find error text near name field ("required", "Please enter", etc.)
        error_text = frame.get_by_text("required", exact=False)
        await expect(error_text.first).to_be_visible()
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
