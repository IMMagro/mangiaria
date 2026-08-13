from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    page.goto('http://localhost:8443')
    page.wait_for_load_state('networkidle')
    
    page.click('text="Stats"')
    page.wait_for_load_state('networkidle')
    
    oggi_tab = page.locator('button:has-text("Oggi")')
    if oggi_tab.count() > 0:
        print("PASS: Oggi tab is present.")
    else:
        print("FAIL: Oggi tab not found.")
        
    streak_btn = page.locator('button:has-text("Streak")')
    if streak_btn.count() > 0:
        streak_btn.first.click()
        page.wait_for_timeout(300)
        if page.locator('text="Giorni consecutivi"').count() > 0:
            print("PASS: Info popup opened successfully.")
        else:
            print("FAIL: Info popup did not open.")
    else:
        print("FAIL: Streak button not found.")
        
    browser.close()
