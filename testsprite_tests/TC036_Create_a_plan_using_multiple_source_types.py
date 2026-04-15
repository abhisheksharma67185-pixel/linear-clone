import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC036 — Create a plan using multiple source types
# Category: Plans and Roadmap
# Priority: Medium
# Plan description: Verifies a user can select multiple work source types (space, board, filter) when creating a plan and the plan is created successfully.
#
# Steps:
# 1. /login
# 2. email
# 3. password (skip)
# 4. submit
# 5. Click sidebar plans
# 6. Open create-plan form
# 7. Fill plan name "Multi-Source Plan Beta"
# 8. Select a work source of type space
# 9. Select a work source of type board
# 10. Select a work source of type filter
# 11. Select access level
# 12. Submit create-plan form
# 13. ASSERT: new plan appears in plans list
#
# SCAFFOLD STATUS: Placeholder locators.
# Plans route: /plans.

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
        await page.goto("http://localhost:3000/plans")

        plan_name = "Multi-Source Plan Beta"

        # -> Step 6: open create-plan form
        frame = context.pages[-1]
        # TODO(locator): "Create plan" / "New plan" button on /plans
        create_plan_btn = frame.locator('xpath=TODO_CREATE_PLAN_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await create_plan_btn.click()

        # -> Step 7: fill plan name
        frame = context.pages[-1]
        # TODO(locator): name input in create-plan dialog
        name_input = frame.locator('xpath=TODO_PLAN_NAME_INPUT_XPATH').nth(0)
        await asyncio.sleep(3); await name_input.fill(plan_name)

        # -> Step 8: space source
        frame = context.pages[-1]
        # TODO(locator): "Add source" -> select type "Space" -> pick a space
        space_source_btn = frame.locator('xpath=TODO_ADD_SPACE_SOURCE_XPATH').nth(0)
        await asyncio.sleep(3); await space_source_btn.click()

        # -> Step 9: board source
        frame = context.pages[-1]
        # TODO(locator): "Add source" -> Board
        board_source_btn = frame.locator('xpath=TODO_ADD_BOARD_SOURCE_XPATH').nth(0)
        await asyncio.sleep(3); await board_source_btn.click()

        # -> Step 10: filter source
        frame = context.pages[-1]
        # TODO(locator): "Add source" -> Filter
        filter_source_btn = frame.locator('xpath=TODO_ADD_FILTER_SOURCE_XPATH').nth(0)
        await asyncio.sleep(3); await filter_source_btn.click()

        # -> Step 11: select access level (e.g., "Open" / "Restricted")
        frame = context.pages[-1]
        # TODO(locator): access-level select or radio
        access_level = frame.locator('xpath=TODO_ACCESS_LEVEL_XPATH').nth(0)
        await asyncio.sleep(3); await access_level.click()

        # -> Step 12: submit
        frame = context.pages[-1]
        # TODO(locator): submit / Create button in dialog
        submit_plan_btn = frame.locator('xpath=TODO_SUBMIT_PLAN_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await submit_plan_btn.click()

        # --> Assertion: new plan in list
        await page.goto("http://localhost:3000/plans")
        frame = context.pages[-1]
        plan_link = frame.get_by_role('link', name=plan_name)
        await expect(plan_link.first).to_be_visible()
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
