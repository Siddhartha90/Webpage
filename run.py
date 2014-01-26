#!flask/bin/python
# Now when you do ./run.py, it'll use the python specified above
# It's a special python btw coz of the local env we created,
# you can't use the one on PATH
from app import app
app.run(debug = True)