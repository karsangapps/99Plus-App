import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3000/nta-test/a42f598e-3b1e-436c-bf00-136450f839c5
        await page.goto("http://localhost:3000/nta-test/a42f598e-3b1e-436c-bf00-136450f839c5")
        
        # -> Click the 'Create account' link to open the signup page
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/div/div[2]/div/div[3]/p/a').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Fill the signup form with the specified values, accept terms, submit the form, then verify the error text 'already' is visible and the URL still contains '/signup'.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/div/div[2]/div/div[6]/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Existing Email')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/div/div[2]/div/div[6]/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('existing.user@invalid-example.com')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/div/div[2]/div/div[6]/div[3]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('4444444444')
        
        # -> Type '2000-02-02' into the Date of Birth field (index 188).
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/div/div[2]/div/div[6]/div[4]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('2000-02-02')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/div/div[2]/div/div[6]/div[5]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('ValidPassword123!')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/div/div[2]/div/div[6]/label/input').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the 'Create account' button to submit the signup form, then verify the error message containing 'already' is visible and that the URL still contains '/signup'.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/div/div[2]/div/div[6]/form/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        assert await frame.locator("xpath=//*[contains(., 'already')]").nth(0).is_visible(), "Expected 'already' to be visible"
        current_url = await frame.evaluate("() => window.location.href")
        assert '/signup' in current_url
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    