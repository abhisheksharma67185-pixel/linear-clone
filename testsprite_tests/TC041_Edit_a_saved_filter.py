import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC041 — Edit a saved filter
# Category: Filters (Saved Searches)
# Priority: Medium
# Plan description: Edits an existing saved filter and confirms the updated filter details are reflected in the UI.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Sidebar -> filters
# 6. Start creating a new filter
# 7. Fill query criteria
# 8. Fill unique filter name
# 9. Save
# 10. Open the saved filter
# 11. Enter edit mode
# 12. Update filter name with a different value
# 13. Save changes
# 14. ASSERT: saved filter reflects the updated name

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

        original_name = "tc041-orig"
        updated_name = "tc041-edited"

        # -> Step 6
        frame = context.pages[-1]
        # TODO(locator): create-filter button on /filters
        create_btn = frame.locator('xpath=TODO_CREATE_FILTER_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await create_btn.click()

        # -> Step 7
        frame = context.pages[-1]
        # TODO(locator): filter criteria input
        criteria_input = frame.locator('xpath=TODO_CRITERIA_INPUT_XPATH').nth(0)
        await asyncio.sleep(3); await criteria_input.fill('status: Open')

        # -> Step 8
        frame = context.pages[-1]
        # TODO(locator): filter name input
        name_input = frame.locator('xpath=TODO_FILTER_NAME_INPUT_XPATH').nth(0)
        await asyncio.sleep(3); await name_input.fill(original_name)

        # -> Step 9
        frame = context.pages[-1]
        # TODO(locator): save button
        save_btn = frame.locator('xpath=TODO_SAVE_FILTER_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await save_btn.click()

        # -> Step 10: open the saved filter
        frame = context.pages[-1]
        await asyncio.sleep(3); await frame.get_by_role('link', name=original_name).first.click()

        # -> Step 11: enter edit mode
        frame = context.pages[-1]
        # TODO(locator): edit button in filter detail header / overflow menu
        edit_btn = frame.locator('xpath=TODO_EDIT_FILTER_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await edit_btn.click()

        # -> Step 12: update name
        frame = context.pages[-1]
        # TODO(locator): editable name field (may be same input as create)
        edit_name_input = frame.locator('xpath=TODO_EDIT_FILTER_NAME_INPUT_XPATH').nth(0)
        await asyncio.sleep(3); await edit_name_input.fill(updated_name)

        # -> Step 13: save changes
        frame = context.pages[-1]
        # TODO(locator): save button in edit dialog
        save_changes_btn = frame.locator('xpath=TODO_SAVE_FILTER_CHANGES_BUTTON_XPATH').nth(0)
        await asyncio.sleep(3); await save_changes_btn.click()

        # --> Assertion
        await page.goto("http://localhost:3000/filters")
        frame = context.pages[-1]
        updated_count = await frame.get_by_role('link', name=updated_name).count()
        original_count = await frame.get_by_role('link', name=original_name).count()
        assert updated_count >= 1, f"Updated filter name {updated_name} not found"
        assert original_count == 0, f"Original name {original_name} should be replaced"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
