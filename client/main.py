
import jinja2
from flask import Flask, render_template, request
import json

app = Flask(__name__)
app.debug = True
app.secret_key = 'random supersecret key'

@app.route('/')
def index():
    return render_template('index.jinja2')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000,threaded=True)
