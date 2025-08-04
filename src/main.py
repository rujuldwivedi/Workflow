import argparse
import logging
from selenium_scraper import InstagramSeleniumScraper
from email_sender import EmailSender

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--instagram-username', required=True)
    parser.add_argument('--instagram-password', required=True)
    parser.add_argument('--email', required=True)
    parser.add_argument('--email-password', required=True)
    parser.add_argument('--recipient-email', default="rujuldwivedi@icloud.com")
    args = parser.parse_args()

    try:
        # Initialize scraper
        scraper = InstagramSeleniumScraper(
            username=args.instagram_username,
            password=args.instagram_password,
            headless=True
        )
        
        # Initialize email sender
        email_sender = EmailSender(
            smtp_server="smtp.mail.me.com",
            smtp_port=587,
            email=args.email,
            password=args.email_password
        )
        
        # Rest of your existing logic...
        
    except Exception as e:
        logging.error(f"Error in main execution: {e}")
        raise

if __name__ == "__main__":
    main()