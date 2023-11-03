#!/bin/bash
source /home/realchat/RealChat/env/bin/activate
/home/realchat/RealChat/env/bin/gunicorn --bind 0.0.0.0:8000 RealChat.asgi:application