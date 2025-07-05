# 🚀 Quick Installation Guide

## Chrome Extension Setup (macOS)

### 1. Open Chrome Extensions Page
```bash
# Open Chrome and navigate to:
chrome://extensions/
```

### 2. Enable Developer Mode
- Toggle the "Developer mode" switch in the top right corner
- This allows you to load unpacked extensions

### 3. Load the Extension
1. Click "Load unpacked" button
2. Navigate to your `mbbFinder` folder
3. Select the entire folder (not individual files)
4. Click "Select" or "Open"

### 4. Verify Installation
- You should see "MBB Component Inspector" in your extensions list
- The extension icon should appear in your Chrome toolbar
- It should show as "Active" by default

### 5. Test the Extension
1. Open the included `test-page.html` file in Chrome:
   ```bash
   open test-page.html
   ```
2. Or navigate to any website with custom components
3. Hover over elements to see component detection
4. Click on highlighted components to copy their structure

## 🔧 Troubleshooting

### Extension Not Loading
- Make sure all files are present in the folder
- Check that Developer mode is enabled
- Try refreshing the extensions page

### Extension Not Working
- Refresh the webpage after loading the extension
- Check Chrome DevTools Console for any errors
- Ensure you're hovering over elements with custom components

### No Components Detected
- Verify your components have hyphens in their names (e.g., `mbb-button`)
- Check that components match the supported prefixes: `mbb-*`, `flo-*`, `app-*`
- Look at the test page to see examples of detectable components

## 📋 Quick Commands

```bash
# Navigate to your folder
cd /Users/rohityadav/Desktop/Growth/mbbFinder

# View all files
ls -la

# Open test page
open test-page.html

# Open Chrome extensions
open -a "Google Chrome" chrome://extensions/
```

## ✅ Success Checklist
- [ ] Chrome extensions page opens
- [ ] Developer mode is enabled
- [ ] Extension loads without errors
- [ ] Extension icon appears in toolbar (🔍 blue magnifying glass)
- [ ] Test page shows component highlighting
- [ ] Enhanced tooltip displays organized sections:
  - [ ] Component name and text content
  - [ ] MBB Properties section with Angular inputs
  - [ ] Style information extracted from classes
  - [ ] Component hierarchy (parent/children)
- [ ] Click-to-copy produces enhanced output with comments
- [ ] Toggle button in popup works
- [ ] No JavaScript errors in console
- [ ] Works on real Angular applications with ng-reflect-* attributes

## 🎯 Next Steps
Once installed, you can:
1. Test on your actual project websites
2. Customize component prefixes in `content.js`
3. Modify styling in `styles.css`
4. Add new features as needed

Happy component inspecting! 🔍✨ 