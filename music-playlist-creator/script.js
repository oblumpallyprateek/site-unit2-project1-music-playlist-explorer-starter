// Import API configuration
import { API_KEY, SYSTEM_PROMPT, FAILURE_MESSAGE } from './config.js';

// Store current playlist for shuffle functionality
let currentPlaylist = null;
let allPlaylists = []; // Store all playlists
let filteredPlaylists = []; // Store filtered/sorted playlists
let editingPlaylistId = null; // Track which playlist is being edited

// Check which page we're on and run appropriate code
if (document.querySelector('.playlist-cards')) {
  // We're on index.html (All Playlists page)
  loadPlaylists();
} else if (document.querySelector('.featured-container')) {
  // We're on featured.html (Featured page)
  displayFeaturedPlaylist();
}

// Load playlists from data.json
async function loadPlaylists() {
  try {
    const response = await fetch('data/data.json');
    const data = await response.json();
    allPlaylists = data.playlists;
    filteredPlaylists = [...allPlaylists];
    renderPlaylistCards(filteredPlaylists);
    setupEventListeners();
  } catch (error) {
    console.error('Error loading playlists:', error);
    document.querySelector('.playlist-cards').innerHTML = '<p>Error loading playlists.</p>';
  }
}

// Render playlist cards
function renderPlaylistCards(playlists) {
  const container = document.querySelector('.playlist-cards');
  container.innerHTML = '';
  
  if (!playlists || playlists.length === 0) {
    container.innerHTML = '<p>No playlists found.</p>';
    return;
  }
  
  playlists.forEach(playlist => {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    
    const likedClass = playlist.isLikedByUser ? 'liked' : 'unliked';
    
    card.innerHTML = `
      <button class="delete-btn" data-id="${playlist.id}" title="Delete Playlist">×</button>
      <button class="edit-btn" data-id="${playlist.id}" title="Edit Playlist">✎</button>
      <img src="${playlist.coverImg}" alt="${playlist.title} Cover">
      <h3>${playlist.title}</h3>
      <p>By ${playlist.creator}</p>
      <div class="like-container">
        <span class="like-icon ${likedClass}">♥</span>
        <span class="like-count">${playlist.likes}</span>
      </div>
    `;
    
    container.appendChild(card);
    
    // Get elements
    const likeIcon = card.querySelector('.like-icon');
    const likeCountElement = card.querySelector('.like-count');
    const deleteBtn = card.querySelector('.delete-btn');
    const editBtn = card.querySelector('.edit-btn');
    
    // Like icon click
    likeIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLike(playlist, likeIcon, likeCountElement);
    });
    
    // Delete button click
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePlaylist(playlist.id);
    });
    
    // Edit button click
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditForm(playlist);
    });
    
    // Card click (open modal)
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('like-icon') && 
          !e.target.classList.contains('delete-btn') &&
          !e.target.classList.contains('edit-btn')) {
        openModal(playlist);
      }
    });
  });
}

// Setup event listeners for search, sort, add
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const clearBtn = document.getElementById('clear-btn');
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  clearBtn.addEventListener('click', clearSearch);
  
  // Sort functionality
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', performSort);
  
  // Add playlist button
  const addBtn = document.getElementById('add-playlist-btn');
  addBtn.addEventListener('click', openAddForm);
}

// Search functionality
function performSearch() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.toLowerCase().trim();
  
  if (!query) {
    filteredPlaylists = [...allPlaylists];
  } else {
    filteredPlaylists = allPlaylists.filter(playlist => 
      playlist.title.toLowerCase().includes(query) ||
      playlist.creator.toLowerCase().includes(query)
    );
  }
  
  renderPlaylistCards(filteredPlaylists);
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.getElementById('sort-select').value = 'none';
  filteredPlaylists = [...allPlaylists];
  renderPlaylistCards(filteredPlaylists);
}

// Sort functionality
function performSort() {
  const sortSelect = document.getElementById('sort-select');
  const sortBy = sortSelect.value;
  
  if (sortBy === 'none') {
    filteredPlaylists = [...allPlaylists];
  } else if (sortBy === 'name') {
    filteredPlaylists.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'likes') {
    filteredPlaylists.sort((a, b) => {
      if (b.likes !== a.likes) return b.likes - a.likes;
      return a.title.localeCompare(b.title); // Tie-breaker: name
    });
  } else if (sortBy === 'date') {
    filteredPlaylists.sort((a, b) => b.id.localeCompare(a.id)); // Newer IDs first
  }
  
  renderPlaylistCards(filteredPlaylists);
}

// Delete playlist
function deletePlaylist(id) {
  if (!confirm('Are you sure you want to delete this playlist?')) return;
  
  const index = allPlaylists.findIndex(p => p.id === id);
  if (index !== -1) {
    allPlaylists.splice(index, 1);
    filteredPlaylists = [...allPlaylists];
    renderPlaylistCards(filteredPlaylists);
  }
}

// Open add form
function openAddForm() {
  editingPlaylistId = null;
  document.getElementById('form-title').textContent = 'Add New Playlist';
  document.getElementById('form-submit-btn').textContent = 'Add Playlist';
  document.getElementById('playlist-form').reset();
  document.getElementById('songs-container').innerHTML = '';
  addSongInput(); // Add one empty song input
  document.getElementById('form-modal').style.display = 'flex';
}

// Open edit form
function openEditForm(playlist) {
  editingPlaylistId = playlist.id;
  document.getElementById('form-title').textContent = 'Edit Playlist';
  document.getElementById('form-submit-btn').textContent = 'Update Playlist';
  
  document.getElementById('form-playlist-name').value = playlist.title;
  document.getElementById('form-playlist-author').value = playlist.creator;
  
  const songsContainer = document.getElementById('songs-container');
  songsContainer.innerHTML = '';
  
  playlist.songs.forEach(song => {
    addSongInput(song);
  });
  
  document.getElementById('form-modal').style.display = 'flex';
}

// Add song input fields
function addSongInput(song = null) {
  const container = document.getElementById('songs-container');
  const songDiv = document.createElement('div');
  songDiv.className = 'song-input-group';
  
  songDiv.innerHTML = `
    <input type="text" placeholder="Song Title" value="${song ? song.title : ''}" class="song-title" required>
    <input type="text" placeholder="Artist" value="${song ? song.artist : ''}" class="song-artist" required>
    <input type="text" placeholder="Album" value="${song ? song.album : ''}" class="song-album" required>
    <input type="text" placeholder="Duration (mm:ss)" value="${song ? song.duration : ''}" class="song-duration" required>
    <button type="button" class="remove-song-btn">Remove</button>
  `;
  
  container.appendChild(songDiv);
  
  songDiv.querySelector('.remove-song-btn').addEventListener('click', () => {
    songDiv.remove();
  });
}

// Form event listeners
document.getElementById('add-song-btn').addEventListener('click', () => addSongInput());
document.getElementById('form-cancel-btn').addEventListener('click', closeFormModal);
document.getElementById('form-close-btn').addEventListener('click', closeFormModal);

document.getElementById('playlist-form').addEventListener('submit', (e) => {
  e.preventDefault();
  savePlaylist();
});

function closeFormModal() {
  document.getElementById('form-modal').style.display = 'none';
}

// Save playlist (add or edit)
function savePlaylist() {
  const title = document.getElementById('form-playlist-name').value.trim();
  const creator = document.getElementById('form-playlist-author').value.trim();
  
  const songInputs = document.querySelectorAll('.song-input-group');
  const songs = Array.from(songInputs).map(group => ({
    title: group.querySelector('.song-title').value.trim(),
    artist: group.querySelector('.song-artist').value.trim(),
    album: group.querySelector('.song-album').value.trim(),
    duration: group.querySelector('.song-duration').value.trim()
  }));
  
  if (editingPlaylistId) {
    // Edit existing
    const playlist = allPlaylists.find(p => p.id === editingPlaylistId);
    if (playlist) {
      playlist.title = title;
      playlist.creator = creator;
      playlist.songs = songs;
    }
  } else {
    // Add new
    const newId = String(Math.max(...allPlaylists.map(p => parseInt(p.id))) + 1);
    const newPlaylist = {
      id: newId,
      title,
      creator,
      coverImg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
      likes: 0,
      isLikedByUser: false,
      songs
    };
    allPlaylists.push(newPlaylist);
  }
  
  filteredPlaylists = [...allPlaylists];
  renderPlaylistCards(filteredPlaylists);
  closeFormModal();
}

// Display featured playlist (for featured.html)
async function displayFeaturedPlaylist() {
  try {
    const response = await fetch('data/data.json');
    const data = await response.json();
    const playlists = data.playlists;
    
    if (!playlists || playlists.length === 0) {
      document.querySelector('.featured-container').innerHTML = '<p>No playlists available.</p>';
      return;
    }
    
    const randomPlaylist = selectRandomPlaylist(playlists);
    
    document.getElementById('featured-img').src = randomPlaylist.coverImg;
    document.getElementById('featured-img').alt = randomPlaylist.title + ' Cover';
    document.getElementById('featured-title').textContent = randomPlaylist.title;
    document.getElementById('featured-creator').textContent = 'By ' + randomPlaylist.creator;
    document.getElementById('featured-likes').textContent = 'Likes: ' + randomPlaylist.likes;
    
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

function selectRandomPlaylist(playlists) {
  const randomIndex = Math.floor(Math.random() * playlists.length);
  return playlists[randomIndex];
}

function toggleLike(playlist, likeIcon, likeCountElement) {
  if (playlist.isLikedByUser) {
    playlist.likes -= 1;
    playlist.isLikedByUser = false;
    likeIcon.classList.remove('liked');
    likeIcon.classList.add('unliked');
  } else {
    playlist.likes += 1;
    playlist.isLikedByUser = true;
    likeIcon.classList.remove('unliked');
    likeIcon.classList.add('liked');
  }
  
  likeCountElement.textContent = playlist.likes;
}

function shuffleSongs(playlist) {
  const songs = playlist.songs;
  
  for (let i = songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [songs[i], songs[j]] = [songs[j], songs[i]];
  }
  
  const songList = document.querySelector('#view-modal .modal-content ul');
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

async function getPlaylistDescription(playlist) {
  try {
    const songList = playlist.songs
      .map(song => `${song.title} by ${song.artist}`)
      .join(', ');
    
    const userPrompt = `Generate a 2-3 sentence description for this playlist:
            
Title: ${playlist.title}
Creator: ${playlist.creator}
Songs: ${songList}

Describe the playlist's vibe, theme, and mood. Do NOT list individual songs. Avoid generic phrases. Focus on the overall feeling and use case.`;
    
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/free",
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

function populateModal(playlist) {
  document.getElementById('modal-img').src = playlist.coverImg;
  document.getElementById('modal-img').alt = playlist.title + ' Cover';
  document.getElementById('modal-title').textContent = playlist.title;
  document.getElementById('modal-creator').textContent = 'By ' + playlist.creator;
  document.getElementById('modal-likes').textContent = 'Likes: ' + playlist.likes;
  
  const aiDescription = document.querySelector('#view-modal .ai-description');
  if (aiDescription) {
    aiDescription.textContent = '';
    aiDescription.className = 'ai-description';
  }
  
  const songList = document.getElementById('modal-songs');
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

function openModal(playlist) {
  currentPlaylist = playlist;
  populateModal(playlist);
  document.getElementById('view-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('view-modal').style.display = 'none';
}

// Modal event listeners
if (document.getElementById('view-modal')) {
  document.querySelector('#view-modal .close-btn').addEventListener('click', closeModal);
  
  document.getElementById('view-modal').addEventListener('click', (e) => {
    if (e.target.id === 'view-modal') {
      closeModal();
    }
  });
  
  document.querySelector('.shuffle-btn').addEventListener('click', () => {
    if (currentPlaylist) {
      shuffleSongs(currentPlaylist);
    }
  });
  
  document.querySelector('.ai-description-btn').addEventListener('click', async () => {
    if (!currentPlaylist) return;
    
    const aiDescription = document.querySelector('#view-modal .ai-description');
    
    aiDescription.textContent = 'Generating description...';
    aiDescription.className = 'ai-description loading';
    
    const description = await getPlaylistDescription(currentPlaylist);
    
    if (description === FAILURE_MESSAGE) {
      aiDescription.className = 'ai-description error';
    } else {
      aiDescription.className = 'ai-description';
    }
    aiDescription.textContent = description;
  });
}
