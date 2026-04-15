import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC031 — Navigate to a project from global search results
# Category: Global Search
# Priority: Medium
# Plan description: User can open a project result from global search and land on a project page.
#
# Steps (from testsprite_frontend_test_plan.json):
# 1. Navigate to /login
# 2. Fill in the email field with {{LOGIN_USER}}
# 3. Fill in the password field with {{LOGIN_PASSWORD}}   (app is email-only — skip)
# 4. Submit the login form
# 5. Click the navigation item to open global search
# 6. Fill a valid search term into the search input
# 7. Click a project result in the results list
# 8. ASSERT: project view is displayed (board, backlog, or summary)
#
# SCAFFOLD STATUS: Placeholder locators — replace TODO XPaths via browser snapshot when browser is back.
# App conventions:
#   - Login is email-only. Test email: example@gmail.com
#   - Search route: /search. Project routes: /projects/[key](/board|/backlog|/summary)
#   - Left sidebar nav root: xpath=/html/body/div[2]/div/div[2]/div/div[2]

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

        # -> Step 1: Navigate to /login
        await page.goto("http://localhost:3000/login")

        # -> Step 2: Fill email with example@gmail.com
        frame = context.pages[-1]
        email_elem = frame.locator('xpath=/html/body/div[2]/div[4]/form/div/input').nth(0)
        await asyncio.sleep(3); await email_elem.fill('example@gmail.com')

        # -> Step 4: Submit login form
        frame = context.pages[-1]
        submit_elem = frame.locator('xpath=/html/body/div[2]/div[4]/form/button').nth(0)
        await asyncio.sleep(3); await submit_elem.click()

        # -> Step 5: Open global search (sidebar "Search" link OR direct nav)
        # TODO(locator): sidebar Search button — capture via browser_snapshot
        await page.goto("http://localhost:3000/search")

        # -> Step 6: Fill search input with a valid term
        frame = context.pages[-1]
        # TODO(locator): main search input on /search page
        search_input = frame.locator('xpath=TODO_SEARCH_INPUT_XPATH').nth(0)
        await asyncio.sleep(3); await search_input.fill('SCRUM')

        # -> Step 7: Click a project result in results list
        frame = context.pages[-1]
        # TODO(locator): first project result card under "Projects" group
        project_result = frame.locator('xpath=TODO_PROJECT_RESULT_XPATH').nth(0)
        await asyncio.sleep(3); await project_result.click()

        # --> Assertion: landed on a project view
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert "/projects/" in current_url, f"Expected /projects/ URL, got {current_url}"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
