from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # 1. Load the app
    page.goto('http://localhost:8443')
    page.wait_for_load_state('networkidle')
    
    # 2. Go to Stats tab
    page.click('text="Stats"')
    page.wait_for_load_state('networkidle')
    print('Navigated to Stats page')
    
    # 3. Test interactions
    page.click('text="Mese"')
    page.wait_for_timeout(300)
    page.click('text="Anno"')
    page.wait_for_timeout(300)
    page.click('text="Sett."')
    page.wait_for_timeout(300)
    print('Tabs interactable')
    
    # 4. Check for Encoding Errors in DOM
    content = page.content()
    # Check for Unicode replacement character
    if "\uFFFD" in content or "verr?" in content or "S?," in content:
        print("WARNING: Visual/Encoding error found on the page!")
    else:
        print("PASS: No encoding errors found in the DOM.")
        
    browser.close()
