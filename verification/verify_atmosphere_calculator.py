from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the home page
        print("Navigating to http://localhost:3000")
        page.goto("http://localhost:3000")

        # Wait for the Atmosphere Calculator title to ensure page is loaded
        print("Waiting for Atmosphere Calculator title...")
        page.wait_for_selector("text=Atmosphere Calculator (ISA)", timeout=10000)

        # Check if the "Calculate" button is GONE in the Atmosphere tab
        # Note: RangeCalculator has a Calculate button too, so we must be careful.
        # We can scope to the current tab content if possible, but simplest is to check if
        # a "Calculate" button is visible inside the Atmosphere Calculator card.
        # The card contains "Atmosphere Calculator (ISA)".

        # Let's just check that we don't see "Calculate" button immediately after the input.
        # Or better, check that the input triggers change.

        # Find the altitude input
        print("Finding altitude input...")
        altitude_input = page.get_by_label("Altitude (m)")

        # Check aria-describedby
        aria_describedby = altitude_input.get_attribute("aria-describedby")
        print(f"aria-describedby: {aria_describedby}")
        if aria_describedby == "altitude-desc":
            print("Verified aria-describedby attribute.")
        else:
            print(f"FAILED: Expected aria-describedby='altitude-desc', got '{aria_describedby}'")

        # Check helper text
        helper_text = page.locator("#altitude-desc")
        if helper_text.is_visible():
            print("Helper text is visible.")
        else:
             print("FAILED: Helper text not visible.")

        # Test interaction
        print("Typing 5000 into altitude input...")
        altitude_input.fill("5000")

        # Wait for results to update
        # stdAtm(5000): T = 288.15 - 0.0065*5000 = 255.65 K.
        # -17.5 C.
        print("Waiting for result (Temperature)...")
        # We look for the text "255.65" which is the temperature in Kelvin
        page.wait_for_selector("text=255.65", timeout=5000)
        # We look for the text "-17.5" which is the temperature in Celsius
        page.wait_for_selector("text=-17.5", timeout=5000)
        print("Verified correct calculation results for 5000m.")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/atmosphere_calculator_verified.png")
        print("Screenshot saved to verification/atmosphere_calculator_verified.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="verification/error_screenshot.png")
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
