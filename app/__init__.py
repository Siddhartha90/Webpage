from flask import Flask
import os

# Create a new instance of the Flask class.
app = Flask(__name__)

# The views are the handlers that respond to requests from web browsers.
# In Flask views are written as Python functions. Each view function is mapped to one or more request URLs.

# Isolate the views in a separate views.py file
from app import views