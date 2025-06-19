// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/posts';
let currentPage = 1;
const postsPerPage = 9;
let totalPosts = 0;

// DOM Elements
const postsContainer = document.getElementById('posts-container');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');

// Category filter buttons
const categoryButtons = document.querySelectorAll('.category-chip');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Category filtering
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => {
                    btn.classList.remove('bg-admin-blue', 'text-white');
                    btn.classList.add('bg-admin-cream', 'text-admin-blue', 'border-admin-sage');
                });
                
                // Add active class to clicked button
                button.classList.add('bg-admin-blue', 'text-white');
                button.classList.remove('bg-admin-cream', 'text-admin-blue', 'border-admin-sage');
                
                currentPage = 1;
                fetchPosts(button.textContent.trim() === 'All Categories' ? '' : button.textContent.trim());
            });
        });
    }
    
    // Search functionality - updated selectors to match your HTML
    const searchInput = document.querySelector('input[type="text"][placeholder="Search articles..."]');
    const searchButton = document.querySelector('button[class*="bg-admin-sand"]'); // Selector for the sand-colored button
    
    if (searchInput && searchButton) {
        const performSearch = () => {
            currentPage = 1;
            fetchPosts('', searchInput.value);
        };
        
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // Pagination - added null checks
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchPosts();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < Math.ceil(totalPosts / postsPerPage)) {
                currentPage++;
                fetchPosts();
            }
        });
    }
}

// Fetch posts from API
async function fetchPosts(category = '', search = '') {
    try {
        // Show loading state
        postsContainer.innerHTML = `
            <div class="bg-white rounded-lg overflow-hidden shadow-md hover-scale border border-gray-100 col-span-3">
                <div class="h-48 bg-admin-sage flex items-center justify-center text-white">
                    <i class="fas fa-book-open fa-3x opacity-50"></i>
                </div>
                <div class="p-6">
                    <div class="flex items-center mb-3">
                        <span class="text-xs px-3 py-1 bg-admin-sand text-admin-blue rounded-full font-medium">Loading</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2 text-admin-blue font-serif">Loading Articles...</h3>
                    <p class="text-gray-600 mb-4">Please wait while we load the latest spiritual insights for you.</p>
                </div>
            </div>
        `;
        
        // Build query string
        let query = `?page=${currentPage}&limit=${postsPerPage}`;
        if (category) {
            query += `&category=${category.toLowerCase().replace(' ', '-')}`;
        }
        if (search) {
            query += `&search=${encodeURIComponent(search)}`;
        }
        
        const response = await fetch(`${API_BASE_URL}${query}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        renderPosts(data.posts);
        totalPosts = data.totalPosts;
        
        // Only update pagination if elements exist
        if (prevPageBtn && nextPageBtn) {
            updatePagination();
        }
        
    } catch (error) {
        console.error('Error fetching posts:', error);
        postsContainer.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <div class="bg-white p-6 rounded-lg shadow-md border border-red-200 max-w-md mx-auto">
                    <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2 text-admin-blue">Error Loading Content</h3>
                    <p class="text-gray-600 mb-4">Failed to load posts. Please try again later.</p>
                    <button onclick="fetchPosts()" class="px-4 py-2 bg-admin-blue text-white rounded hover:bg-admin-blue/80 transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

// Rest of your JavaScript code (renderPosts, updatePagination, helper functions) remains the same...

// Render posts to the container
function renderPosts(posts) {
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-md mx-auto">
                    <i class="fas fa-book-open text-admin-sage text-4xl mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2 text-admin-blue">No Posts Found</h3>
                    <p class="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                </div>
            </div>
        `;
        return;
    }

    postsContainer.innerHTML = posts.map(post => `
        <div class="bg-white rounded-lg overflow-hidden shadow-md hover-scale border border-gray-100">
            <div class="h-48 ${getCategoryImageBg(post.post_category)} flex items-center justify-center text-white">
                <i class="${getCategoryIcon(post.post_category)} fa-3x opacity-70"></i>
            </div>
            <div class="p-6">
                <div class="flex items-center mb-3">
                    <span class="text-xs px-3 py-1 ${getCategoryColor(post.post_category)} rounded-full font-medium">
                        ${formatCategory(post.post_category)}
                    </span>
                    <span class="text-xs text-gray-500 ml-auto">
                        ${new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
                <h3 class="text-xl font-semibold mb-2 text-admin-blue font-serif hover:text-admin-sage transition-colors">
                    <a href="post.html?id=${post._id}">${post.post_title}</a>
                </h3>
                <p class="text-gray-600 mb-4 line-clamp-2">${post.post_content.substring(0, 150)}...</p>
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full ${getCategoryAuthorBg(post.post_category)} flex items-center justify-center text-white text-sm">
                        ${post.post_author.charAt(0).toUpperCase()}
                    </div>
                    <span class="ml-3 text-sm text-gray-600">${post.post_author}</span>
                    <a href="post.html?id=${post._id}" class="ml-auto text-admin-blue hover:text-admin-sage text-sm font-medium flex items-center">
                        Read More <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Update pagination controls
// Update your updatePagination function to this:
function updatePagination() {
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    // Get the page number button element
    const pageNumberBtn = document.querySelector('#pageNumber');
    
    // Update the page number display
    if (pageNumberBtn) {
        pageNumberBtn.textContent = currentPage;
    }
    
    // Update button states
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages || totalPages === 0;
    
    // Visual feedback for disabled buttons
    prevPageBtn.classList.toggle('opacity-50', currentPage <= 1);
    prevPageBtn.classList.toggle('cursor-not-allowed', currentPage <= 1);
    nextPageBtn.classList.toggle('opacity-50', currentPage >= totalPages || totalPages === 0);
    nextPageBtn.classList.toggle('cursor-not-allowed', currentPage >= totalPages || totalPages === 0);
}

// Helper functions
function getCategoryColor(category) {
    const colors = {
        'devotional': 'bg-admin-blue/10 text-admin-blue',
        'bible-study': 'bg-admin-sage/10 text-admin-sage',
        'sermon': 'bg-purple-100 text-purple-800',
        'testimony': 'bg-admin-sand/10 text-amber-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
}

function getCategoryImageBg(category) {
    const colors = {
        'devotional': 'bg-admin-blue',
        'bible-study': 'bg-admin-sage',
        'sermon': 'bg-purple-600',
        'testimony': 'bg-admin-sand'
    };
    return colors[category] || 'bg-gray-600';
}

function getCategoryAuthorBg(category) {
    const colors = {
        'devotional': 'bg-admin-blue',
        'bible-study': 'bg-admin-sage',
        'sermon': 'bg-purple-600',
        'testimony': 'bg-admin-sand'
    };
    return colors[category] || 'bg-gray-600';
}

function getCategoryIcon(category) {
    const icons = {
        'devotional': 'fas fa-pray',
        'bible-study': 'fas fa-bible',
        'sermon': 'fas fa-microphone-alt',
        'testimony': 'fas fa-hand-holding-heart'
    };
    return icons[category] || 'fas fa-book-open';
}

function formatCategory(category) {
    const names = {
        'devotional': 'Devotional',
        'bible-study': 'Bible Study',
        'sermon': 'Sermon',
        'testimony': 'Testimony'
    };
    return names[category] || category;
}