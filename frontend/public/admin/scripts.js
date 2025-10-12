// API Configuration
const API_BASE_URL = 'https://blognest-hcer.onrender.com/api/posts';
let currentPage = 1;
const postsPerPage = 10;
let totalPosts = 0;
let currentPostId = null;
let postsData = [];

// DOM Elements
const postsTable = document.getElementById('posts-table');
const postsSection = document.getElementById('posts-section');
const editSection = document.getElementById('edit-section');
const postForm = document.getElementById('post-form');
const formTitle = document.getElementById('form-title');
const categoryFilter = document.getElementById('category-filter');
const newPostBtn = document.getElementById('new-post-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const postModal = document.getElementById('post-modal');
const closeModalBtn = document.getElementById('close-modal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    newPostBtn.addEventListener('click', showNewPostForm);
    cancelEditBtn.addEventListener('click', showPostsList);
    
    // Form submission
    postForm.addEventListener('submit', handleFormSubmit);
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPosts();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < Math.ceil(totalPosts / postsPerPage)) {
            currentPage++;
            fetchPosts();
        }
    });
    
    // Filtering
    categoryFilter.addEventListener('change', () => {
        currentPage = 1;
        fetchPosts();
    });
    
    // Modal
    closeModalBtn.addEventListener('click', () => {
        postModal.classList.add('hidden');
    });
}

// Fetch posts from API
async function fetchPosts() {
    try {
        // Show loading state
        postsTable.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center">
                    <div class="flex justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-admin-blue"></div>
                    </div>
                </td>
            </tr>
        `;
        
        // Build query string
        let query = `?page=${currentPage}&limit=${postsPerPage}`;
        if (categoryFilter.value) {
            query += `&category=${categoryFilter.value}`;
        }
        
        const response = await fetch(`${API_BASE_URL}${query}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        postsData = data.posts;
        totalPosts = data.totalPosts;
        
        renderPostsTable();
        updatePagination();
    } catch (error) {
        console.error('Error fetching posts:', error);
        showNotification('Failed to load posts. Please try again.', 'error');
        postsTable.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-red-600">
                    Error loading posts
                </td>
            </tr>
        `;
    }
}

// Render posts to the table
function renderPostsTable() {
    postsTable.innerHTML = postsData.map(post => `
        <tr class="hover:bg-gray-50" data-id="${post._id}">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900 cursor-pointer hover:text-admin-blue post-title">
                    ${post.post_title}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-gray-600">${post.post_author}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full ${getCategoryColor(post.post_category)}">
                    ${formatCategory(post.post_category)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full ${post.post_visibility ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${post.post_visibility ? 'Visible' : 'Hidden'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${new Date(post.createdAt).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-admin-blue hover:text-admin-blue/80 mr-3 edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800 delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to table rows and buttons
    document.querySelectorAll('.post-title').forEach(title => {
        title.addEventListener('click', (e) => {
            const postId = e.target.closest('tr').dataset.id;
            showPostModal(postId);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.closest('tr').dataset.id;
            editPost(postId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.closest('tr').dataset.id;
            deletePost(postId);
        });
    });
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Show new post form
function showNewPostForm() {
    currentPostId = null;
    formTitle.textContent = 'New Post';
    postForm.reset();
    document.getElementById('post-visibility').checked = false;
    postsSection.classList.add('hidden');
    editSection.classList.remove('hidden');
}

// Show edit form with post data
async function editPost(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }
        
        const post = await response.json();
        currentPostId = post._id;
        
        // Fill the form
        document.getElementById('post-title').value = post.post_title;
        document.getElementById('post-author').value = post.post_author;
        document.getElementById('post-category').value = post.post_category;
        document.getElementById('post-content').value = post.post_content;
        document.getElementById('post-visibility').checked = post.post_visibility;
        
        formTitle.textContent = 'Edit Post';
        postsSection.classList.add('hidden');
        editSection.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching post:', error);
        showNotification('Failed to load post for editing.', 'error');
    }
}

// Show posts list
function showPostsList() {
    postsSection.classList.remove('hidden');
    editSection.classList.add('hidden');
}

// Show single post in modal
async function showPostModal(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse ONCE and store in `data`

        const post = data.post; // Extract post from response (adjust if structure differs)
        currentPostId = post._id;

        // Fill modal
        document.getElementById('modal-post-title').textContent = post.post_title;
        document.getElementById('modal-post-author').textContent = `By ${post.post_author}`;
        document.getElementById('modal-post-category').textContent = formatCategory(post.post_category);
        document.getElementById('modal-post-category').className = `px-2 py-1 text-xs rounded-full ${getCategoryColor(post.post_category)}`;
        document.getElementById('modal-post-date').textContent = new Date(post.createdAt).toLocaleDateString();
        document.getElementById('modal-post-content').textContent = post.post_content;

        // Set up modal buttons
        document.getElementById('edit-post-btn').onclick = () => {
            postModal.classList.add('hidden');
            editPost(post._id);
        };

        document.getElementById('toggle-visibility-btn').onclick = () => {
            togglePostVisibility(post._id, post.post_visibility);
        };

        document.getElementById('delete-post-btn').onclick = () => {
            deletePost(post._id);
        };

        postModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error in showPostModal:', error);
        showNotification('Failed to load post details.', 'error');
    }
}
// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const postData = {
        post_title: document.getElementById('post-title').value.trim(),
        post_author: document.getElementById('post-author').value.trim(),
        post_category: document.getElementById('post-category').value,
        post_content: document.getElementById('post-content').value.trim(),
        post_visibility: document.getElementById('post-visibility').checked
    };
    
    // Validate
    if (!postData.post_title || !postData.post_author || !postData.post_content) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        let response;
        if (currentPostId) {
            // Update existing post
            response = await fetch(`${API_BASE_URL}/${currentPostId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
        } else {
            // Create new post
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
        }
        
        if (!response.ok) {
            throw new Error('Failed to save post');
        }
        
        showNotification(`Post ${currentPostId ? 'updated' : 'created'} successfully`, 'success');
        showPostsList();
        fetchPosts();
    } catch (error) {
        console.error('Error saving post:', error);
        showNotification('Failed to save post. Please try again.', 'error');
    }
}

// Delete post
async function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/${postId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete post');
            }
            
            showNotification('Post deleted successfully', 'success');
            postModal.classList.add('hidden');
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            showNotification('Failed to delete post. Please try again.', 'error');
        }
    }
}

// Toggle post visibility
async function togglePostVisibility(postId, currentVisibility) {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}/visibility`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ post_visibility: !currentVisibility })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update visibility');
        }
        
        showNotification(`Post is now ${!currentVisibility ? 'visible' : 'hidden'}`, 'success');
        fetchPosts();
        postModal.classList.add('hidden');
    } catch (error) {
        console.error('Error toggling visibility:', error);
        showNotification('Failed to update visibility. Please try again.', 'error');
    }
}

// Helper functions
function getCategoryColor(category) {
    const colors = {
        'history': 'bg-blue-100 text-blue-800',
        'technology': 'bg-purple-100 text-purple-800',
        'thoughts': 'bg-green-100 text-green-800',
        'theology': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
}

function formatCategory(category) {
    const names = {
        'technology': 'Technology',
        'thoughts': 'Thoughts',
        'theology': 'Theology',
        'history': 'History',
        'news': 'News'
    };
    return names[category] || category;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white flex items-center ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    notification.innerHTML = `
        <i class="fas ${
            type === 'error' ? 'fa-exclamation-circle' : 
            type === 'success' ? 'fa-check-circle' : 'fa-info-circle'
        } mr-2"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}