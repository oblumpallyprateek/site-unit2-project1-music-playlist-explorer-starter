// Store current playlist for shuffle functionality
let currentPlaylist = null;

// API Configuration - IMPORTANT: Add your own OpenRouter API key here before running
const API_KEY = 'YOUR_OPENROUTER_API_KEY_HERE'; // Get your free key at https://openrouter.ai/keys
const SYSTEM_PROMPT = 'You are a music curator and playlist expert who understands musical themes, vibes, and genres.';
const FAILURE_MESSAGE = 'Unable to generate description. Please try again later.';

// Check which page we're on and run appropriate code
if (document.querySelector('.playlist-cards')) {
  // We're on index.html (All Playlists page)
  renderPlaylistCards();
} else if (document.querySelector('.featured-container')) {
  // We're on featured.html (Featured page)
  displayFeaturedPlaylist();
}

// Fetch and render playlist cards (for index.html)
async function renderPlaylistCards() {
  try {
    // Fetch data from data.json
    const response = await fetch('data/data.json');
    const data = await response.json();
    const playlists = data.playlists;
    
    // Get the container
    const container = document.querySelector('.playlist-cards');
    
    // Clear existing cards (remove hard-coded card)
    container.innerHTML = '';
    
    // Check if playlists exist
    if (!playlists || playlists.length === 0) {
      container.innerHTML = '<p>No playlists found.</p>';
      return;
    }
    
    // Create a card for each playlist
    playlists.forEach(playlist => {
      const card = document.createElement('div');
      card.className = 'playlist-card';
      
      // Determine if playlist is liked
      const likedClass = playlist.isLikedByUser ? 'liked' : 'unliked';
      
      card.innerHTML = `
        <img src="${playlist.coverImg}" alt="${playlist.title} Cover">
        <h3>${playlist.title}</h3>
        <p>By ${playlist.creator}</p>
        <div class="like-container">
          <span class="like-icon ${likedClass}">♥</span>
          <span class="like-count">${playlist.likes}</span>
        </div>
      `;
      
      container.appendChild(card);
      
      // Get like elements
      const likeIcon = card.querySelector('.like-icon');
      const likeCountElement = card.querySelector('.like-count');
      
      // Add click event to like icon
      likeIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click from opening modal
        toggleLike(playlist, likeIcon, likeCountElement);
      });
      
      // Add click event to open modal (but not when clicking like icon)
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('like-icon')) {
          openModal(playlist);
        }
      });
    });
    
  } catch (error) {
    console.error('Error loading playlists:', error);
    document.querySelector('.playlist-cards').innerHTML = '<p>Error loading playlists.</p>';
  }
}

// Display featured playlist (for featured.html)
async function displayFeaturedPlaylist() {
  try {
    // Fetch data from data.json
    const response = await fetch('data/data.json');
    const data = await response.json();
    const playlists = data.playlists;
    
    // Check if playlists exist
    if (!playlists || playlists.length === 0) {
      document.querySelector('.featured-container').innerHTML = '<p>No playlists available.</p>';
      return;
    }
    
    // Select a random playlist
    const randomPlaylist = selectRandomPlaylist(playlists);
    
    // Update the featured page with playlist details
    document.getElementById('featured-img').src = randomPlaylist.coverImg;
    document.getElementById('featured-img').alt = randomPlaylist.title + ' Cover';
    document.getElementById('featured-title').textContent = randomPlaylist.title;
    document.getElementById('featured-creator').textContent = 'By ' + randomPlaylist.creator;
    document.getElementById('featured-likes').textContent = 'Likes: ' + randomPlaylist.likes;
    
    // Display songs
    const songList = document.getElementById('featured-songs');
    songList.innerHTML = '';
    
    randomPlaylist.songs.forEach(song => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <p><strong>${song.title}</strong></p>
        <p>Artist: ${song.artist}</p>
        <p>Album: ${song.album}</p>
        <p>Duration: ${song.duration}</p>
      `;
      songList.appendChild(listItem);
    });
    
  } catch (error) {
    console.error('Error loading featured playlist:', error);
    document.querySelector('.featured-container').innerHTML = '<p>Error loading playlist.</p>';
  }
}

// Select a random playlist from array
function selectRandomPlaylist(playlists) {
  const randomIndex = Math.floor(Math.random() * playlists.length);
  return playlists[randomIndex];
}

// Toggle like state for a playlist
function toggleLike(playlist, likeIcon, likeCountElement) {
  if (playlist.isLikedByUser) {
    // Branch 2: Liked → Unliked
    playlist.likes -= 1;
    playlist.isLikedByUser = false;
    likeIcon.classList.remove('liked');
    likeIcon.classList.add('unliked');
  } else {
    // Branch 1: Unliked → Liked
    playlist.likes += 1;
    playlist.isLikedByUser = true;
    likeIcon.classList.remove('unliked');
    likeIcon.classList.add('liked');
  }
  
  // Update the like count display
  likeCountElement.textContent = playlist.likes;
}

// Shuffle songs using Fisher-Yates algorithm
function shuffleSongs(playlist) {
  const songs = playlist.songs;
  
  // Fisher-Yates shuffle algorithm
  for (let i = songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [songs[i], songs[j]] = [songs[j], songs[i]];
  }
  
  // Update the modal display with shuffled songs
  const songList = document.querySelector('.modal-content ul');
  songList.innerHTML = '';
  
  playlist.songs.forEach(song => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <p><strong>${song.title}</strong></p>
      <p>Artist: ${song.artist}</p>
      <p>Album: ${song.album}</p>
      <p>Duration: ${song.duration}</p>
    `;
    songList.appendChild(listItem);
  });
}

// Get AI-generated playlist description
async function getPlaylistDescription(playlist) {
  try {
    // Build the song list for the prompt
    const songList = playlist.songs
      .map(song => `${song.title} by ${song.artist}`)
      .join(', ');
    
    const userPrompt = `Generate a 2-3 sentence description for this playlist:
            
Title: ${playlist.title}
Creator: ${playlist.creator}
Songs: ${songList}

Describe the playlist's vibe, theme, and mood. Do NOT list individual songs. Avoid generic phrases. Focus on the overall feeling and use case.`;
    
    // Construct the API request
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemma-4-31b-it:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );
    
    if (!response.ok) {
      return FAILURE_MESSAGE;
    }
    
    const data = await response.json();
    const summary = data.choices[0].message.content.trim();
    
    return summary || FAILURE_MESSAGE;
  } catch (err) {
    console.error("getPlaylistDescription failed:", err);
    return FAILURE_MESSAGE;
  }
}

// Populate modal with playlist details
function populateModal(playlist) {
  // Update modal cover image
  const modalImg = document.querySelector('.modal-content img');
  modalImg.src = playlist.coverImg;
  modalImg.alt = playlist.title + ' Cover';
  
  // Update modal title
  const modalTitle = document.querySelector('.modal-content h2');
  modalTitle.textContent = playlist.title;
  
  // Update modal creator (first <p> tag after h2)
  const modalCreator = document.querySelector('.modal-content p:nth-of-type(1)');
  modalCreator.textContent = 'By ' + playlist.creator;
  
  // Update modal likes (second <p> tag)
  const modalLikes = document.querySelector('.modal-content p:nth-of-type(2)');
  modalLikes.textContent = 'Likes: ' + playlist.likes;
  
  // Clear AI description
  const aiDescription = document.querySelector('.ai-description');
  if (aiDescription) {
    aiDescription.textContent = '';
    aiDescription.className = 'ai-description';
  }
  
  // Clear existing songs
  const songList = document.querySelector('.modal-content ul');
  songList.innerHTML = '';
  
  // Add each song to the list
  playlist.songs.forEach(song => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <p><strong>${song.title}</strong></p>
      <p>Artist: ${song.artist}</p>
      <p>Album: ${song.album}</p>
      <p>Duration: ${song.duration}</p>
    `;
    songList.appendChild(listItem);
  });
}

// Open the modal
function openModal(playlist) {
  currentPlaylist = playlist; // Store current playlist for shuffle and AI
  populateModal(playlist);
  const modal = document.querySelector('.modal-overlay');
  modal.style.display = 'flex';
}

// Close the modal
function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  modal.style.display = 'none';
}

// Event listeners (only add if elements exist)
if (document.querySelector('.modal-overlay')) {
  // Close modal when clicking on overlay (outside modal content)
  document.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  });
}

if (document.querySelector('.close-btn')) {
  // Close modal when clicking close button
  document.querySelector('.close-btn').addEventListener('click', closeModal);
}

if (document.querySelector('.shuffle-btn')) {
  // Shuffle button functionality
  document.querySelector('.shuffle-btn').addEventListener('click', () => {
    if (currentPlaylist) {
      shuffleSongs(currentPlaylist);
    }
  });
}

if (document.querySelector('.ai-description-btn')) {
  // AI Description button functionality
  document.querySelector('.ai-description-btn').addEventListener('click', async () => {
    if (!currentPlaylist) return;
    
    const aiDescription = document.querySelector('.ai-description');
    
    // Show loading state
    aiDescription.textContent = 'Generating description...';
    aiDescription.className = 'ai-description loading';
    
    // Get description from AI
    const description = await getPlaylistDescription(currentPlaylist);
    
    // Display the description
    if (description === FAILURE_MESSAGE) {
      aiDescription.className = 'ai-description error';
    } else {
      aiDescription.className = 'ai-description';
    }
    aiDescription.textContent = description;
  });
}

