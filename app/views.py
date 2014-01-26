from flask import render_template, flash, redirect, session, url_for, request, g
from app import app
## -------------------------
# CONTROLLERS

@app.route('/')
@app.route('/index')
@app.route('/Sid')
def sid():
    return render_template('sid.html')

@app.route('/CS425')
def CS425():
    return render_template('CS425.html')
@app.route('/CS225')
def CS225():
    return render_template('CS225.html')
@app.route('/CS431')
def CS431():
    return render_template('CS431.html')
@app.route('/CS498')
def CS498():
    return render_template('CS498.html')
@app.route('/Cloud-Computing')
def CS498():
    return render_template('CS498-Cloud.html')
@app.route('/Cloud-ComputingII')
def CS498():
    return render_template('CS498-Cloud2.html')
