#!/bin/bash
source /home/realchat/RealChat/env/bin/activate
/home/realchat/RealChat/env/bin/daphne -b 0.0.0.0 -p 8001 RealChat.asgi:application
