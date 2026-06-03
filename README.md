# Travel Buddy

*A shared travel planning tool for small groups of friends.*

---

## What it is

Travel Buddy is a browser-based travel planner built for people who go places together. It is a single HTML page, hosted statically, with no backend, no accounts system, and no database beyond a shared JSON bin. Everyone in the group opens the same URL and sees the same trips, the same to-do lists, the same itineraries.

It is not a product. It is a tool — deliberately simple, deliberately small.

---

## A note on security

**This application is not secure.**

The credentials are stored in plain JavaScript and visible to anyone who reads the source code. The API key for the data store is embedded in the client. There is no server-side authentication, no session management, no encryption of data at rest, and no protection against concurrent write conflicts.

This is intentional and acceptable for its intended use: a small group of trusted friends accessing a shared travel planner via a known URL. It is not suitable for sensitive data, for public-facing use, or for any context where actual security is required.

Do not store passwords, payment details, personal identification, or anything you would not write on a postcard.

---

## Features

**Dashboard**
An overview of all planned journeys. Each card shows the destination, dates, and a count of tasks, days, and tips.

**To-Do List**
A shared checklist per trip. Add tasks, check them off, delete what is done. Syncs across all group members.

**Itinerary**
A timeline view, organised by day. Each day holds timed entries. Entries are editable inline. Both days and entries are deletable.

**Tips & Tricks**
Categorised notes per trip — food, transport, accommodation, culture, or general. Editable and deletable at any time.

---

## Stack

```
HTML / CSS / JavaScript     No framework. No build step.
JSONBin.io                  Shared JSON storage via REST API
GitHub Pages                Static hosting
Cloudflare                  DNS
```

---

## File structure

```
travel-buddy/
  index.html      Markup and layout
  style.css       Visual design — glassmorphism, typography, colour system
  api.js          JSONBin connection, push/pull logic, sync indicator
  app.js          Application logic — auth, routing, CRUD operations
  README.md       This file
```

---

## Running locally

No build step required.

```bash
git clone https://github.com/luisaellamueller/travelbuddy.git
cd travelbuddy
open index.html
```

---

## Deployment

The site is hosted on GitHub Pages and served via a custom domain configured in Cloudflare DNS.

```
https://lu-travels.com
```

Any push to the main branch triggers an automatic redeployment. Changes are typically live within two to three minutes.

---

## Data

All trip data lives in a single JSONBin bin, shared across all users. Reads happen on page load. Writes are debounced — changes sync approximately one second after the last edit. The sync status is shown in the top-right corner of the interface.

There is no version history. There is no conflict resolution. Last write wins.

---

## Design

The interface uses a glassmorphism aesthetic — frosted surfaces, translucent cards, soft blue gradients. Headings are set in Cormorant Garamond, a refined serif with a editorial quality. Body text uses Outfit, a geometric sans-serif. The goal was something that feels considered without being precious.

---

*Simple by design. Insecure by nature. Built for the group.*
