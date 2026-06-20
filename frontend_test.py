from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/terminal")
    page.wait_for_timeout(500)

    page.get_by_placeholder("Type a command...").fill("help")
    page.get_by_placeholder("Type a command...").press("Enter")
    page.wait_for_timeout(1000)

    page.get_by_placeholder("Type a command...").fill("status")
    page.get_by_placeholder("Type a command...").press("Enter")
    page.wait_for_timeout(1000)

    page.get_by_placeholder("Type a command...").fill("logs --view")
    page.get_by_placeholder("Type a command...").press("Enter")
    page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/screenshots/terminal_output.png")
    page.wait_for_timeout(2000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
