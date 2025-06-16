import json
import random
import datetime

try:
    with open('data.json', 'r') as f:
        data = json.load(f)
except FileNotFoundError:
    data = {}  # Start with an empty dictionary if file doesn't exist



def add_task():
    id = randint(0, 100,000,000)
    description = input("Enter a description: ")
    status = "todo"
    createdAt = datetime.now()
    # updatedAt = 
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=4)


