// BEST PRACTICE: For async loading, ensure this script is included with <script src="{{ 'page-lightbox.js' | asset_url }}" async></script> or defer in your theme.liquid or relevant template.

class PageLightbox {
  constructor() {
    this.lightboxContainer = null;
    this.initialized = false;
    this.currentImage = null;
    this.currentIndex = 0;
    this.imageRegistry = []; // Catalog of all images
    this.loadedImages = new Map(); // Cache of loaded images
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.preloadBuffer = 2; // Number of images to preload around current
    this.memoryLimit = 10; // Maximum images to keep in memory
    
    console.log('PageLightbox: Constructor called');
    
    // BEST PRACTICE: Early exit pattern - check mobile restrictions before any initialization
    if (this.shouldSkipLightboxOnMobile()) {
      console.log('PageLightbox: 📱 Skipped on mobile device for this page type (preserving native scroll behavior)');
      return; // Exit completely - no lightbox overhead
    }
    
    // Use a more robust initialization approach
    this.initializeWhenReady();
  }

  // BEST PRACTICE: Robust device and page detection
  shouldSkipLightboxOnMobile() {
    const deviceInfo = this.getDeviceInfo();
    const pageInfo = this.getPageInfo();
    
    console.log('PageLightbox: Device detection -', deviceInfo);
    console.log('PageLightbox: Page detection -', pageInfo);
    
    // Only skip on mobile phones (not tablets) and only on non-custom-finishes pages
    const shouldSkip = deviceInfo.isMobilePhone && !pageInfo.isCustomFinishesPage;
    
    if (shouldSkip) {
      console.log('PageLightbox: 🚫 Skipping - Mobile phone on', pageInfo.pageType, 'page');
    } else {
      console.log('PageLightbox: ✅ Proceeding - Device:', deviceInfo.deviceType, 'Page:', pageInfo.pageType);
    }
    
    return shouldSkip;
  }

  getDeviceInfo() {
    // BEST PRACTICE: Multi-signal device detection for accuracy
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    
    // Mobile phone detection (conservative approach)
    const isMobilePhone = (
      screenWidth < 768 && // Small screen
      hasTouch && // Touch capability
      (
        /android.*mobile|iphone|ipod|blackberry|opera mini|iemobile|windows phone/i.test(userAgent) ||
        (screenWidth < 480) // Very small screen is likely mobile
      )
    );
    
    // Tablet detection
    const isTablet = (
      screenWidth >= 768 && 
      screenWidth < 1024 && 
      hasTouch &&
      !/android.*mobile|iphone|ipod/i.test(userAgent) // Exclude mobile phones
    ) || /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    
    const isDesktop = !isMobilePhone && !isTablet;
    
    // Determine device type
    let deviceType = 'desktop';
    if (isMobilePhone) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    
    return {
      isMobilePhone,
      isTablet,
      isDesktop,
      deviceType,
      screenWidth,
      hasTouch,
      userAgent: userAgent.substring(0, 50) + '...' // Truncated for logging
    };
  }

  getPageInfo() {
    // BEST PRACTICE: Multiple detection methods with fallbacks
    const url = window.location.pathname.toLowerCase();
    const bodyClass = document.body.className.toLowerCase();
    const pageTitle = document.title.toLowerCase();
    
    // Detect custom finishes page using multiple signals
    const isCustomFinishesPage = (
      url.includes('custom-finishes') ||
      url.includes('custom-finish') ||
      url.includes('finishes') ||
      bodyClass.includes('custom-finishes') ||
      bodyClass.includes('custom-finish') ||
      pageTitle.includes('custom finish') ||
      pageTitle.includes('custom finishes') ||
      // Shopify template detection
      bodyClass.includes('template--page--custom') ||
      document.querySelector('[data-page*="custom"]') !== null ||
      document.querySelector('[data-page*="finish"]') !== null
    );
    
    // Determine page type for logging
    let pageType = 'unknown';
    if (isCustomFinishesPage) {
      pageType = 'custom-finishes';
    } else if (url.includes('products/')) {
      pageType = 'product';
    } else if (url.includes('collections/')) {
      pageType = 'collection';
    } else if (url === '/' || url === '') {
      pageType = 'home';
    } else if (url.includes('pages/')) {
      pageType = 'page';
    }
    
    return {
      isCustomFinishesPage,
      pageType,
      url: url.substring(0, 50) + (url.length > 50 ? '...' : ''), // Truncated for logging
      bodyClass: bodyClass.substring(0, 100) + (bodyClass.length > 100 ? '...' : '') // Truncated for logging
    };
  }

  initializeWhenReady() {
    // Wait for both DOM and images to be ready
    if (document.readyState === 'complete') {
      console.log('PageLightbox: Document already complete, initializing immediately');
      this.init();
    } else if (document.readyState === 'interactive') {
      console.log('PageLightbox: DOM interactive, waiting for full load');
      window.addEventListener('load', () => this.init());
    } else {
      console.log('PageLightbox: DOM still loading, waiting for full load');
      window.addEventListener('load', () => this.init());
    }
  }

  async init() {
    console.log('PageLightbox: init() called - using Hybrid Smart Loading');
    
    // Only target images in product description and tab panels on product pages
    const isProductPage = window.location.pathname.toLowerCase().includes('/products/');
    let allPageImages = [];
    if (isProductPage) {
      allPageImages = document.querySelectorAll('.tt-tabs__panel img, .product__description img, .rte img');
      console.log('PageLightbox: Product page detected, targeting .tt-tabs__panel, .product__description, .rte images:', allPageImages.length);
    } else {
      // Fallback for other pages (optional, or keep as before)
      const pageContentSelectors = [
        '.rte img',
        '.page-content img', 
        '.page-width img',
        'section[id^="page-"] img',
        'section[id^="main-page"] img',
        '.main-page-title + div img'
      ];
      const includeSelector = pageContentSelectors.join(', ');
      allPageImages = document.querySelectorAll(includeSelector);
      console.log('PageLightbox: Non-product page, using broader selectors:', allPageImages.length);
    }
    
    // Exclude product gallery images just in case
    const excludeSelectors = [
      '.product__media-list img',
      '.product__media-item img',
      '.product-media-container img',
      'product-media img',
      '[data-media-id] img',
      '.product__media img',
      '.product-media-modal img',
      '.model-grid img'
    ];
    // Filter out excluded images
    const filteredImages = Array.from(allPageImages).filter(img => {
      return !excludeSelectors.some(sel => img.closest(sel));
    });
    
    if (filteredImages.length === 0) {
      console.log('PageLightbox: No suitable images found, not initializing');
      return;
    }

    // PHASE 1: Instant Image Registry - Catalog ALL images immediately (no loading)
    this.createImageRegistry(filteredImages, []);
    
    if (this.imageRegistry.length === 0) {
      console.log('PageLightbox: No suitable images found after filtering');
      return;
    }

    // Create lightbox container immediately
    this.createLightbox();
    
    // Add event listeners to all catalog images immediately  
    this.addEventListenersToRegistry();
    
    // Lightbox is now fully functional instantly
    this.initialized = true;
    console.log('PageLightbox: ⚡ INSTANT READY with', this.imageRegistry.length, 'images cataloged (smart loading enabled)');
  }

  createImageRegistry(allImages, excludeSelectors) {
    const startTime = performance.now();
    
    this.imageRegistry = Array.from(allImages)
      .filter(img => {
        // Skip images in excluded areas
        for (const selector of excludeSelectors) {
          if (img.closest(selector)) {
            return false;
          }
        }
        
        // Skip SVG images (likely icons)
        if (img.src.toLowerCase().endsWith('.svg')) {
          return false;
        }
        
        // Skip images that are wrapped in links (should work as links, not lightbox)
        if (img.closest('a')) {
          console.log('PageLightbox: Skipping linked image (preserving link behavior):', img.src);
          return false;
        }
        
        return true;
      })
      .map((img, index) => ({
        element: img,
        src: img.src,
        fullSizeSrc: img.dataset.fullSize || img.src,
        loaded: img.complete && img.naturalWidth > 0,
        index: index,
        width: img.naturalWidth || 0,
        height: img.naturalHeight || 0
      }))
      .filter(entry => {
        // Final size check for already loaded images
        if (entry.loaded && (entry.width < 150 || entry.height < 150)) {
          // Apply Shopify CDN exception
          if (entry.width === 178 && entry.height === 0 && entry.src.includes('cdn.shopify.com') && 
              (entry.src.includes('width=600') || entry.src.includes('width=760'))) {
            return true;
          }
          return false;
        }
        return true;
      });
    
    const endTime = performance.now();
    console.log(`PageLightbox: 📋 Cataloged ${this.imageRegistry.length} images in ${(endTime - startTime).toFixed(1)}ms`);
  }

  addEventListenersToRegistry() {
    this.imageRegistry.forEach((entry, index) => {
      const img = entry.element;
      img.style.cursor = 'pointer';
      
      img.addEventListener('click', (e) => {
        console.log('PageLightbox: Image clicked:', entry.src);
        e.preventDefault();
        this.openLightboxAtIndex(index);
      });
      
      img.addEventListener('touchstart', (e) => {
        console.log('PageLightbox: Image touched:', entry.src);
        e.preventDefault();
        this.openLightboxAtIndex(index);
      }, { passive: false });
    });
  }

  // PHASE 2: On-Demand Loading
  async openLightboxAtIndex(index) {
    this.currentIndex = index;
    this.currentImage = this.imageRegistry[index].element;
    
    // Show lightbox immediately with loading state
    this.showLightboxContainer();
    
    // Load current image on-demand
    const currentImageData = await this.loadImageOnDemand(index);
    this.displayImageInLightbox(currentImageData);
    
    // PHASE 3: Smart Preloading - Load adjacent images in background
    this.preloadAdjacentImages(index);
    
    // PHASE 4: Memory Management - Clean up distant images
    this.cleanupDistantImages(index);
  }

  async loadImageOnDemand(index) {
    const entry = this.imageRegistry[index];
    
    // Check if already loaded in cache
    if (this.loadedImages.has(index)) {
      console.log('PageLightbox: 🎯 Using cached image', index);
      return this.loadedImages.get(index);
    }
    
    console.log('PageLightbox: 📥 Loading image on-demand:', index, entry.src);
    
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const imageData = {
          element: img,
          src: img.src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          index: index
        };
        
        // Cache the loaded image
        this.loadedImages.set(index, imageData);
        console.log('PageLightbox: ✅ Loaded image', index, `(${img.naturalWidth}x${img.naturalHeight})`);
        resolve(imageData);
      };
      
      img.onerror = () => {
        console.log('PageLightbox: ❌ Failed to load image', index);
        // Return original element as fallback
        const imageData = {
          element: entry.element,
          src: entry.src,
          width: entry.width,
          height: entry.height,
          index: index
        };
        resolve(imageData);
      };
      
      // Load the full-size version if available
      img.src = entry.fullSizeSrc;
    });
  }

  preloadAdjacentImages(currentIndex) {
    const preloadIndices = [];
    
    // Preload images around current position
    for (let i = 1; i <= this.preloadBuffer; i++) {
      const prevIndex = currentIndex - i;
      const nextIndex = currentIndex + i;
      
      if (prevIndex >= 0) preloadIndices.push(prevIndex);
      if (nextIndex < this.imageRegistry.length) preloadIndices.push(nextIndex);
    }
    
    // Preload in background without blocking
    preloadIndices.forEach(index => {
      if (!this.loadedImages.has(index)) {
        setTimeout(() => this.loadImageOnDemand(index), 100 * Math.abs(index - currentIndex));
      }
    });
    
    console.log('PageLightbox: 🔄 Preloading adjacent images:', preloadIndices);
  }

  cleanupDistantImages(currentIndex) {
    // Only cleanup if we have too many images in memory
    if (this.loadedImages.size <= this.memoryLimit) {
      return;
    }
    
    const imagesToRemove = [];
    
    this.loadedImages.forEach((imageData, index) => {
      const distance = Math.abs(index - currentIndex);
      if (distance > this.preloadBuffer + 2) {
        imagesToRemove.push(index);
      }
    });
    
    // Remove oldest distant images first
    imagesToRemove
      .sort((a, b) => Math.abs(b - currentIndex) - Math.abs(a - currentIndex))
      .slice(0, Math.max(0, this.loadedImages.size - this.memoryLimit))
      .forEach(index => {
        this.loadedImages.delete(index);
        console.log('PageLightbox: 🗑️ Cleaned up distant image', index);
      });
  }

  showLightboxContainer() {
    // Show lightbox immediately
    requestAnimationFrame(() => {
      this.lightboxContainer.classList.add('active');
      this.lightboxContainer.setAttribute('aria-hidden', 'false');
    });
    
    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
    
    // Trap focus within lightbox
    this.lightboxContainer.querySelector('.page-lightbox__close').focus();
  }

  displayImageInLightbox(imageData) {
    const container = this.lightboxContainer.querySelector('.page-lightbox__image-container');
    container.innerHTML = '';
    
    const lightboxImg = imageData.element.cloneNode();
    lightboxImg.className = 'page-lightbox__image';
    lightboxImg.src = imageData.src;
    
    container.appendChild(lightboxImg);
    
    // Update caption
    this.updateCaption(imageData);
  }

  updateCaption(imageData) {
    const captionElement = this.lightboxContainer.querySelector('.page-lightbox__caption-text');
    if (!captionElement) return;
    
    // Get caption from various sources (priority order)
    const originalImg = this.imageRegistry[imageData.index].element;
    const caption = 
      originalImg.getAttribute('data-caption') || // Custom data attribute
      originalImg.title ||                        // Title attribute
      originalImg.alt ||                          // Alt text
      '';                                         // Fallback to empty
    
    if (caption && caption.trim()) {
      captionElement.textContent = caption.trim();
      captionElement.parentElement.style.display = 'block';
      console.log('PageLightbox: 📝 Showing caption:', caption.substring(0, 50) + (caption.length > 50 ? '...' : ''));
    } else {
      captionElement.textContent = '';
      captionElement.parentElement.style.display = 'none';
      console.log('PageLightbox: 📝 No caption available for image', imageData.index);
    }
  }

  async navigate(direction) {
    if (!this.initialized || this.imageRegistry.length === 0) return;
    
    const newIndex = (this.currentIndex + direction + this.imageRegistry.length) % this.imageRegistry.length;
    
    if (newIndex === this.currentIndex) return;
    
    console.log('PageLightbox: 🧭 Navigating from', this.currentIndex, 'to', newIndex);
    
    // Update current index
    this.currentIndex = newIndex;
    this.currentImage = this.imageRegistry[newIndex].element;
    
    // Load new image (will use cache if available)
    const imageData = await this.loadImageOnDemand(newIndex);
    
    // Display with animation
    this.displayImageInLightbox(imageData);
    
    // Preload around new position
    this.preloadAdjacentImages(newIndex);
    
    // Cleanup distant images
    this.cleanupDistantImages(newIndex);
  }

  createLightbox() {
    // Create lightbox container if it doesn't exist
    if (!this.lightboxContainer) {
      this.lightboxContainer = document.createElement('div');
      this.lightboxContainer.className = 'page-lightbox';
      this.lightboxContainer.setAttribute('aria-hidden', 'true');
      
      // Create close button
      const closeButton = document.createElement('button');
      closeButton.className = 'page-lightbox__close';
      closeButton.setAttribute('aria-label', 'Close lightbox');
      closeButton.innerHTML = '<span>&times;</span>';
      
      // Add both click and touch events for close button
      closeButton.addEventListener('click', () => this.closeLightbox());
      closeButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.closeLightbox();
      }, { passive: false });
      
      // Create image container
      const imageContainer = document.createElement('div');
      imageContainer.className = 'page-lightbox__image-container';
      
      // Create caption container
      const captionContainer = document.createElement('div');
      captionContainer.className = 'page-lightbox__caption';
      captionContainer.innerHTML = '<span class="page-lightbox__caption-text"></span>';
      
      // Always create navigation buttons (we'll show/hide based on registry length)
      const prevButton = document.createElement('button');
      prevButton.className = 'page-lightbox__nav page-lightbox__nav--prev';
      prevButton.setAttribute('aria-label', 'Previous image');
      prevButton.innerHTML = '&lsaquo;';
      
      // Add both click and touch events for navigation
      prevButton.addEventListener('click', () => this.navigate(-1));
      prevButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.navigate(-1);
      }, { passive: false });
      
      const nextButton = document.createElement('button');
      nextButton.className = 'page-lightbox__nav page-lightbox__nav--next';
      nextButton.setAttribute('aria-label', 'Next image');
      nextButton.innerHTML = '&rsaquo;';
      
      // Add both click and touch events for navigation
      nextButton.addEventListener('click', () => this.navigate(1));
      nextButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.navigate(1);
      }, { passive: false });
      
      this.lightboxContainer.appendChild(prevButton);
      this.lightboxContainer.appendChild(nextButton);
      this.lightboxContainer.appendChild(closeButton);
      this.lightboxContainer.appendChild(imageContainer);
      this.lightboxContainer.appendChild(captionContainer);
      
      // Add keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!this.lightboxContainer.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
          this.closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          this.navigate(-1);
        } else if (e.key === 'ArrowRight') {
          this.navigate(1);
        }
      });
      
      // Add touch swipe support
      this.lightboxContainer.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      this.lightboxContainer.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });
      
      // Add click outside to close
      this.lightboxContainer.addEventListener('click', (e) => {
        // Only close if clicking the background (not the image, buttons, or container)
        if (e.target === this.lightboxContainer) {
          this.closeLightbox();
        }
      });
      
      // Append to body
      document.body.appendChild(this.lightboxContainer);
    }
  }
  
  handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for a swipe
    const swipeDistance = this.touchEndX - this.touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swipe right - previous image
        this.navigate(-1);
      } else {
        // Swipe left - next image
        this.navigate(1);
      }
    }
  }
  
  closeLightbox() {
    // Start fade out animation
    this.lightboxContainer.classList.remove('active');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      this.lightboxContainer.setAttribute('aria-hidden', 'true');
      
      // Re-enable scrolling
      document.body.style.overflow = '';
      
      // Return focus to the image that was clicked
      if (this.currentImage) {
        this.currentImage.focus();
      }
    }, 300); // Match the CSS transition duration
  }
}

// Initialize the page lightbox with smart loading
new PageLightbox(); 

// Make the lightbox globally accessible
window.pageLightbox = new PageLightbox(); 