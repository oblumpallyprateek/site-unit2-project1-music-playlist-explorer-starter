// Store current playlist for shuffle functionality
let currentPlaylist = null;

// Fetch and render playlist cards
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
  currentPlaylist = playlist; // Store current playlist for shuffle
  populateModal(playlist);
  const modal = document.querySelector('.modal-overlay');
  modal.style.display = 'flex';
}

// Close the modal
function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  modal.style.display = 'none';
}

// Call the function when page loads
renderPlaylistCards();

// Close modal when clicking on overlay (outside modal content)
document.querySelector('.modal-overlay').addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
  }
});

// Close modal when clicking close button
document.querySelector('.close-btn').addEventListener('click', closeModal);

// Shuffle button functionality
document.querySelector('.shuffle-btn').addEventListener('click', () => {
  if (currentPlaylist) {
    shuffleSongs(currentPlaylist);
  }
});
