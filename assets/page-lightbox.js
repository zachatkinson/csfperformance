class PageLightbox {
  constructor() {
    this.lightboxContainer = null;
    this.initialized = false;
    this.currentImage = null;
    this.images = [];
    
    // Initialize the lightbox when the DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // Skip initialization on product pages
    if (document.querySelector('main-product')) {
      return;
    }
    
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
    
    // Find all qualifying images
    const allPageImages = document.querySelectorAll(includeSelector);
    
    // Filter out images that are in product areas
    this.images = Array.from(allPageImages).filter(img => {
      // Skip if image is too small or a thumbnail or icon
      if (img.width < 150 || img.height < 150) return false;
      
      // Skip images in excluded areas
      for (const selector of excludeSelectors) {
        if (img.closest(selector)) return false;
      }
      
      // Skip SVG images (likely icons)
      if (img.src.toLowerCase().endsWith('.svg')) return false;
      
      return true;
    });
    
    // If no suitable images found, don't initialize
    if (this.images.length === 0) {
      return;
    }
    
    // Create the lightbox container
    this.createLightbox();
    
    // Add click event listeners to images
    this.images.forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLightbox(img);
      });
    });
    
    this.initialized = true;
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
      closeButton.addEventListener('click', () => this.closeLightbox());
      
      // Create image container
      const imageContainer = document.createElement('div');
      imageContainer.className = 'page-lightbox__image-container';
      
      // Create navigation buttons if there are multiple images
      if (this.images.length > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = 'page-lightbox__nav page-lightbox__nav--prev';
        prevButton.setAttribute('aria-label', 'Previous image');
        prevButton.innerHTML = '&lsaquo;';
        prevButton.addEventListener('click', () => this.navigate(-1));
        
        const nextButton = document.createElement('button');
        nextButton.className = 'page-lightbox__nav page-lightbox__nav--next';
        nextButton.setAttribute('aria-label', 'Next image');
        nextButton.innerHTML = '&rsaquo;';
        nextButton.addEventListener('click', () => this.navigate(1));
        
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
    if (this.images.length <= 1) return;
    
    // Find the index of the current image
    const currentIndex = this.images.indexOf(this.currentImage);
    if (currentIndex === -1) return;
    
    // Calculate the new index with wrapping
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = this.images.length - 1;
    if (newIndex >= this.images.length) newIndex = 0;
    
    // Open the new image
    this.openLightbox(this.images[newIndex]);
  }
}

// Initialize the page lightbox
new PageLightbox(); 