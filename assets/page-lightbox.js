class PageLightbox {
  constructor() {
    this.lightboxContainer = null;
    this.initialized = false;
    this.currentImage = null;
    this.images = [];
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    console.log('PageLightbox: Constructor called');
    
    // Use a more robust initialization approach
    this.initializeWhenReady();
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
    console.log('PageLightbox: init() called');
    
    // Find all images within page content areas only
    // This selector targets images in page content but excludes product media
    const pageContentSelectors = [
      '.rte img', // Rich text editor content (common for pages)
      '.page-content img',
      '.page-width img',
      'section[id^="page-"] img',
      'section[id^="main-page"] img',
      '.main-page-title + div img' // Images after page title
    ];
    
    // Exclude product media and model grid
    const excludeSelectors = [
      'product-media img',
      '[data-media-id] img',
      '.product__media img',
      '.product__media-item img',
      '.product-media-modal img',
      '.model-grid img' // Exclude model grid images
    ];
    
    // Build the query selector
    const includeSelector = pageContentSelectors.join(', ');
    console.log('PageLightbox: Using include selector:', includeSelector);
    
    // Find all qualifying images
    const allPageImages = document.querySelectorAll(includeSelector);
    console.log('PageLightbox: Found', allPageImages.length, 'total images');
    
    if (allPageImages.length === 0) {
      console.log('PageLightbox: No images found, not initializing');
      return;
    }

    // Initialize with empty array and start progressive loading
    this.images = [];
    this.pendingImages = Array.from(allPageImages);
    
    // Filter out images that should be excluded
    this.pendingImages = this.pendingImages.filter(img => {
      // Skip images in excluded areas
      for (const selector of excludeSelectors) {
        if (img.closest(selector)) {
          console.log('PageLightbox: Filtered out excluded image:', img.src, 'matched selector:', selector);
          return false;
        }
      }
      
      // Skip SVG images (likely icons)
      if (img.src.toLowerCase().endsWith('.svg')) {
        console.log('PageLightbox: Filtered out SVG image:', img.src);
        return false;
      }
      
      return true;
    });
    
    console.log('PageLightbox: After initial filtering,', this.pendingImages.length, 'images to process');
    
    if (this.pendingImages.length === 0) {
      console.log('PageLightbox: No suitable images found after filtering, not initializing');
      return;
    }

    // Create the lightbox container immediately
    this.createLightbox();
    
    // Start progressive loading - check images that are already loaded first
    this.processImmediatelyAvailableImages();
    
    // Then start loading the rest progressively
    this.startProgressiveImageLoading();
    
    console.log('PageLightbox: Progressive initialization started');
  }

  processImmediatelyAvailableImages() {
    const readyImages = [];
    const stillLoadingImages = [];
    
    this.pendingImages.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        // Image is already loaded and has dimensions
        if (this.isImageSuitableForLightbox(img)) {
          readyImages.push(img);
        }
      } else {
        stillLoadingImages.push(img);
      }
    });
    
    // Add immediately available images to lightbox
    if (readyImages.length > 0) {
      this.addImagesToLightbox(readyImages);
      console.log('PageLightbox: Added', readyImages.length, 'immediately available images');
    }
    
    // Update pending list
    this.pendingImages = stillLoadingImages;
    
    // If we have enough images already, mark as initialized
    if (this.images.length > 0) {
      this.initialized = true;
      console.log('PageLightbox: Lightbox ready with', this.images.length, 'images (more may be added progressively)');
    }
  }

  startProgressiveImageLoading() {
    if (this.pendingImages.length === 0) {
      console.log('PageLightbox: All images processed');
      return;
    }
    
    console.log('PageLightbox: Starting progressive loading for', this.pendingImages.length, 'remaining images');
    
    // Process images in batches to avoid overwhelming the browser
    const batchSize = 10;
    let currentBatch = 0;
    
    const processBatch = () => {
      const startIdx = currentBatch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, this.pendingImages.length);
      const batch = this.pendingImages.slice(startIdx, endIdx);
      
      if (batch.length === 0) {
        console.log('PageLightbox: Progressive loading complete');
        return;
      }
      
      // Process this batch
      const batchPromises = batch.map(img => this.waitForImageToLoad(img));
      
      Promise.all(batchPromises).then(loadedImages => {
        const validImages = loadedImages.filter(img => this.isImageSuitableForLightbox(img));
        
        if (validImages.length > 0) {
          this.addImagesToLightbox(validImages);
          console.log('PageLightbox: Added', validImages.length, 'images from batch', currentBatch + 1, '(total now:', this.images.length, ')');
        }
        
        // Process next batch
        currentBatch++;
        setTimeout(processBatch, 100); // Small delay to prevent blocking
      });
    };
    
    // Start processing batches
    processBatch();
  }

  waitForImageToLoad(img) {
    return new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve(img);
        return;
      }
      
      const handleLoad = () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        resolve(img);
      };
      
      const handleError = () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        resolve(img); // Still resolve to include in filtering
      };
      
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      
      // Faster timeout for progressive loading
      setTimeout(() => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        resolve(img);
      }, 3000); // 3 second timeout per batch
    });
  }

  isImageSuitableForLightbox(img) {
    // Get actual dimensions - handle cases where naturalWidth/Height are available
    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;
    
    // Skip if image is too small or failed to load
    // But be more lenient with timeout images that might have valid URLs
    if (width < 150 || height < 150) {
      // For images that timed out but have reasonable URLs, give them a second chance
      if (width === 178 && height === 0 && img.src.includes('cdn.shopify.com') && 
          (img.src.includes('width=600') || img.src.includes('width=760'))) {
        console.log('PageLightbox: Keeping timed out Shopify image with URL width parameter:', img.src);
        return true;
      }
      return false;
    }
    
    return true;
  }

  addImagesToLightbox(newImages) {
    newImages.forEach(img => {
      // Avoid duplicates
      if (!this.images.includes(img)) {
        this.images.push(img);
        this.addImageEventListeners(img);
      }
    });
  }

  addImageEventListeners(img) {
    img.style.cursor = 'pointer';
    
    // Add both click and touch events
    img.addEventListener('click', (e) => {
      console.log('PageLightbox: Image clicked:', img.src);
      e.preventDefault();
      this.openLightbox(img);
    });
    
    img.addEventListener('touchstart', (e) => {
      console.log('PageLightbox: Image touched:', img.src);
      e.preventDefault();
      this.openLightbox(img);
    }, { passive: false });
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
      
      // Create navigation buttons if there are multiple images
      if (this.images.length > 1) {
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
      }
      
      this.lightboxContainer.appendChild(closeButton);
      this.lightboxContainer.appendChild(imageContainer);
      
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
        // Swipe right - next image
        this.navigate(1);
      } else {
        // Swipe left - previous image
        this.navigate(-1);
      }
    }
  }
  
  openLightbox(img) {
    this.currentImage = img;
    
    // Create a new image element for the lightbox
    const lightboxImg = document.createElement('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxImg.className = 'page-lightbox__image';
    
    // If image has data-full-size attribute, use that instead
    if (img.dataset.fullSize) {
      lightboxImg.src = img.dataset.fullSize;
    }
    
    // Replace any existing image
    const container = this.lightboxContainer.querySelector('.page-lightbox__image-container');
    container.innerHTML = '';
    container.appendChild(lightboxImg);
    
    // Show the lightbox with a fade effect
    requestAnimationFrame(() => {
      this.lightboxContainer.classList.add('active');
      this.lightboxContainer.setAttribute('aria-hidden', 'false');
    });
    
    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
    
    // Trap focus within lightbox
    this.lightboxContainer.querySelector('.page-lightbox__close').focus();
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
  
  navigate(direction) {
    if (!this.currentImage) return;
    
    const currentIndex = this.images.indexOf(this.currentImage);
    const newIndex = (currentIndex + direction + this.images.length) % this.images.length;
    const newImage = this.images[newIndex];
    
    // Get the current image element
    const currentImg = this.lightboxContainer.querySelector('.page-lightbox__image');
    
    // Add sliding animation class based on direction
    currentImg.classList.add(direction > 0 ? 'sliding-right' : 'sliding-left');
    
    // Wait for the slide-out animation to complete
    setTimeout(() => {
      // Create and add the new image
      const lightboxImg = document.createElement('img');
      lightboxImg.src = newImage.src;
      lightboxImg.alt = newImage.alt;
      lightboxImg.className = 'page-lightbox__image';
      
      // Add sliding-in animation class - reversed from the slide-out direction
      lightboxImg.classList.add(direction > 0 ? 'sliding-in-left' : 'sliding-in-right');
      
      // If image has data-full-size attribute, use that instead
      if (newImage.dataset.fullSize) {
        lightboxImg.src = newImage.dataset.fullSize;
      }
      
      // Replace the current image
      const container = this.lightboxContainer.querySelector('.page-lightbox__image-container');
      container.innerHTML = '';
      container.appendChild(lightboxImg);
      
      // Update current image reference
      this.currentImage = newImage;
      
      // Remove animation classes after animation completes
      setTimeout(() => {
        lightboxImg.classList.remove('sliding-in-left', 'sliding-in-right');
      }, 300);
    }, 300);
  }
}

// Initialize the page lightbox
new PageLightbox(); 

function showImage(index) {
  const image = images[index];
  const imageContainer = document.querySelector('.page-lightbox__image-container');
  const currentImage = imageContainer.querySelector('img');
  
  // Remove any existing animation classes
  if (currentImage) {
    currentImage.classList.remove('sliding-in-left', 'sliding-in-right');
  }
  
  // Create new image element
  const newImage = document.createElement('img');
  newImage.src = image.src;
  newImage.alt = image.alt;
  newImage.className = 'page-lightbox__image';
  
  // Add appropriate animation class based on direction
  if (currentIndex < index) {
    newImage.classList.add('sliding-in-left');
  } else {
    newImage.classList.add('sliding-in-right');
  }
  
  // Replace the image
  if (currentImage) {
    imageContainer.removeChild(currentImage);
  }
  imageContainer.appendChild(newImage);
  
  currentIndex = index;
  updateNavigation();
} 