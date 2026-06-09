## Music Playlist Explorer — Planning Spec

### Data Shape (Data Schema)
[Leave blank — fill in before Milestone 3]

**Playlist Object:**
- id (string) — unique identifier for the playlist
- title (string) — the name of the playlist
- creator (string) — the person who created the playlist
- coverImg (string) — path to the playlist cover image
- likes (number) — the number of likes the playlist has
- songs (array) — array of song objects in the playlist

**Song Object:**
- title (string) — the name of the song
- artist (string) — the artist who performs the song
- album (string) — the album the song is from
- duration (string) — the length of the song in mm:ss format



### UI and Interaction Rules

There are three main sections of the homepage which include the header, content area, and footer. 

When a user clicks a playlist card a modal pop-up appears centered on the screen. Inside the modal you can see the playlist name and author, the cover image, and shuffle button too.

If a user clicks outside the modal it will close the model and return the user to the main grid. 

The like count will increase by 1 if the playlist is not liked yet and will decrease by one if it already is liked. 

The shuffle button will randomly reorder the songs in the playlists. The button will be temporary.  



### Function Specs
[Add function specs here as you plan each milestone]

**renderPlaylistCards()**
- **Purpose:** Dynamically creates and displays playlist cards from data
- **Inputs:** None (reads from data.json)
- **Returns:** Nothing (modifies DOM)
- **Side Effects:** 
  - Fetches playlist data from data.json
  - Clears existing content in `.playlist-cards` container
  - Creates a card element for each playlist
  - Each card displays: cover image, title, creator, like count
  - Appends all cards to `.playlist-cards` container in the DOM
- **Fields Used:** id, title, creator, coverImg, likes

**populateModal(playlist)**
- **Purpose:** Populates the modal with detailed information about a specific playlist
- **Inputs:** playlist (object) - a single playlist object from the data
- **Returns:** Nothing (modifies DOM)
- **Side Effects:**
  - Updates modal cover image with playlist.coverImg
  - Updates modal title with playlist.title
  - Updates modal creator with playlist.creator
  - Updates modal like count with playlist.likes
  - Clears existing song list in modal
  - Creates and appends a list item for each song showing title, artist, album, and duration
- **Fields Used:** coverImg, title, creator, likes, songs (array containing title, artist, album, duration)
- **Expected Result:** Modal displays playlist cover, title, creator, likes, and a complete list of songs with all their details

**openModal(playlist)**
- **Purpose:** Shows the modal and populates it with playlist data
- **Inputs:** playlist (object) - the playlist to display
- **Returns:** Nothing (modifies DOM)
- **Side Effects:**
  - Calls populateModal(playlist) to fill in the data
  - Changes modal-overlay display from 'none' to 'flex' (making it visible)

**closeModal()**
- **Purpose:** Hides the modal
- **Inputs:** None
- **Returns:** Nothing (modifies DOM)
- **Side Effects:**
  - Changes modal-overlay display from 'flex' to 'none' (hiding it)

**toggleLike(playlist, likeIcon, likeCountElement)**
- **Purpose:** Toggles the like state of a playlist (like/unlike)
- **Inputs:** 
  - playlist (object) - the playlist object to like/unlike
  - likeIcon (DOM element) - the heart icon element
  - likeCountElement (DOM element) - the element displaying the like count
- **Returns:** Nothing (modifies data and DOM)
- **Side Effects:**
  - **Branch 1 (Unliked → Liked):**
    - Increments playlist.likes by 1 in the data model
    - Updates likeCountElement text to show new count
    - Adds 'liked' class to likeIcon (changes appearance to filled/red heart)
    - Sets playlist.isLikedByUser to true
  - **Branch 2 (Liked → Unliked):**
    - Decrements playlist.likes by 1 in the data model
    - Updates likeCountElement text to show new count
    - Removes 'liked' class from likeIcon (returns to empty/gray heart)
    - Sets playlist.isLikedByUser to false
- **Constraint:** User can only like each playlist once at a time; toggling switches between liked and unliked states

🎯 Goal
The goal of this milestone is to add functionality to shuffle the songs within a playlist when the user clicks a shuffle button in the playlist detail modal.

Specifying What "Shuffled" Means
Shuffle sounds simple, but there are a few decisions worth making explicitly before you implement it. Does the original song order need to be preserved anywhere so the user can get back to it? What does "shuffled" mean for the UI — does the list re-render in place? What should happen if the user clicks shuffle multiple times? Answering these questions in your spec before writing any code will save you from discovering them mid-implementation.

💻 Your Turn
Add a Shuffle Button to the Modal

Modify the HTML structure of the playlist modal to include a shuffle button. A simple button element with the text "Shuffle" works fine.
Style the Shuffle Button

In style.css, add styles for the shuffle button so it is visually distinct and changes appearance when hovered or clicked.
Write a Spec for the Shuffle Function

Add a function spec for your shuffle function to planning.md. Your spec should answer:
What does this function take in?
What does it return?
Should the original song order be preserved anywhere, and if so, how?
What does the UI look like after shuffling?
What should happen when the user clicks shuffle multiple times?
Implement Shuffle Functionality

In script.js, write a function that takes an array of songs and returns them in a randomized order, using the spec you just wrote as your guide.
Add an event listener to the shuffle button that calls your shuffle function with the current playlist's songs and updates the displayed song list in the modal.
Ensure the shuffled order is reflected in the modal view.
Once your function is working, open the Claude Chat panel, provide your implementation, and reference your planning.md with @. Ask Claude to confirm whether the implementation matches your spec. Pay particular attention to whether the original order behavior and the multi-shuffle behavior match what you defined.
📍 Checkpoint
Before moving on to Milestone 7, make sure:

Each playlist modal has a shuffle button that users can click.
Clicking the shuffle button rearranges the order of songs in the modal view.
Clicking shuffle multiple times continues to produce a different order.
You wrote a function spec that addresses original order preservation and multi-shuffle behavior before implementing.
You validated your implementation against your spec using Claude.


### Featured Page

**Layout:**
The Featured page displays a single randomly selected playlist with:
- Left side: Large playlist cover image and playlist title/creator
- Right side: Complete list of songs showing title, artist, album, and duration
- Navigation bar at top with links to "All Playlists" and "Featured" pages
- Same header/footer styling as main page for consistency

**Random Selection Function Spec:**

**selectRandomPlaylist(playlists)**
- **Purpose:** Selects one random playlist from the playlists array
- **Inputs:** playlists (array) - array of all playlist objects
- **Returns:** playlist (object) - one randomly selected playlist object
- **When it runs:** On page load (each time featured.html loads)
- **Behavior:** Uses Math.random() to select a random index from the playlists array
- **Refresh behavior:** Each page load or refresh selects a new random playlist (may occasionally repeat due to randomness)

**Navigation:**
- Navigation bar appears on both index.html (All Playlists) and featured.html (Featured)
- Links allow users to switch between pages without browser back/forward buttons
- Navigation persists across both pages for consistent UX





### AI Feature Spec (Milestone 8)
[Leave blank — fill in before Milestone 8]

### Decisions Log
[One entry per milestone where you make spec-informed decisions]