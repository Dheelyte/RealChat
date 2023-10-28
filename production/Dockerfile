# Use an official Python runtime as a parent image
FROM python:3.10.0-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Copy your project code into the container
COPY . /app

# Install Django and any other dependencies
RUN pip install Django

# Specify the command to run the worker
CMD ["python", "manage.py", "runworker"]
