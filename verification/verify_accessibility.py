from playwright.sync_api import sync_playwright, expect

def test_accessibility(page):
    # Go to the new project page
    page.goto("http://localhost:3000/dashboard/new")

    # Wait for the creation flow to be visible
    page.wait_for_selector("h1:has-text('New Deployment')")

    # Take a screenshot of the initial state
    page.screenshot(path="verification/initial_state.png")

    # Check if the radiogroup exists
    radiogroup = page.get_by_role("radiogroup", name="Deployment method")
    expect(radiogroup).to_be_visible()

    # Check for labels (visually hidden but should be in DOM)
    github_label = page.locator("label[for='github-url']")
    expect(github_label).to_have_text("GitHub Repository URL")

    # Select another method using keyboard (Raw Code)
    # The first one is GitHub Repo, third one is Raw Code
    # We'll tab to the third one or just find it by role and name
    raw_code_option = page.get_by_role("radio", name="Raw Code")
    raw_code_option.focus()
    page.keyboard.press("Enter")

    # Verify Raw Code method is active
    expect(raw_code_option).to_have_attribute("aria-checked", "true")

    # Verify textarea for raw code is visible and has a label
    raw_code_textarea = page.locator("#raw-code")
    expect(raw_code_textarea).to_be_visible()

    raw_code_textarea_label = page.locator("label[for='raw-code']")
    expect(raw_code_textarea_label).to_have_text("Source Code")

    # Take a screenshot of the updated state
    page.screenshot(path="verification/updated_state.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        try:
            test_accessibility(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
