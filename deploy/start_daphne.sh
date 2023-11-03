#!/bin/bash
source /home/realchat/RealChat/env/bin/activate
daphne -b 0.0.0.0 -p 8001 RealChat.asgi:application
