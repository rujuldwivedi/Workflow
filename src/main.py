from selenium_scraper import InstagramSeleniumScraper
from email_sender import EmailSender
import configparser
import logging
import os
from typing import List, Dict
import pickle

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_new_requests(last_requests: List[Dict], current_requests: List[Dict]) -> List[Dict]:
    """Compare requests to find new ones"""
    if not last_requests:
        return current_requests
    
    last_usernames = {req['username'] for req in last_requests}
    return [req for req in current_requests if req['username'] not in last_usernames]

def main():
    try:
        # Load configuration
        config = configparser.ConfigParser()
        config.read('../config/config.ini')
        
        # Initialize scraper (run in non-headless mode for first login)
        scraper = InstagramSeleniumScraper(
            username=config['instagram']['username'],
            password=config['instagram']['password'],
            headless=False  # Set to True after first successful login
        )
        
        # Get current and previous requests
        current_requests = scraper.get_follow_requests()
        logger.info(f"Found {len(current_requests)} pending requests")
        
        last_requests = scraper.load_last_checked()
        
        # Find new requests
        new_requests = get_new_requests(last_requests, current_requests)
        
        if new_requests:
            logger.info(f"Found {len(new_requests)} new follow requests")
            
            # Initialize email sender
            email_sender = EmailSender(
                smtp_server=config['email']['smtp_server'],
                smtp_port=int(config['email']['smtp_port']),
                email=config['email']['email'],
                password=config['email']['password']
            )
            
            if email_sender.send_notification(config['email']['recipient_email'], new_requests):
                logger.info("Notification email sent successfully")
            else:
                logger.error("Failed to send notification email")
        
        # Save current state
        scraper.save_last_checked(current_requests)
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        raise

if __name__ == "__main__":
    main()