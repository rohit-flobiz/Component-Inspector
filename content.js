// MBB Component Inspector - Content Script
console.log('🔍 MBB Component Inspector loaded');

let isInspectorActive = true;
let currentOverlay = null;
let tooltip = null;
let hideTimeout = null;
let currentComponent = null;

// Function to find the closest custom component
function findClosestCustomComponent(el) {
  while (el && el !== document.body && el !== document.documentElement) {
    const tag = el.tagName.toLowerCase();
    // Check for custom components (mbb-, flo-, or any component with hyphens)
    if (tag.includes('-') && (tag.startsWith('mbb-') || tag.startsWith('flo-') || tag.startsWith('app-'))) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

// Function to get component information
function getComponentInfo(el) {
  const tagName = el.tagName.toLowerCase();
  const attributes = {};
  const classes = Array.from(el.classList);
  
  // Get all attributes
  for (let attr of el.attributes) {
    attributes[attr.name] = attr.value;
  }
  
  return {
    tagName,
    attributes,
    classes,
    id: el.id || null,
    innerHTML: el.innerHTML.length > 100 ? el.innerHTML.substring(0, 100) + '...' : el.innerHTML,
    // Enhanced info
    mbbProps: extractMbbProperties(el),
    componentHierarchy: getComponentHierarchy(el),
    textContent: getCleanTextContent(el),
    styleInfo: extractStyleInfo(el)
  };
}

// Function to extract MBB-specific properties
function extractMbbProperties(el) {
  const props = {};
  
  // Extract Angular ng-reflect attributes (these show the actual Angular inputs)
  for (let attr of el.attributes) {
    if (attr.name.startsWith('ng-reflect-')) {
      const propName = attr.name.replace('ng-reflect-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      props[propName] = attr.value;
    }
  }
  
  // Extract direct MBB properties
  const mbbAttributes = [
    'animate', 'animation', 'trigger', 'variant', 'size', 'type', 'disabled', 
    'loading', 'fontweight', 'fontsize', 'color', 'emphasis', 'align',
    'elevation', 'rounded', 'outline', 'density', 'theme'
  ];
  
  mbbAttributes.forEach(attr => {
    if (el.hasAttribute(attr)) {
      props[attr] = el.getAttribute(attr);
    }
  });
  
  return props;
}

// Function to get component hierarchy (parent and children custom components)
function getComponentHierarchy(el) {
  const hierarchy = {
    parent: null,
    children: [],
    siblings: []
  };
  
  // Find parent custom component
  let parent = el.parentElement;
  while (parent && parent !== document.body) {
    const parentTag = parent.tagName.toLowerCase();
    if (parentTag.includes('-') && (parentTag.startsWith('mbb-') || parentTag.startsWith('flo-') || parentTag.startsWith('app-'))) {
      hierarchy.parent = {
        tagName: parentTag,
        id: parent.id || null,
        classes: Array.from(parent.classList).filter(c => c.startsWith('mbb-') || c.startsWith('flo-') || c.startsWith('app-'))
      };
      break;
    }
    parent = parent.parentElement;
  }
  
  // Find child custom components
  const childComponents = el.querySelectorAll('[class*="mbb-"], [class*="flo-"], [class*="app-"]');
  childComponents.forEach(child => {
    const childTag = child.tagName.toLowerCase();
    if (childTag.includes('-') && (childTag.startsWith('mbb-') || childTag.startsWith('flo-') || childTag.startsWith('app-'))) {
      hierarchy.children.push({
        tagName: childTag,
        id: child.id || null,
        classes: Array.from(child.classList).filter(c => c.startsWith('mbb-') || c.startsWith('flo-') || c.startsWith('app-'))
      });
    }
  });
  
  return hierarchy;
}

// Function to get clean text content
function getCleanTextContent(el) {
  const text = el.textContent || el.innerText || '';
  return text.replace(/\s+/g, ' ').trim().substring(0, 50) + (text.length > 50 ? '...' : '');
}

// Function to extract style information from CSS classes
function extractStyleInfo(el) {
  const classes = Array.from(el.classList);
  const styleInfo = {};
  
  classes.forEach(className => {
    if (className.startsWith('mbb-')) {
      if (className.includes('primary') || className.includes('secondary') || className.includes('danger')) {
        styleInfo.variant = className.match(/(primary|secondary|danger|success|warning|info)/)?.[1];
      }
      if (className.includes('size')) {
        styleInfo.size = className.match(/size-([a-z]+)/)?.[1];
      }
      if (className.includes('font')) {
        if (className.includes('font-') && className.match(/font-(\d+)/)) {
          styleInfo.fontSize = className.match(/font-(\d+)/)?.[1];
        }
        if (className.includes('medium') || className.includes('bold') || className.includes('light')) {
          styleInfo.fontWeight = className.match(/(light|medium|bold)/)?.[1];
        }
      }
      if (className.includes('elevated') || className.includes('outlined')) {
        styleInfo.elevation = className.includes('elevated') ? 'elevated' : 'outlined';
      }
    }
  });
  
  return styleInfo;
}

// Function to show overlay on the component
function showOverlay(el) {
  removeOverlay();

  const overlay = document.createElement("div");
  overlay.className = "mbb-inspector-overlay";
  
  const rect = el.getBoundingClientRect();
  Object.assign(overlay.style, {
    top: `${rect.top + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  });

  document.body.appendChild(overlay);
  currentOverlay = overlay;
  
  // Show tooltip with component info
  showTooltip(el, rect);
}

// Function to show tooltip with component details
function showTooltip(el, rect) {
  const info = getComponentInfo(el);
  
  const tooltip = document.createElement("div");
  tooltip.className = "mbb-inspector-tooltip";
  
  // Determine positioning first (will be updated later with smart positioning)
  let position = 'bottom';
  
  // Position text mapping
  const positionText = {
    'bottom': '⬇️ Below',
    'top': '⬆️ Above', 
    'left': '⬅️ Left',
    'right': '➡️ Right',
    'overlay': '📍 Repositioned'
  };
  
  // Create enhanced tooltip content
  let content = `<div class="tooltip-header">
    <strong>&lt;${info.tagName}&gt;</strong>
    ${info.textContent ? `<span class="text-content">"${info.textContent}"</span>` : ''}
  </div>`;
  
  // Show MBB-specific properties
  const mbbProps = Object.keys(info.mbbProps);
  if (mbbProps.length > 0) {
    content += `<div class="tooltip-section">
      <span class="section-title">🎯 MBB Properties:</span><br>`;
    mbbProps.forEach(prop => {
      const value = info.mbbProps[prop];
      if (value !== '[object Object]' && value !== 'undefined') {
        content += `&nbsp;&nbsp;<span class="prop">${prop}:</span> <span class="value">${value}</span><br>`;
      }
    });
    content += `</div>`;
  }
  
  // Show style information
  const styleKeys = Object.keys(info.styleInfo);
  if (styleKeys.length > 0) {
    content += `<div class="tooltip-section">
      <span class="section-title">🎨 Style:</span><br>`;
    styleKeys.forEach(key => {
      content += `&nbsp;&nbsp;<span class="prop">${key}:</span> <span class="value">${info.styleInfo[key]}</span><br>`;
    });
    content += `</div>`;
  }
  
  // Show component hierarchy
  if (info.componentHierarchy.parent || info.componentHierarchy.children.length > 0) {
    content += `<div class="tooltip-section">
      <span class="section-title">🏗️ Hierarchy:</span><br>`;
    
    if (info.componentHierarchy.parent) {
      content += `&nbsp;&nbsp;<span class="prop">parent:</span> <span class="hierarchy-item">&lt;${info.componentHierarchy.parent.tagName}&gt;</span><br>`;
    }
    
    if (info.componentHierarchy.children.length > 0) {
      content += `&nbsp;&nbsp;<span class="prop">children:</span> `;
      content += info.componentHierarchy.children.map(child => 
        `<span class="hierarchy-item">&lt;${child.tagName}&gt;</span>`
      ).join(', ');
      content += '<br>';
    }
    content += `</div>`;
  }
  
  // Show ID if present
  if (info.id) {
    content += `<div class="tooltip-section">
      <span class="prop">id:</span> <span class="value">${info.id}</span>
    </div>`;
  }
  
  // Add copy hint with placeholder for position (will be updated)
  content += `<div class="tooltip-footer">
    <small>💡 Click to copy component tag</small>
    <small class="position-indicator" id="position-text">${positionText[position]}</small>
  </div>`;
  
  tooltip.innerHTML = content;
  
  // Smart tooltip positioning to keep it in viewport
  document.body.appendChild(tooltip);
  
  // Get tooltip dimensions after adding to DOM
  const tooltipRect = tooltip.getBoundingClientRect();
  const tooltipWidth = tooltipRect.width;
  const tooltipHeight = tooltipRect.height;
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate initial position (below the component)
  let tooltipTop = rect.bottom + window.scrollY + 10;
  let tooltipLeft = rect.left + window.scrollX;
  position = 'bottom'; // Track positioning for arrow placement
  
  // Check if tooltip goes outside right edge
  if (tooltipLeft + tooltipWidth > viewportWidth) {
    tooltipLeft = viewportWidth - tooltipWidth - 20;
  }
  
  // Check if tooltip goes outside left edge
  if (tooltipLeft < 10) {
    tooltipLeft = 10;
  }
  
  // Check if tooltip goes outside bottom edge
  if (rect.bottom + tooltipHeight + 20 > viewportHeight) {
    // Show tooltip above the component instead
    tooltipTop = rect.top + window.scrollY - tooltipHeight - 10;
    position = 'top';
    
    // If still outside top edge, show beside the component
    if (rect.top - tooltipHeight - 10 < 0) {
      tooltipTop = rect.top + window.scrollY + 10;
      
      // Try to show it to the right of the component
      if (rect.right + tooltipWidth + 20 < viewportWidth) {
        tooltipLeft = rect.right + window.scrollX + 10;
        position = 'right';
      } else {
        // Show it to the left of the component
        tooltipLeft = rect.left + window.scrollX - tooltipWidth - 10;
        position = 'left';
        
        // If still outside, show it overlapping but visible
        if (tooltipLeft < 10) {
          tooltipLeft = 10;
          tooltipTop = Math.max(10, Math.min(tooltipTop, viewportHeight - tooltipHeight - 10));
          position = 'overlay';
        }
      }
    }
  }
  
  // Add position class for different arrow styles
  tooltip.classList.add(`tooltip-${position}`);
  
  // Update position indicator text
  const positionIndicator = tooltip.querySelector('#position-text');
  if (positionIndicator) {
    positionIndicator.textContent = positionText[position] || position;
  }
  
  // Apply final position
  Object.assign(tooltip.style, {
    top: `${tooltipTop}px`,
    left: `${tooltipLeft}px`
  });
  
  // Store reference (tooltip already added to DOM above)
  window.currentTooltip = tooltip;
}

// Function to remove overlay and tooltip
function removeOverlay() {
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
  
  if (window.currentTooltip) {
    window.currentTooltip.remove();
    window.currentTooltip = null;
  }
  
  currentComponent = null;
}

// Function to schedule hiding with a delay
function scheduleHide() {
  // Clear any existing timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
  
  // Set new timeout to hide after delay
  hideTimeout = setTimeout(() => {
    try {
      // Double-check if mouse is still over a custom component
      const hoveredElement = document.querySelector(':hover');
      let customComponent = null;
      
      if (hoveredElement && hoveredElement.tagName) {
        customComponent = findClosestCustomComponent(hoveredElement);
      }
      
      if (!customComponent) {
        removeOverlay();
      }
    } catch (error) {
      console.log('MBB Inspector: Error in scheduleHide:', error);
      removeOverlay();
    }
    
    hideTimeout = null;
  }, 500); // Increased delay to 500ms for better UX
}

// Mouse events
document.addEventListener("mouseover", (e) => {
  if (!isInspectorActive) return;
  
  // Clear any pending hide timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  
  const customEl = findClosestCustomComponent(e.target);
  if (customEl) {
    // Only update if it's a different component
    if (currentComponent !== customEl) {
      currentComponent = customEl;
      showOverlay(customEl);
    }
  } else {
    // Start hide timeout when not over a custom component
    scheduleHide();
  }
});

document.addEventListener("mouseout", (e) => {
  if (!isInspectorActive) return;
  
  // Always schedule hide when mouse leaves an element
  scheduleHide();
});

// Click event to copy component info
document.addEventListener("click", (e) => {
  if (!isInspectorActive) return;
  
  const customEl = findClosestCustomComponent(e.target);
  if (customEl) {
    e.preventDefault();
    const info = getComponentInfo(customEl);
    
    // Create enhanced copy text with MBB properties
    let copyText = `<${info.tagName}`;
    
    // Add MBB-specific properties
    const mbbProps = Object.keys(info.mbbProps);
    if (mbbProps.length > 0) {
      mbbProps.forEach(prop => {
        const value = info.mbbProps[prop];
        if (value !== '[object Object]' && value !== 'undefined') {
          copyText += ` ${prop}="${value}"`;
        }
      });
    }
    
    // Add ID if present
    if (info.id) {
      copyText += ` id="${info.id}"`;
    }
    
    // Add meaningful classes (MBB-specific ones)
    const mbbClasses = info.classes.filter(c => c.startsWith('mbb-') || c.startsWith('flo-') || c.startsWith('app-'));
    if (mbbClasses.length > 0) {
      copyText += ` class="${mbbClasses.join(' ')}"`;
    }
    
    copyText += '>';
    
    // Add text content if available
    if (info.textContent) {
      copyText += `\n  ${info.textContent}\n</${info.tagName}>`;
    }
    
    // Add component hierarchy context
    if (info.componentHierarchy.parent || info.componentHierarchy.children.length > 0) {
      copyText += '\n\n// Component Context:';
      if (info.componentHierarchy.parent) {
        copyText += `\n// Parent: <${info.componentHierarchy.parent.tagName}>`;
      }
      if (info.componentHierarchy.children.length > 0) {
        copyText += `\n// Children: ${info.componentHierarchy.children.map(c => `<${c.tagName}>`).join(', ')}`;
      }
    }
    
    // Add style information
    const styleKeys = Object.keys(info.styleInfo);
    if (styleKeys.length > 0) {
      copyText += '\n\n// Extracted Style Info:';
      styleKeys.forEach(key => {
        copyText += `\n// ${key}: ${info.styleInfo[key]}`;
      });
    }
    
    navigator.clipboard.writeText(copyText).then(() => {
      // Show enhanced success message
      const successMsg = document.createElement('div');
      successMsg.className = 'mbb-inspector-success';
      
      const lineCount = copyText.split('\n').length;
      successMsg.innerHTML = `
        <div style="font-weight: bold;">📋 Component Info Copied!</div>
        <small>${lineCount} lines • ${mbbProps.length} properties</small>
      `;
      
      successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 1000000;
        font-family: monospace;
        font-size: 12px;
        line-height: 1.4;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleInspector") {
    isInspectorActive = !isInspectorActive;
    if (!isInspectorActive) {
      // Clear timeout and remove overlay when disabling
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      removeOverlay();
    }
    sendResponse({ active: isInspectorActive });
  } else if (request.action === "getStatus") {
    sendResponse({ active: isInspectorActive });
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  removeOverlay();
}); 