#!/bin/bash
source ~/RealChat/env/bin/activate
gunicorn -c gunicorn.prod.py