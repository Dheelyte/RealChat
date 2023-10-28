# Use an official Python runtime as a parent image
FROM python:3.10.0-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt /app/

# Install necessary packages specified in requirements.txt
RUN pip install -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Expose the port your Django application will run on
EXPOSE 8000

# Start the Django development server
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Start the Daphne application
CMD ["daphne", "-b", "0.0.0.0", "-p", "8001", "RealChat.asgi:application", "--workers", "4"]