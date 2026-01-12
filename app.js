// CSV Data Analysis Application
// Handles CSV parsing, filtering, and data visualization
// Interacts with index.html to provide filtering by source, tags, status, and date ranges

let allData = [];
let filteredData = [];
let currentPage = 1;
const recordsPerPage = 50;
let leadsChart = null;

// Initialize the application
function initApp() {
    // Check if we're running from a server (http://) or file://
    const isLocalServer = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    
    if (isLocalServer) {
        // Automatically load the CSV file on page load
        loadCSVFile('input/data.csv');
    } else {
        // If running from file://, show error
        alert('Please run from a local server (http://localhost:8001) to load the CSV file automatically.');
    }
    
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('exportBtn').addEventListener('click', exportFilteredData);
}

// Wait for DOM and Chart.js to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Chart.js is already loaded
    if (typeof Chart !== 'undefined') {
        initApp();
    } else {
        // Wait for Chart.js to load
        const checkChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                clearInterval(checkChart);
                initApp();
            }
        }, 50);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkChart);
            if (typeof Chart === 'undefined') {
                console.error('Chart.js failed to load. The chart will not be available.');
                // Still initialize the app without chart
                initApp();
            } else {
                initApp();
            }
        }, 5000);
    }
});

// Parse CSV file
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const record = {};
            headers.forEach((header, index) => {
                record[header] = values[index] || '';
            });
            data.push(record);
        }
    }
    
    return data;
}

// Parse CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    
    return values;
}

// Load CSV file from server
function loadCSVFile(filePath) {
    console.log('Attempting to load CSV from:', filePath);
    
    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    fetch(filePath, { signal: controller.signal })
        .then(response => {
            console.log('Response status:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Failed to load CSV file: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(text => {
            clearTimeout(timeoutId);
            console.log('CSV loaded, length:', text.length);
            allData = parseCSV(text);
            console.log('Parsed records:', allData.length);
            
            if (allData.length > 0) {
                populateFilters();
                applyFilters();
                document.getElementById('filtersSection').style.display = 'block';
                document.getElementById('statsSection').style.display = 'block';
                document.getElementById('chartSection').style.display = 'block';
                document.getElementById('tableSection').style.display = 'block';
            } else {
                alert('No data found in CSV file');
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.error('Error loading CSV:', error);
            let errorMsg = 'Error loading CSV file: ' + error.message;
            if (error.name === 'AbortError') {
                errorMsg = 'Request timed out. Please check your connection and try refreshing the page.';
            }
            alert(errorMsg + '\n\nMake sure you are accessing the page via http://localhost:8001 (not file://)\n\nCheck the browser console (F12) for more details.');
        });
}


// Populate filter dropdowns with unique values
function populateFilters() {
    const sources = new Set();
    const statuses = new Set();
    const tags = new Set();
    
    allData.forEach(record => {
        if (record.Source) sources.add(record.Source);
        if (record.Status) statuses.add(record.Status);
        
        if (record.Tags) {
            const tagList = record.Tags.split(',').map(t => t.trim()).filter(t => t);
            tagList.forEach(tag => tags.add(tag));
        }
    });
    
    // Populate Source filter
    const sourceFilter = document.getElementById('sourceFilter');
    Array.from(sources).sort().forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        sourceFilter.appendChild(option);
    });
    
    // Populate Status filter
    const statusFilter = document.getElementById('statusFilter');
    Array.from(statuses).sort().forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusFilter.appendChild(option);
    });
    
    // Populate Tags filter
    const tagsFilter = document.getElementById('tagsFilter');
    Array.from(tags).sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagsFilter.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const selectedSources = Array.from(document.getElementById('sourceFilter').selectedOptions)
        .map(opt => opt.value).filter(v => v);
    const selectedStatuses = Array.from(document.getElementById('statusFilter').selectedOptions)
        .map(opt => opt.value).filter(v => v);
    const selectedTags = Array.from(document.getElementById('tagsFilter').selectedOptions)
        .map(opt => opt.value).filter(v => v);
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    filteredData = allData.filter(record => {
        // Source filter
        if (selectedSources.length > 0 && !selectedSources.includes(record.Source)) {
            return false;
        }
        
        // Status filter
        if (selectedStatuses.length > 0 && !selectedStatuses.includes(record.Status)) {
            return false;
        }
        
        // Tags filter
        if (selectedTags.length > 0) {
            const recordTags = record.Tags ? record.Tags.split(',').map(t => t.trim()) : [];
            const hasTag = selectedTags.some(tag => recordTags.includes(tag));
            if (!hasTag) return false;
        }
        
        // Date filter
        if (startDate || endDate) {
            const createdDate = parseDate(record.Created);
            if (!createdDate) return false;
            
            if (startDate && createdDate < new Date(startDate)) return false;
            if (endDate && createdDate > new Date(endDate + 'T23:59:59')) return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    updateStats();
    updateChart();
    displayTable();
    updatePagination();
}

// Parse date string to Date object
function parseDate(dateString) {
    if (!dateString) return null;
    
    // Handle format like "Mon Dec 29, 2025 03:49 pm"
    const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const parts = dateString.match(/(\w{3})\s+(\w{3})\s+(\d+),\s+(\d+)\s+(\d+):(\d+)\s+(am|pm)/i);
    if (parts) {
        const month = months[parts[2]];
        const day = parseInt(parts[3]);
        const year = parseInt(parts[4]);
        let hour = parseInt(parts[5]);
        const minute = parseInt(parts[6]);
        const ampm = parts[7].toLowerCase();
        
        if (ampm === 'pm' && hour !== 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        
        return new Date(year, month, day, hour, minute);
    }
    
    return null;
}

// Update statistics
function updateStats() {
    const total = allData.length;
    const filtered = filteredData.length;
    const converted = filteredData.filter(r => r.Status === 'Submitted' || r['Lead Converted date']).length;
    const conversionRate = filtered > 0 ? ((converted / filtered) * 100).toFixed(1) : 0;
    
    document.getElementById('totalCount').textContent = total.toLocaleString();
    document.getElementById('filteredCount').textContent = filtered.toLocaleString();
    document.getElementById('conversionRate').textContent = conversionRate + '%';
}

// Update chart with lead volume over time
function updateChart() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded yet, skipping chart update');
        return;
    }
    
    // Group leads by date
    const dateCounts = new Map();
    
    filteredData.forEach(record => {
        const date = parseDate(record.Created);
        if (date) {
            // Group by day (YYYY-MM-DD)
            const dateKey = date.toISOString().split('T')[0];
            dateCounts.set(dateKey, (dateCounts.get(dateKey) || 0) + 1);
        }
    });
    
    // Sort dates
    const sortedDates = Array.from(dateCounts.keys()).sort();
    const labels = sortedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const data = sortedDates.map(date => dateCounts.get(date));
    
    const ctx = document.getElementById('leadsChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (leadsChart) {
        leadsChart.destroy();
    }
    
    leadsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Leads',
                data: data,
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Display table with pagination
function displayTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let displayData = filteredData;
    
    // Apply search filter
    if (searchTerm) {
        displayData = filteredData.filter(record => {
            return Object.values(record).some(value => 
                value && value.toString().toLowerCase().includes(searchTerm)
            );
        });
    }
    
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const pageData = displayData.slice(start, end);
    
    // Create table header
    if (pageData.length > 0) {
        const headers = Object.keys(pageData[0]);
        const thead = document.getElementById('tableHead');
        thead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
        
        // Create table body
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = pageData.map(record => {
            return '<tr>' + headers.map(header => {
                const value = record[header] || '';
                return `<td>${escapeHtml(value)}</td>`;
            }).join('') + '</tr>';
        }).join('');
    } else {
        document.getElementById('tableHead').innerHTML = '';
        document.getElementById('tableBody').innerHTML = '<tr><td colspan="100%">No data found</td></tr>';
    }
    
    updatePagination(displayData.length);
}

// Update pagination
function updatePagination(totalRecords = filteredData.length) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (!pagination) {
        console.error('Pagination element not found');
        return;
    }
    
    if (totalPages <= 1) {
        pagination.innerHTML = `<div class="pagination-info">Showing all ${totalRecords} records</div>`;
        return;
    }
    
    let html = '<div class="pagination-controls">';
    
    // Previous button
    html += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="page-ellipsis">...</span>';
        }
    }
    
    // Next button
    html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    html += '</div>';
    pagination.innerHTML = html;
    
    // Add event listeners to pagination buttons
    const pageButtons = pagination.querySelectorAll('.page-btn[data-page]');
    pageButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const page = parseInt(e.target.getAttribute('data-page'));
            goToPage(page);
        });
    });
}

// Go to specific page
function goToPage(page) {
    const totalPages = Math.ceil(filteredData.length / recordsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayTable();
    }
}

// Clear all filters
function clearFilters() {
    document.getElementById('sourceFilter').selectedIndex = -1;
    document.getElementById('statusFilter').selectedIndex = -1;
    document.getElementById('tagsFilter').selectedIndex = -1;
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('searchInput').value = '';
    applyFilters();
}

// Handle search input
function handleSearch() {
    currentPage = 1;
    displayTable();
}

// Export filtered data to CSV
function exportFilteredData() {
    if (filteredData.length === 0) {
        alert('No data to export');
        return;
    }
    
    const headers = Object.keys(filteredData[0]);
    const csvContent = [
        headers.join(','),
        ...filteredData.map(record => 
            headers.map(header => {
                const value = record[header] || '';
                // Escape quotes and wrap in quotes if contains comma or quote
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// goToPage is now only called via event listeners, no need to expose globally
