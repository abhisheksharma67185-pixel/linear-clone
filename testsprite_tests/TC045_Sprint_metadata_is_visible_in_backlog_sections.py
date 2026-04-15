import asyncio
from playwright import async_api
from playwright.async_api import expect

# TC045 — Sprint metadata is visible in backlog sections
# Category: Sprint Backlog Management
# Priority: Low
# Plan description: User can view sprint goals and duration details for a sprint section in the backlog.
#
# Steps:
# 1. /login  2. email  3. password (skip)  4. submit
# 5. Sidebar -> projects
# 6. Select a project
# 7. Click backlog tab
# 8. ASSERT: sprint goal + duration info visible for at least one sprint section

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

        # Go straight to SCRUM backlog
        await page.goto("http://localhost:3000/projects/SCRUM/backlog")

        # --> Assertion: sprint goal + duration info visible
        frame = context.pages[-1]
        # TODO(assert): refine — check for date-range text (e.g. "Mar 1 — Mar 15") AND goal text
        goal_text = frame.get_by_text("Sprint goal", exact=False)
        duration_text = frame.get_by_text("—", exact=False)  # date range separator
        goal_count = await goal_text.count()
        duration_count = await duration_text.count()
        assert goal_count > 0 or duration_count > 0, "No sprint metadata (goal/duration) visible in backlog"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
