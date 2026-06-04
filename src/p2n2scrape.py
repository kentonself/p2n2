from __unknown__ import p2n2creds
import getpass
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

# Google API Imports
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import 

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]

def export_to_google_sheet(data):
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists("credentials.json"):
                print("\n[Error] credentials.json not found in workspace!")
                print("Please download your OAuth 2.0 Client credentials from the Google Cloud Console")
                print("and save it as 'credentials.json' in the root directory.")
                return
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    try:
        service = build("sheets", "v4", credentials=creds)
        spreadsheet_body = {
            'properties': {
                'title': f'Agency Express Scraped Table - {time.strftime("%Y-%m-%d %H:%M:%S")}'
            }
        }
        request = service.spreadsheets().create(body=spreadsheet_body)
        response = request.execute()
        spreadsheet_id = response.get('spreadsheetId')
        spreadsheet_url = response.get('spreadsheetUrl')
        print(f"\nCreated new Google Sheet: {spreadsheet_url}")
        
        body = {
            'values': data
        }
        result = service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range="Sheet1!A1",
            valueInputOption="RAW",
            body=body
        ).execute()
        print(f"{result.get('updatedCells')} cells updated successfully.")
        
    except HttpError as err:
        print(f"An error occurred with Google Sheets API: {err}")

def run_scraper():
    # 1. Prompt user for credentials securely in the terminal
    print("--- Agency Express Scraper Credentials ---")
    #program_code = input("Program Code: ").strip()
    #username = input("Username: ").strip()
    #password = getpass.getpass("Password: ").strip()
    
    username = p2n2creds.username
    program_code = p2n2creds.program_code
    password = p2n2creds.password

    # 2. Configure Selenium WebDriver options (Chrome)
    chrome_options = Options()
    # Uncomment the line below to run in headless mode (without opening a browser window)
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    # Initialize the Chrome driver
    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 15)

    try:
        # 3. Navigate to login page
        print("\nNavigating to login page...")
        driver.get("https://www.agencyexpress3.org/AgencyExpress30/NewLogin.aspx")

        # 4. Fill in login form
        print("Submitting login form...")
        # Wait until input fields are visible and interactable
        program_code_field = wait.until(EC.element_to_be_clickable((By.ID, "ctl00_contentPH_Login1_tbProgramCode")))
        username_field = driver.find_element(By.ID, "ctl00_contentPH_Login1_UserName")
        password_field = driver.find_element(By.ID, "ctl00_contentPH_Login1_Password")
        program_code_field = driver.find_element(By.ID, "ctl00_contentPH_Login1_tbProgramCode")
        login_button = driver.find_element(By.ID, "ctl00_contentPH_Login1_LoginButton")

        program_code_field.clear()
        program_code_field.send_keys(program_code)
        
        username_field.clear()
        username_field.send_keys(username)
        
        password_field.clear()
        password_field.send_keys(password)

        login_button.click()

        # 5. Wait for redirect or check login success
        # Wait until the URL changes away from the login page, indicating successful authentication
        wait.until(EC.url_changes("https://www.agencyexpress3.org/AgencyExpress30/NewLogin.aspx"))
        print("Logged in successfully. Current URL:", driver.current_url)

        # 6. Navigate to Order Management page
        print("Navigating to Order Management page...")
        driver.get("https://www.agencyexpress3.org/AgencyExpress30/Shopper/OrderManagement.aspx")

        # Wait for the order page content (e.g. main form, table, or body element) to load
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        
        # Scrape and print/return page content
        page_source = driver.page_source
        print("\nPage successfully scraped! Character count of source:", len(page_source))
        
        # Print a small snippet to verify we reached the right page
        if "ctl00_contentPH_gvMain" in page_source:
            print("Confirmed: Order grid table ('ctl00_contentPH_gvMain') found on the page.")
            #with open("output.txt", "w") as f:
            #     print(page_source, file=f)
            
            # Find the first PrintPreview link within the table and click it
            print("\nLocating the first PrintPreview link in the grid...")
            print_link = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "table#ctl00_contentPH_gvMain a[href*='PrintPreview.aspx']"))
            )
            print_link.click()
            print("Clicked the link. Waiting 5 seconds for the page/tab to load...")
            time.sleep(5)
            
            # Switch to the print preview tab
            print("Switching window focus to the new tab...")
            driver.switch_to.window(driver.window_handles[-1])
            
            # Wait for the table to load in the print preview tab
            print("Waiting for the table to load on the preview page...")
            table_element = wait.until(
                EC.presence_of_element_located((By.ID, "ctl00_contentPH_gvMain"))
            )
            
            # Extract table rows and headers
            print("Extracting table content...")
            rows = table_element.find_elements(By.TAG_NAME, "tr")
            table_data = []
            for row in rows:
                cols = row.find_elements(By.CSS_SELECTOR, "td, th")
                cols_text = [col.text.strip() for col in cols]
                table_data.append(cols_text)
                
            print(f"Successfully extracted {len(table_data)} rows.")
            
            # Export to Google Sheets
            export_to_google_sheet(table_data)
        else:
            print("Warning: Table grid not found. Check if the page is empty or requires different permissions.")

    except Exception as e:
        print(f"\nAn error occurred: {e}")
    finally:
        # Clean up the browser session
        print("Closing browser...")
        driver.quit()

if __name__ == "__main__":
    run_scraper()