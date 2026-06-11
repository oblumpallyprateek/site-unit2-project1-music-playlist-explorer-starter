## Music Playlist Explorer — Planning Spec

### Data Shape

**Playlist Object:**
- id (string) — unique identifier for the playlist
- title (string) — the name of the playlist
- creator (string) — the person who created the playlist
- coverImg (string) — path to the playlist cover image
- likes (number) — the number of likes the playlist has
- isLikedByUser (boolean) — tracks if the current user has liked this playlist
- songs (array) — array of song objects in the playlist

**Song Object:**
- title (string) — the name of the song
- artist (string) — the artist who performs the song
- album (string) — the album the song is from
- duration (string) — the length of the song in mm:ss format

### UI and Interaction Rules

There are three main sections of the homepage which include the header, content area, and footer. 

When a user clicks a playlist card a modal pop-up appears centered on the screen with a shadow effect. The background behind the modal is darkened. Inside the modal you can see the playlist name and author, the cover image, the full list of songs (showing title, artist, album, and duration for each), a shuffle button, and a close button.

If a user clicks outside the modal (on the darkened background area), it will close the modal and return the user to the main grid. 

The like count will increase by 1 if the playlist is not liked yet and will decrease by one if it already is liked. The heart icon changes appearance to show the liked/unliked state.

The shuffle button will randomly reorder the songs in the playlist. The shuffled order displays immediately in the modal. The shuffle is temporary—refreshing the page returns songs to their original order.

### Function Specs

**renderPlaylistCards()**
- **Purpose:** Dynamically creates and displays playlist cards from data
- **Inputs:** None (reads from data.json)
- **Returns:** Nothing (modifies DOM)
- **Side Effects:** 
  - Fetches playlist data from data.json
  - Clears existing content in `.playlist-cards` container
  - Creates a card element for each playlist
  - Each card displays: cover image, title, creator, like count with heart icon
  - Appends all cards to `.playlist-cards` container in the DOM
  - Adds click event listeners to each card and like icon
- **Fields Used:** id, title, creator, coverImg, likes, isLikedByUser

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
  - Clears AI description text
- **Fields Used:** coverImg, title, creator, likes, songs (array containing title, artist, album, duration)
- **Expected Result:** Modal displays playlist cover, title, creator, likes, and a complete list of songs with all their details

**openModal(playlist)**
- **Purpose:** Shows the modal and populates it with playlist data
- **Inputs:** playlist (object) - the playlist to display
- **Returns:** Nothing (modifies DOM)
- **Side Effects:**
  - Stores playlist in currentPlaylist variable for shuffle and AI features
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

**shuffleSongs(playlist)**
- **Purpose:** Randomly reorders the songs in a playlist and updates the modal display
- **Inputs:** playlist (object) - the playlist whose songs should be shuffled
- **Returns:** Nothing (modifies playlist data and DOM)
- **Side Effects:**
  - Creates a shuffled copy of playlist.songs array using Fisher-Yates algorithm
  - Does NOT preserve original song order (each shuffle is independent)
  - Updates playlist.songs array with the new shuffled order
  - Re-renders the song list in the modal with the new order
- **Original Order:** Not preserved - playlist data is permanently modified until page reload
- **Multi-Shuffle Behavior:** Each click produces a new random order from the current order
- **UI Result:** Song list in modal displays in the new shuffled order immediately

**displayFeaturedPlaylist()**
- **Purpose:** Selects and displays a random playlist on the Featured page
- **Inputs:** None (reads from data.json)
- **Returns:** Nothing (modifies DOM)
- **Side Effects:**
  - Fetches playlist data from data.json
  - Calls selectRandomPlaylist() to choose one playlist
  - Updates featured page elements with playlist image, title, creator, likes
  - Dynamically renders all songs in the playlist
- **When it runs:** On page load of featured.html

**selectRandomPlaylist(playlists)**
- **Purpose:** Selects one random playlist from the playlists array
- **Inputs:** playlists (array) - array of all playlist objects
- **Returns:** playlist (object) - one randomly selected playlist object
- **Behavior:** Uses Math.random() to select a random index from the playlists array
- **Refresh behavior:** Each page load or refresh selects a new random playlist (may occasionally repeat due to randomness)

**getPlaylistDescription(playlist)**
- **Purpose:** Generates an AI-powered description of a playlist using the OpenRouter API
- **Inputs:** playlist (object) - the playlist object containing title, creator, and songs
- **Returns:** Promise<string> - the AI-generated description text, or an error message if the call fails
- **API Called:** OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
- **Model Used:** google/gemma-4-31b-it:free
- **Prompt Structure:**
  - System message: Defines the AI's role as a music curator and playlist expert
  - User message: Provides playlist title, creator, and song list with instructions to generate a 2-3 sentence description
- **Error Handling:**
  - Network/API errors: Returns "Unable to generate description. Please try again later."
  - Empty/invalid response: Returns "Description unavailable."
  - Console logs errors for debugging
- **Side Effects:** Makes an external API call to OpenRouter

### Featured Page

**Layout:**
The Featured page displays a single randomly selected playlist with:
- Left side: Large playlist cover image and playlist title/creator
- Right side: Complete list of songs showing title, artist, album, and duration
- Navigation bar at top with links to "All Playlists" and "Featured" pages
- Same header/footer styling as main page for consistency

**Random Selection Function Spec:**
See selectRandomPlaylist() in Function Specs section above.

**Navigation:**
- Navigation bar appears on both index.html (All Playlists) and featured.html (Featured)
- Links allow users to switch between pages without browser back/forward buttons
- Navigation persists across both pages for consistent UX
- Active page is highlighted in the navigation

### AI Feature Spec (Milestone 8)

**Role:** You are a music curator and playlist expert who understands musical themes, vibes, and genres.

**Task:** Generate a 2-3 sentence description for a music playlist that captures its overall vibe, theme, and mood based on the playlist name, creator, and song list.

**Inputs:**
- Playlist title (string)
- Playlist creator (string)
- List of songs with title and artist (array of objects)

**Output Format:**
- 2-3 sentences that describe the playlist's vibe, theme, and mood
- Should be engaging and descriptive without being generic marketing language
- Should NOT list individual songs
- Should capture the overall feeling someone would get from listening to this playlist

**Constraints:**
- Do not list songs individually (e.g., avoid "This playlist includes...")
- Avoid generic phrases like "perfect for any occasion" or "you'll love this"
- Focus on mood, genre, energy level, and use case
- Keep it concise (2-3 sentences maximum)

**Failure Behavior:**
- If API call fails: Display "Unable to generate description. Please try again later."
- If model returns empty/invalid response: Display "Description unavailable."
- Show loading message "Generating description..." while API call is in progress

### Decisions Log

**Milestone 3 - Data Structure:**
- **Decision:** Added `isLikedByUser` boolean field to track like state per playlist
- **Why:** Needed to persist like state across modal opens/closes and support toggle functionality
- **Alternative considered:** Track liked playlists in a separate array, but decided embedding the state in each playlist object was simpler

**Milestone 5 - Like Icon Implementation:**
- **Decision:** Used heart emoji (♥) instead of icon library or image
- **Why:** Simplest approach that doesn't require external dependencies or asset management
- **Trade-off:** Less customizable than SVG icons, but sufficient for project requirements

**Milestone 7 - Featured Page Layout:**
- **Decision:** Used two-column layout (left: image/details, right: songs) instead of single column
- **Why:** Better use of horizontal space on larger screens and creates visual distinction from the modal view
- **Implementation:** Used Flexbox with flex: 1 on both columns for equal width distribution

**Milestone 8 - AI Implementation:**
- **First API attempt:** Tried multiple free models (meta-llama/llama-3.3-70b, google/gemma-4-26b) but received 429 rate limit errors indicating models were temporarily unavailable
- **Working model:** google/gemma-4-31b-it:free successfully generated descriptions matching spec requirements
- **Prompt adjustments:** Initial prompt structure worked well - no adjustments needed. The spec's constraint to avoid listing individual songs was respected by the model
- **Tested failure state:** Verified error message displays when API returns 429 or network errors occur. Loading state ("Generating description...") displays correctly during API call
- **Reflection:** Would specify in the spec that free models rotate availability and include a prioritized backup model list. Also would note that the API key should never be committed to version control - this requirement could be made more explicit in the planning phase

