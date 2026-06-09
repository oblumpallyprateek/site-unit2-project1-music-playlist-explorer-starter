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



### AI Feature Spec (Milestone 8)
[Leave blank — fill in before Milestone 8]

### Decisions Log
[One entry per milestone where you make spec-informed decisions]