// MBB Component Inspector - Popup Script

document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');
  const statusIndicator = toggleButton.querySelector('.status-indicator');
  
  // Initialize the popup state
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getStatus"}, function(response) {
      if (response && response.active !== undefined) {
        updateButtonState(response.active);
      }
    });
  });
  
  // Handle toggle button click
  toggleButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleInspector"}, function(response) {
        if (response && response.active !== undefined) {
          updateButtonState(response.active);
        }
      });
    });
  });
  
  // Update button appearance based on state
  function updateButtonState(isActive) {
    if (isActive) {
      toggleButton.className = 'toggle-button active';
      toggleButton.innerHTML = '<span class="status-indicator status-active"></span>Inspector Active';
    } else {
      toggleButton.className = 'toggle-button inactive';
      toggleButton.innerHTML = '<span class="status-indicator status-inactive"></span>Inspector Inactive';
    }
  }
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', function(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggleButton.click();
    }
  });
}); 