---
title: "\"Augment\" Me Not: When AI 'Help' Trashed My Codebase"
author: Emily Anderson
date: "2025-05-19"
tags: [AI, Developer Tools, Debugging, VS Code, Augment]
featuredImage: /images/blog/augment-broke-my-site/augment-broke-my-site.png
featured: true
shortDescription: "When an AI tool tried to 'optimize' my personal site, it added over 8,000 files, broke the build, and left me wondering if it thought it was helping. Here's how I cleaned up the mess—and what I'm doing differently next time."
---

There are bad days.  
There are worse days.  
And then there are days when an AI tool decides your humble, hand-tuned portfolio site needs **over 8,000 files of unsolicited enhancements**.

I’d like to talk about the last one.

---

### 💥 What Happened

I installed [Augment Code](https://www.augmentcode.com/) into VS Code to speed up some refactors. I thought I was giving it a light task: optimize some JavaScript modules and maybe clean up the build process.

Augment’s response?

- Installed Vite (whether I asked or not)  
- Added `eslint`, `prettier`, `jest`, and several scripts I didn’t recognize  
- Spawned **over 8,000 untracked files**, most of them nested in `node_modules`, `.bin`, and `src/` folders I never created  
- Broke my build  
- And somehow rewrote my `index.html` with a dark mode switcher and scroll animations... that didn’t work

It was like waking up to find someone had “organized” your kitchen by dumping IKEA on top of it.

---

### 🔥 The Problem with “Helpful” AI Tools

Augment, like many new VS Code copilots, tries to automate best practices across a project. But here's the thing:

1. **It never asked me.**
2. **It didn’t explain anything.**
3. **It broke everything.**

That’s not AI-assisted development. That’s AI-performing-an-exorcism.

---

### 🧼 The Cleanup (A Digital Crime Scene Investigation)

If this happens to you:

1. **Check Git status immediately**  
   If you’re lucky, the chaos is uncommitted.

2. **Use `git clean -fdxn` to preview the carnage**  
   Don’t trust your eyes. Trust the dry run.

3. **When ready, run `git clean -fdx` to delete all untracked files**  
   This is your digital purge moment. Deep breath.

4. **Commit only what *you* changed**  
   Augment added zero value. Your two-line `index.html` edit? That’s the work that matters.

---

### 🛡️ What I’m Doing Differently

Going forward, I’m sandboxing every AI tool I test. New branch. Dirty repo. No write access to main.  

Also? I’m learning to trust my instincts again. If I wasn’t already writing clean modular code with dark mode toggles, there’s probably a reason. Maybe I didn’t want them. Maybe I had better things to do. Maybe—I don’t know—I just didn’t want a JS linter with 84 transitive dependencies showing up uninvited?

---

### 🧵 The Bigger Picture

AI coding assistants *can* be transformative. But they need boundaries, like interns who can type 300 WPM but have no concept of version control. They need to ask before doing. They need to respect the existing codebase.

Until then, I’ll keep my `feature/pyramid-buttons` branch clean and my skepticism sharp.

---

_Stay curious. Stay cynical. Keep backups._

**– Emily**
