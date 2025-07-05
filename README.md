# 🔍 MBB Component Inspector

A Chrome extension that helps you inspect and highlight custom components like `mbb-button`, `mbb-typography`, `flo-*`, etc. on any webpage.

## ✨ Enhanced Features

- **🎯 Smart Component Detection**: Automatically finds the nearest custom component when you hover over any element
- **📋 Enhanced Tooltips**: Rich component information with organized sections:
  - 🏷️ Component name and text content
  - 🎯 MBB-specific properties (extracted from Angular inputs)
  - 🎨 Style information (variant, size, theme extracted from classes)
  - 🏗️ Component hierarchy (parent and children components)
- **📋 Intelligent Copy**: Click to copy meaningful component structure with:
  - Clean MBB properties (no Angular noise like `ng-reflect-*`)
  - Component context and hierarchy
  - Style information as comments
- **🎨 Visual Highlighting**: Beautiful overlay with pulsing animation
- **🔄 Toggle On/Off**: Easy enable/disable from the extension popup
- **🌍 Works Everywhere**: Compatible with any website including Angular applications

## 🚀 Installation

### Step 1: Download the Extension
This extension is not yet published on the Chrome Web Store. You'll need to install it in Developer Mode:

1. Download or clone this repository
2. Make sure you have all these files:
   ```
   mbb-component-inspector/
   ├── manifest.json
   ├── content.js
   ├── styles.css
   ├── popup.html
   ├── popup.js
   └── icons/
       ├── icon16.png
       ├── icon48.png
       └── icon128.png
   ```

### Step 2: Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `mbb-component-inspector` folder
5. The extension should now appear in your extensions list

### Step 3: Start Inspecting!
- The extension is active by default
- Navigate to any webpage with custom components
- Hover over elements to see component highlighting
- Click the extension icon to toggle on/off

## 🎯 How to Use

### Hover to Inspect
- Hover over any element on a webpage
- The extension will crawl up the DOM tree to find the nearest custom component
- Components with these prefixes are detected:
  - `mbb-*` (MBB components)
  - `flo-*` (Flow components)  
  - `app-*` (App components)

### Visual Feedback
- **Blue pulsing border**: Highlights the detected component
- **Dark tooltip**: Shows component information including:
  - Tag name
  - ID (if present)
  - CSS classes
  - Important attributes

### Enhanced Copy Feature
- Click on any highlighted component
- Get comprehensive component information copied to clipboard:

**Example Output:**
```html
<mbb-button animate="true" animation="ripple" variant="primary" size="medium">
  Primary Button
</mbb-button>

// Component Context:
// Parent: <mbb-card>
// Children: <mbb-typography>

// Extracted Style Info:
// variant: primary
// size: m
// fontWeight: medium
```
- A detailed success message shows lines copied and properties found

### Toggle Inspector
- Click the extension icon in the toolbar
- Use the toggle button to turn inspection on/off
- The button shows current status with color coding

## 🔧 Customization

### Add More Component Prefixes
Edit `content.js` and modify the detection logic:

```javascript
// In findClosestCustomComponent function
if (tag.includes('-') && (tag.startsWith('mbb-') || tag.startsWith('flo-') || tag.startsWith('your-prefix-'))) {
  return el;
}
```

### Modify Styling
Edit `styles.css` to change the appearance:

```css
.mbb-inspector-overlay {
  border: 2px solid #your-color;
  background: rgba(255, 0, 0, 0.1); /* Red highlight */
}
```

### Change Keyboard Shortcuts
Edit `popup.js` to add custom shortcuts:

```javascript
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'i') {
    // Toggle inspector with Ctrl+I
    toggleButton.click();
  }
});
```

## 🐛 Troubleshooting

### Extension Not Working
1. Make sure Developer Mode is enabled
2. Check the Chrome DevTools Console for errors
3. Refresh the page after enabling the extension
4. Verify all files are present in the extension folder

### Components Not Detected
1. Check if your components have hyphens in their names
2. Verify the component prefixes in `content.js`
3. Make sure the elements are actual DOM elements (not just CSS classes)

### Tooltip Not Showing
1. Check if the page has very high z-index elements
2. Try refreshing the page
3. Disable other extensions that might interfere


## 📝 Development

### File Structure
- `manifest.json`: Extension configuration
- `content.js`: Main logic for component detection
- `styles.css`: Styling for overlays and tooltips
- `popup.html`: Extension popup interface
- `popup.js`: Popup functionality
- `icons/`: Extension icons

### Testing
1. Make changes to any file
2. Go to `chrome://extensions/`
3. Click the refresh button on your extension
4. Test on any webpage
