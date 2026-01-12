# CSV Data Analysis Interface

A web-based interface for analyzing CSV data with advanced filtering capabilities.

## Project Structure

```
csv analysis/
├── index.html          # Main HTML interface with filter controls and data table
├── app.js              # JavaScript logic for CSV parsing, filtering, and data manipulation
├── styles.css          # Modern styling and responsive design
├── input/
│   └── data.csv        # CSV data file (automatically loaded on page load)
├── export_export (16).csv  # Original CSV data file
└── README.md           # This file - project documentation
```

## Features

- **Automatic Data Loading**: CSV file is automatically loaded from `input/data.csv` on page load
- **Optional File Upload**: You can still upload a different CSV file if needed
- **Multi-Filter Support**:
  - Filter by Source (multiple selection)
  - Filter by Status (multiple selection)
  - Filter by Tags (multiple selection)
  - Filter by Date Range (Created date)
- **Real-time Search**: Search across all fields in the filtered results
- **Statistics Dashboard**: View total records, filtered count, and conversion rate
- **Pagination**: Navigate through large datasets (50 records per page)
- **Export Functionality**: Export filtered data as CSV

## Running on Localhost

### Option 1: Python HTTP Server (Recommended)
```bash
cd "/Users/alistairstpierre/Documents/csv analysis"
python3 -m http.server 8000
```
Then open your browser and navigate to: `http://localhost:8000`

### Option 2: Node.js http-server
If you have Node.js installed:
```bash
npx http-server -p 8000
```

### Option 3: Direct File Opening
You can also simply open `index.html` directly in your browser, though some browsers may have restrictions on file uploads when opened as a file:// URL.

## How to Use

1. Navigate to `http://localhost:8001` (or the port your server is running on)
2. The CSV file from `input/data.csv` will automatically load
3. Use the filter dropdowns to select:
   - Sources (hold Ctrl/Cmd for multiple selections)
   - Statuses (hold Ctrl/Cmd for multiple selections)
   - Tags (hold Ctrl/Cmd for multiple selections)
   - Date range using the date pickers
4. Click "Apply Filters" to see filtered results
5. Use the search box to further filter the displayed results
6. Navigate through pages using pagination controls
7. Click "Export Filtered Data" to download the filtered results as CSV

## File Descriptions

### index.html
The main HTML structure containing:
- File upload interface
- Filter controls (Source, Status, Tags, Date Range)
- Statistics display cards
- Data table with pagination
- Search functionality

### app.js
JavaScript application logic that handles:
- CSV file parsing (handles quoted values and commas)
- Dynamic filter population from CSV data
- Multi-criteria filtering logic
- Date parsing and filtering
- Table rendering with pagination
- Search functionality
- CSV export functionality

### styles.css
Modern, responsive CSS styling featuring:
- Gradient backgrounds
- Card-based statistics display
- Responsive design for mobile devices
- Hover effects and transitions
- Sticky table headers for better navigation

## Browser Compatibility

Works in all modern browsers that support:
- FileReader API
- ES6 JavaScript features
- CSS Grid and Flexbox

## Notes

- The CSV parser handles quoted values and commas within fields
- Date parsing supports the format: "Mon Dec 29, 2025 03:49 pm"
- Multiple selections in filter dropdowns require holding Ctrl (Windows/Linux) or Cmd (Mac)
- All data processing happens client-side - no server required
