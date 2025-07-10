"""
AWS Elastic Beanstalk entry point for Clonefluencer API

This file serves as the WSGI entry point for AWS Elastic Beanstalk deployment.
It imports the Flask application from influencer_api.py and makes it available
as 'application' which is the expected name for Elastic Beanstalk.
"""

from influencer_api import create_app
import os

# Create the Flask application instance
application = create_app()

if __name__ == "__main__":
    # This will only run when testing locally
    application.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
