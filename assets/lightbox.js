function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const closeButton = document.querySelector('.lightbox-close');
  const prevButton = document.querySelector('.lightbox-prev');
  const nextButton = document.querySelector('.lightbox-next');
  const images = document.querySelectorAll('.gallery-image');
  let currentIndex = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let animationFrame = null;

  // Add transition class for smooth animations
  lightboxImage.style.transition = 'transform 0.3s ease-out';

  function showImage(index) {
    const image = images[index];
    const imageUrl = image.getAttribute('data-image');
    lightboxImage.src = imageUrl;
    currentIndex = index;
    lightboxImage.style.transform = 'translateX(0)';
  }

  function handleTouchStart(e) {
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    isDragging = true;
    lightboxImage.style.transition = 'none';
    document.body.style.overflow = 'hidden';
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Add resistance to the drag
    const resistance = 0.5;
    const dragDistance = diff * resistance;
    
    // Update image position with smooth animation
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    
    animationFrame = requestAnimationFrame(() => {
      lightboxImage.style.transform = `translateX(${dragDistance}px)`;
    });
  }

  function handleTouchEnd(e) {
    if (!isDragging) return;
    
    isDragging = false;
    lightboxImage.style.transition = 'transform 0.3s ease-out';
    
    const diff = currentX - startX;
    const threshold = 100; // Minimum distance to trigger swipe
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex > 0) {
        // Swipe right - show previous
        showImage(currentIndex - 1);
      } else if (diff < 0 && currentIndex < images.length - 1) {
        // Swipe left - show next
        showImage(currentIndex + 1);
      } else {
        // Return to current position
        lightboxImage.style.transform = 'translateX(0)';
      }
    } else {
      // Return to current position
      lightboxImage.style.transform = 'translateX(0)';
    }
    
    document.body.style.overflow = '';
  }

  // Update event listeners to use new handlers
  lightboxImage.addEventListener('mousedown', handleTouchStart);
  lightboxImage.addEventListener('touchstart', handleTouchStart);
  
  document.addEventListener('mousemove', handleTouchMove);
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  
  document.addEventListener('mouseup', handleTouchEnd);
  document.addEventListener('touchend', handleTouchEnd);
} 