from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:8443')
    page.wait_for_load_state('networkidle')
    
    try:
        # Open the first meal card (if not expanded)
        # Using a generic selector for the meal card
        buttons = page.query_selector_all('button')
        for btn in buttons:
            text = btn.inner_text()
            if "componenti" in text or "kcal" in text:
                btn.click()
                print("Clicked meal card to expand")
                break
        
        page.wait_for_timeout(1000)
        
        # Now find a select element
        select = page.query_selector('select')
        if select:
            print("Found select element")
            box = select.bounding_box()
            print("Bounding box:", box)
            
            if box:
                # Try dragging it
                page.mouse.move(box['x'] + 10, box['y'] + box['height']/2)
                page.mouse.down()
                page.mouse.move(box['x'] + 150, box['y'] + box['height']/2, steps=10)
                page.mouse.up()
                print("Dragged select element to the right")
                page.wait_for_timeout(1000)
                
                # Check if the value is now NIENTE
                new_val = select.input_value()
                print("Value after drag:", new_val)
        else:
            print("Could not find select element")
            
        page.screenshot(path='swipe_test.png')
    except Exception as e:
        print("Error during test:", e)
    
    browser.close()
