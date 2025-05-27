class PageLightbox {
  constructor() {
    this.lightboxContainer = null;
    this.initialized = false;
    this.currentImage = null;
    this.images = [];
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    console.log('PageLightbox: Constructor called');
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
      console.log('PageLightbox: DOM still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      console.log('PageLightbox: DOM already loaded, initializing immediately');
      this.init();
    }
  }

  init() {
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
    
    // Filter out images that are in product areas
    this.images = Array.from(allPageImages).filter(img => {
      // Skip if image is too small or a thumbnail or icon
      if (img.width < 150 || img.height < 150) {
        console.log('PageLightbox: Filtered out small image:', img.src, 'dimensions:', img.width, 'x', img.height);
        return false;
      }
      
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
      
      console.log('PageLightbox: Keeping image:', img.src);
      return true;
    });
    
    console.log('PageLightbox: After filtering,', this.images.length, 'images remain');
    
    // If no suitable images found, don't initialize
    if (this.images.length === 0) {
      console.log('PageLightbox: No suitable images found, not initializing');
      return;
    }
    
    // Create the lightbox container
    this.createLightbox();
    
    // Add click event listeners to images
    this.images.forEach(img => {
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
    });
    
    this.initialized = true;
    console.log('PageLightbox: Initialization complete');
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
    
    // Show the lightbox
    this.lightboxContainer.classList.add('active');
    this.lightboxContainer.setAttribute('aria-hidden', 'false');
    
    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
    
    // Trap focus within lightbox
    this.lightboxContainer.querySelector('.page-lightbox__close').focus();
  }
  
  closeLightbox() {
    this.lightboxContainer.classList.remove('active');
    this.lightboxContainer.setAttribute('aria-hidden', 'true');
    
    // Re-enable scrolling
    document.body.style.overflow = '';
    
    // Return focus to the image that was clicked
    if (this.currentImage) {
      this.currentImage.focus();
    }
  }
  
  navigate(direction) {
    if (!this.currentImage) return;
    
    const currentIndex = this.images.indexOf(this.currentImage);
    const newIndex = (currentIndex + direction + this.images.length) % this.images.length;
    const newImage = this.images[newIndex];
    
    // Get the current image element
    const currentImg = this.lightboxContainer.querySelector('.page-lightbox__image');
    
    // Add sliding animation class based on direction
    currentImg.classList.add(direction > 0 ? 'sliding-left' : 'sliding-right');
    
    // Wait for the slide-out animation to complete
    setTimeout(() => {
      // Create and add the new image
      const lightboxImg = document.createElement('img');
      lightboxImg.src = newImage.src;
      lightboxImg.alt = newImage.alt;
      lightboxImg.className = 'page-lightbox__image';
      
      // Add sliding-in animation class
      lightboxImg.classList.add(direction > 0 ? 'sliding-in-right' : 'sliding-in-left');
      
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