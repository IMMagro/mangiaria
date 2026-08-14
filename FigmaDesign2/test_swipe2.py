from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:8443')
    page.wait_for_load_state('networkidle')
    
    # Click the first card that has "componenti" text
    page.locator('text=componenti').first.click()
    page.wait_for_timeout(1000)
    
    # Check if select exists
    select = page.locator('select').first
    if select.is_visible():
        print("Select is visible!")
        box = select.bounding_box()
        
        # Try clicking it to see if it opens
        select.click()
        page.wait_for_timeout(500)
        
        # Try dragging it
        page.mouse.move(box['x'] + 10, box['y'] + box['height']/2)
        page.mouse.down()
        page.mouse.move(box['x'] + 150, box['y'] + box['height']/2, steps=10)
        page.mouse.up()
        print("Dragged")
        page.wait_for_timeout(500)
        
        print("Value:", select.input_value())
    else:
        print("Select not found or visible")
    
    page.screenshot(path='swipe_test.png')
    browser.close()
