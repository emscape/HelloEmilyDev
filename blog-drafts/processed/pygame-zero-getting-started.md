---
title: "Pygame Zero — Getting Started"
author: "Emily Anderson"
date: "2025-09-24"
tags:
  - python
  - pygame
  - gamedev
  - beginner
shortDescription: "Quick start guide to install Python and run your first Pygame Zero game."
description: "A step-by-step guide to installing Python, setting up Pygame Zero, and running your first game."
---

# Getting Started with Pygame Zero (Beginner-Friendly)

When I talk about my “**Go to the Store and Buy Bread**” (GttSaBB) philosophy, it comes from [teaching kids how to make a peanut butter sandwich](https://www.youtube.com/watch?v=j-6N3bLgYyQ). The very first step isn’t opening the jar or grabbing a knife—it’s going to the store and buying the bread.

Too many programming guides make the same mistake: they start halfway through. The Pygame Zero docs, for example, jump straight into telling you what line of code to run without ever explaining where you’re supposed to type it. That gap is exactly where beginners get confused and give up.

I published this post to fill in those missing steps. It’s written GttSaBB-style: no assumptions, no skipped steps, just a clean path from “what even is Pygame Zero?” to “look, I ran my first game window.” And if you find that I’ve skipped a step, feel free to reach out—I want this to stay a living guide that meets learners right where they are..

---

### Step 0. Install Python
1. Go to [python.org/downloads](https://www.python.org/downloads/).  
2. Download **Python 3.x** (don’t get Python 2).  
3. When installing, make sure you check the box that says **“Add Python to PATH”** before clicking Install.

---

### Step 1. Install Pygame Zero
1. Open a terminal:  
   - On Windows: search for **Command Prompt** or **PowerShell**.  
   - On Mac: open **Terminal** from Applications > Utilities.  
2. In that window, type:  
```
pip install pgzero
```
Press Enter. This downloads and installs Pygame Zero.

---

### Step 2. Make a Game File
1. Create a new folder called `firstgame`.  
2. Inside that folder, create a file called `alien.py`.  
   (The name doesn’t matter, but `alien.py` is a common example.)  
3. Open this file in a text editor (Notepad works, but [VS Code](https://code.visualstudio.com/) is way nicer).

---

### Step 3. Add Some Code
Paste this into your new `alien.py` file:
```python
WIDTH = 500
HEIGHT = 300

def draw():
    screen.clear()
    screen.draw.text("Hello world", (50, 50), fontsize=60)
```

---

### Step 4. Run the Game
1. Go back to your terminal.  
2. Use `cd` to move into the folder where your `alien.py` lives. Example:  
```
cd Desktop/firstgame
```
3. Type this and press Enter:  
```
pgzrun alien.py
```
A new window should open with your game screen saying “Hello world.”

---

### Step 5. Experiment!
Try changing the text, moving it to different coordinates, or making the window bigger by adjusting `WIDTH` and `HEIGHT`.

---

