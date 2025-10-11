// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/posts';

// DOM Elements
let currentPage = 1;
let currentLimit = 6;
let currentCategory = 'all';
let currentSearch = '';

// Utility Functions
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const getCategoryClass = (category) => {
    const categoryClasses = {
        'technology': 'category-tech',
        'thoughts': 'category-science',
        'history': 'category-lifestyle',
        'theology': 'category-research',
        'news': 'category-news'
    };
    return categoryClasses[category] || 'category-tech';
};

const getCategoryDisplayName = (category) => {
    const displayNames = {
        'technology': 'Technology',
        'thoughts': 'Thoughts',
        'history': 'History',
        'theology': 'Theology',
        'news': 'News'
    };
    return displayNames[category] || category;
};

// API Functions
class BlogAPI {
    static async fetchPaginatedPosts(page = 1, limit = 6, category = '', search = '') {
        try {
            let url = `${API_BASE_URL}?page=${page}&limit=${limit}`;
            
            if (category && category !== 'all') {
                url += `&category=${category}`;
            }
            
            if (search) {
                // Note: You'll need to implement search functionality in your backend
                // This assumes your backend supports search by title
                url += `&search=${encodeURIComponent(search)}`;
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching paginated posts:', error);
            throw error;
        }
    }

    static async fetchLatestPosts() {
        try {
            const response = await fetch(`${API_BASE_URL}/new_posts`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching latest posts:', error);
            throw error;
        }
    }

    static async fetchCategoryCounts() {
        try {
            // This would require a new endpoint in your backend
            // For now, we'll fetch all posts and count manually
            const response = await fetch(`${API_BASE_URL}?limit=1000`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const counts = {};
            
            data.posts.forEach(post => {
                counts[post.post_category] = (counts[post.post_category] || 0) + 1;
            });
            
            return counts;
        } catch (error) {
            console.error('Error fetching category counts:', error);
            throw error;
        }
    }

    static async searchPosts(searchTerm) {
        try {
            // This would require search implementation in your backend
            const response = await fetch(`${API_BASE_URL}?search=${encodeURIComponent(searchTerm)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error searching posts:', error);
            throw error;
        }
    }
}

// DOM Manipulation Functions
class BlogRenderer {
    static renderBlogPosts(posts, containerId) {
        const container = document.getElementById(containerId);
        
        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-12">
                    <i class="fas fa-inbox text-4xl text-secondary-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-secondary-600">No posts found</h3>
                    <p class="text-secondary-500 mt-2">Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="post-card bg-white rounded-xl shadow-sm overflow-hidden border border-secondary-100" 
                 data-category="${post.post_category}">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <span class="${getCategoryClass(post.post_category)} text-xs font-semibold px-3 py-1 rounded-full">
                            ${getCategoryDisplayName(post.post_category)}
                        </span>
                        <span class="text-secondary-400 text-sm">
                            <i class="far fa-clock mr-1"></i>4 min read
                        </span>
                    </div>
                    <h3 class="text-xl font-bold text-secondary-800 mb-3">${post.post_title}</h3>
                    <p class="text-secondary-600 mb-4 leading-relaxed">
                        ${post.post_content.substring(0, 150)}
                    </p>
                   <div class="flex justify-between items-center pt-4 border-t border-secondary-100">
                    <span class="text-secondary-500 text-sm">${formatDate(post.createdAt)}</span>
                        <a href="single_post.html?postid=${post._id}" 
                        class="text-primary-600 font-medium hover:text-primary-700 flex items-center read-more"'>
                            Read More <i class="fas fa-arrow-right ml-2 text-sm"></i>
                        </a>
                </div>

                </div>
            </div>
        `).join('');
    }

    static renderLatestPosts(posts, containerClass) {
        const container = document.querySelector(containerClass);
        
        if (!posts || posts.length === 0) {
            container.innerHTML = '<p class="text-secondary-500">No recent posts</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <a href="single_post.html?postid=${post._id}" 
            <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary-50 transition">
                      
                <div class="w-12 h-12 rounded-lg bg-${this.getCategoryColor(post.post_category.toLowerCase())}-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                    <i class="fas fa-newspaper text-${this.getCategoryColor(post.post_category.toLowerCase())}-400"></i> 
                </div>
                <div>
                    <h3 class="font-medium text-secondary-800 hover:text-primary-600 cursor-pointer">
                        ${post.post_title}
                    </h3>
                    <div class="flex items-center mt-1">
                        <span class="text-xs text-secondary-500">${formatDate(post.createdAt)}</span>
                        <span class="mx-2 text-secondary-300">•</span>
                        <span class="text-xs text-secondary-500">${getCategoryDisplayName(post.post_category)}</span>
                    </div>
                </div>
                 
            </div>
             </a>
        `).join('');
    }

    static renderCategoryCounts(counts, containerClass) {
        const container = document.querySelector(containerClass);
        const categories = ['technology', 'thoughts', 'history', 'theology', 'news'];
        
        container.innerHTML = categories.map(category => `
            <a href="#" class="category-filter flex justify-between items-center py-2 px-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 transition" data-category="${category}">
                <div class="flex items-center">
                    <span class="w-2 h-2 rounded-full bg-${this.getCategoryColor(category)}-500 mr-3"></span>
                    <span>${getCategoryDisplayName(category)}</span>
                </div>
                <span class="bg-secondary-100 text-secondary-800 text-xs font-medium px-2 py-1 rounded-full">
                    ${counts[category] || 0}
                </span>
            </a>
        `).join('');
    }

    static getCategoryColor(category) {
        const colors = {
            'technology': 'blue',
            'thoughts': 'green',
            'history': 'purple',
            'theology': 'yellow',
            'news': 'red'
        };
        return colors[category] || 'blue';
    }

    static renderPagination(currentPage, totalPages, containerClass) {
            const container = document.querySelector(containerClass);
            if (!container) return;

            let paginationHTML = `
                <!-- Previous Button -->
                <a href="#" 
                class="page-prev relative inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-500 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                    <i class="fas fa-chevron-left mr-2"></i>
                    Previous
                </a>
            `;

            // Page numbers with ellipsis logic
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    paginationHTML += `
                        <a href="#" 
                        class="page-number relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                i === currentPage
                                    ? 'text-white bg-primary-600 border border-primary-600'
                                    : 'text-secondary-700 bg-white border border-secondary-300 hover:bg-secondary-50 transition'
                            } rounded-lg"
                        data-page="${i}">
                            ${i}
                        </a>
                    `;
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                    paginationHTML += `
                        <span class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg">
                            ...
                        </span>
                    `;
                }
            }

            paginationHTML += `
                <!-- Next Button -->
                <a href="#" 
                class="page-next relative inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-500 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
                    Next
                    <i class="fas fa-chevron-right ml-2"></i>
                </a>
            `;

            container.innerHTML = paginationHTML;
        }

}

// Main Application Controller
class BlogApp {
    static async init() {
        try {
            // Load initial data
            await this.loadPaginatedPosts();
            await this.loadLatestPosts();
            await this.loadCategoryCounts();
            
            // Set up event listeners
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing blog app:', error);
            this.showError('Failed to load blog content');
        }
    }

    static async loadPaginatedPosts() {
        try {
            const data = await BlogAPI.fetchPaginatedPosts(
                currentPage, 
                currentLimit, 
                currentCategory === 'all' ? '' : currentCategory, 
                currentSearch
            );
            
            console.log(data.posts);
            BlogRenderer.renderBlogPosts(data.posts, 'blogPosts');
            BlogRenderer.renderPagination(data.currentPage, data.totalPages, '.pagination-container');
        } catch (error) {
            this.showError('Failed to load posts');
        }
    }

    static async loadLatestPosts() {
        try {
            const data = await BlogAPI.fetchLatestPosts();
            BlogRenderer.renderLatestPosts(data.posts, '.latest-posts-container');
        } catch (error) {
            console.error('Error loading latest posts:', error);
        }
    }

    static async loadCategoryCounts() {
        try {
            const counts = await BlogAPI.fetchCategoryCounts();
            BlogRenderer.renderCategoryCounts(counts, '.categories-container');
        } catch (error) {
            console.error('Error loading category counts:', error);
        }
    }

    static setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentSearch = e.target.value;
                    currentPage = 1;
                    this.loadPaginatedPosts();
                }, 500);
            });
        }

        // Category filter
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                currentCategory = e.target.value;
                currentPage = 1;
                this.loadPaginatedPosts();
            });
        }

        // Pagination event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.page-number')) {
                e.preventDefault();
                const page = parseInt(e.target.closest('.page-number').dataset.page);
                currentPage = page;
                this.loadPaginatedPosts();
            }

            if (e.target.closest('.page-prev') && currentPage > 1) {
                e.preventDefault();
                currentPage--;
                this.loadPaginatedPosts();
            }

            if (e.target.closest('.page-next')) {
                e.preventDefault();
                currentPage++;
                this.loadPaginatedPosts();
            }

            if (e.target.closest('.category-filter')) {
                e.preventDefault();
                const category = e.target.closest('.category-filter').dataset.category;
                currentCategory = category;
                document.getElementById('category').value = category;
                currentPage = 1;
                this.loadPaginatedPosts();
            }
        });
    }

    static showError(message) {
        // You can implement a toast or alert system here
        console.error('Blog App Error:', message);
    }
}


document.getElementById('newsletterSubscribe').addEventListener('click', async (e) => {
    e.preventDefault(); // prevent default form submission

    const emailInput = document.getElementById('newsletterEmail');
    const message = document.getElementById('newsletterMessage');
    const email = emailInput.value.trim();

    if (!email) {
        message.textContent = 'Please enter your email';
        message.style.color = 'yellow';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = data.message || 'Subscribed successfully!';
            message.style.color = 'lightgreen';
            emailInput.value = '';
        } else {
            message.textContent = data.message || 'Subscription failed';
            message.style.color = 'orange';
        }
    } catch (error) {
        console.error('Error subscribing:', error);
        message.textContent = 'Server error. Please try again later.';
        message.style.color = 'red';
    }
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    BlogApp.init();


});