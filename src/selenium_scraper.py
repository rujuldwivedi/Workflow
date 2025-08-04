from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (NoSuchElementException, 
                                      TimeoutException, 
                                      WebDriverException)
import time
import logging
from typing import List, Dict, Optional
import pickle
import os

class InstagramSeleniumScraper:
    def __init__(self, username: str, password: str, headless: bool = True):
        self.username = username
        self.password = password
        self.headless = headless
        self.logger = logging.getLogger(__name__)
        self.cookies_file = f"{username}_cookies.pkl"
        self.driver = self._init_driver()
    
    def _init_driver(self):
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from webdriver_manager.chrome import ChromeDriverManager
    
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
    
        try:
        # Try using system Chrome first
            options.binary_location = "/usr/bin/google-chrome"
            driver = webdriver.Chrome(
                service=Service(executable_path="/usr/bin/chromedriver"),
                options=options
            )
        except Exception as e:
            # Fallback to webdriver-manager
            self.logger.warning(f"System Chrome failed, falling back to webdriver-manager: {e}")
            driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()),
                options=options
            )
    
        return driver

    def _save_cookies(self):
        """Save session cookies to file"""
        with open(self.cookies_file, 'wb') as f:
            pickle.dump(self.driver.get_cookies(), f)

    def _load_cookies(self):
        """Load cookies from file if exists"""
        if os.path.exists(self.cookies_file):
            with open(self.cookies_file, 'rb') as f:
                cookies = pickle.load(f)
                for cookie in cookies:
                    self.driver.add_cookie(cookie)
            return True
        return False

    def _login(self) -> bool:
        """Login to Instagram with cookie persistence"""
        try:
            self.driver.get("https://www.instagram.com/accounts/login/")
            time.sleep(2)  # Wait for page to load
            
            # Try loading cookies first
            if self._load_cookies():
                self.driver.get("https://www.instagram.com")
                try:
                    # Check if we're logged in by looking for the home icon
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, "//*[local-name()='svg' and @aria-label='Home']"))
                    )
                    return True
                except TimeoutException:
                    self.logger.info("Cookies expired, logging in fresh")
            
            # Perform fresh login
            username_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "username"))
            )
            password_field = self.driver.find_element(By.NAME, "password")
            
            username_field.send_keys(self.username)
            password_field.send_keys(self.password)
            password_field.submit()
            
            # Wait for login to complete
            try:
                WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.XPATH, "//*[local-name()='svg' and @aria-label='Home']"))
                )
                
                # Save cookies for next time
                self._save_cookies()
                return True
            except TimeoutException:
                # Check for challenge
                if "ChallengeRequired" in self.driver.page_source:
                    self.logger.error("Challenge required. Please complete in browser.")
                    if not self.headless:
                        input("Press Enter after completing challenge...")
                        return True
                return False
                
        except Exception as e:
            self.logger.error(f"Login failed: {str(e)}")
            return False

    def get_follow_requests(self) -> List[Dict]:
        """Get current follow requests"""
        try:
            if not self._login():
                return []
            
            # Navigate to follow requests page
            self.driver.get("https://www.instagram.com/accounts/access_tool/current_follow_requests")
            time.sleep(3)  # Wait for page to load
            
            # Scroll to load all requests
            last_height = self.driver.execute_script("return document.body.scrollHeight")
            while True:
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
                new_height = self.driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height
            
            # Extract request data
            request_items = self.driver.find_elements(By.XPATH, "//div[@role='main']//li")
            requests = []
            
            for item in request_items:
                try:
                    username = item.find_element(By.XPATH, ".//span").text
                    full_name = item.find_element(By.XPATH, ".//div[2]/div/div").text
                    profile_pic = item.find_element(By.XPATH, ".//img").get_attribute("src")
                    
                    requests.append({
                        'username': username,
                        'full_name': full_name,
                        'profile_pic_url': profile_pic
                    })
                except NoSuchElementException:
                    continue
            
            return requests
            
        except Exception as e:
            self.logger.error(f"Error getting follow requests: {str(e)}")
            return []
        finally:
            if self.driver:
                self.driver.quit()

    def save_last_checked(self, requests: List[Dict], file_path: str = "last_checked.pkl"):
        """Save the current state of follow requests"""
        with open(file_path, 'wb') as f:
            pickle.dump(requests, f)

    def load_last_checked(self, file_path: str = "last_checked.pkl") -> Optional[List[Dict]]:
        """Load the last saved state of follow requests"""
        try:
            with open(file_path, 'rb') as f:
                return pickle.load(f)
        except (FileNotFoundError, EOFError):
            return None