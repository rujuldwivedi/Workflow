import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict
import logging

class EmailSender:
    def __init__(self, smtp_server: str, smtp_port: int, email: str, password: str):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.email = email
        self.password = password
        self.logger = logging.getLogger(__name__)
    
    def send_notification(self, to_email: str, new_requests: List[Dict]) -> bool:
        """Send email notification about new follow requests"""
        if not new_requests:
            return False
            
        msg = MIMEMultipart()
        msg['From'] = self.email
        msg['To'] = to_email
        msg['Subject'] = f"New Instagram Follow Requests ({len(new_requests)})"
        
        html = """\
        <html>
          <body>
            <h2>You have new Instagram follow requests:</h2>
            <ul>
        """
        
        for req in new_requests:
            html += f"""\
              <li style="margin-bottom: 15px;">
                <strong>{req['username']}</strong> ({req['full_name']})
                <br>
                <img src="{req['profile_pic_url']}" alt="Profile picture" width="50" style="border-radius: 50%;">
              </li>
            """
        
        html += """\
            </ul>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html, 'html'))
        
        try:
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as server:
                server.login(self.email, self.password)
                server.send_message(msg)
            self.logger.info("Email notification sent successfully")
            return True
        except Exception as e:
            self.logger.error(f"Error sending email: {str(e)}")
            return False