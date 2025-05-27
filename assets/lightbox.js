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
  let isSwiping = false;

  // Create a container for smooth transitions
  const imageContainer = document.createElement('div');
  imageContainer.style.position = 'relative';
  imageContainer.style.width = '100%';
  imageContainer.style.height = '100%';
  imageContainer.style.overflow = 'hidden';
  lightboxImage.parentNode.insertBefore(imageContainer, lightboxImage);
  imageContainer.appendChild(lightboxImage);

  // Add transition class for smooth animations
  lightboxImage.style.transition = 'transform 0.3s ease-out';
  lightboxImage.style.position = 'absolute';
  lightboxImage.style.width = '100%';
  lightboxImage.style.height = '100%';
  lightboxImage.style.objectFit = 'contain';

  function showImage(index) {
    const image = images[index];
    const imageUrl = image.getAttribute('data-image');
    
    // Create a new image element for the transition
    const newImage = document.createElement('img');
    newImage.src = imageUrl;
    newImage.style.position = 'absolute';
    newImage.style.width = '100%';
    newImage.style.height = '100%';
    newImage.style.objectFit = 'contain';
    newImage.style.transition = 'transform 0.3s ease-out';
    
    // Position the new image based on the direction
    const direction = index > currentIndex ? 1 : -1;
    newImage.style.transform = `translateX(${direction * 100}%)`;
    
    // Add the new image to the container
    imageContainer.appendChild(newImage);
    
    // Trigger the transition
    requestAnimationFrame(() => {
      lightboxImage.style.transform = `translateX(${-direction * 100}%)`;
      newImage.style.transform = 'translateX(0)';
    });
    
    // Update current image after transition
    setTimeout(() => {
      lightboxImage.remove();
      newImage.id = 'lightbox-image';
      newImage.classList.add('lightbox-image');
      currentIndex = index;
    }, 300);
  }

  function handleTouchStart(e) {
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    isSwiping = true;
    lightboxImage.style.transition = 'none';
  }

  function handleTouchMove(e) {
    if (!isSwiping) return;
    
    e.preventDefault();
    currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Only allow swiping if we're at the start or end of the gallery
    if ((currentIndex === 0 && diff > 0) || 
        (currentIndex === images.length - 1 && diff < 0)) {
      // Add resistance at the edges
      const resistance = 0.3;
      lightboxImage.style.transform = `translateX(${diff * resistance}px)`;
    } else {
      // Normal swipe
      lightboxImage.style.transform = `translateX(${diff}px)`;
    }
  }

  function handleTouchEnd(e) {
    if (!isSwiping) return;
    
    isSwiping = false;
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
  }

  // Update event listeners to use new handlers
  lightboxImage.addEventListener('mousedown', handleTouchStart);
  lightboxImage.addEventListener('touchstart', handleTouchStart);
  
  document.addEventListener('mousemove', handleTouchMove);
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  
  document.addEventListener('mouseup', handleTouchEnd);
  document.addEventListener('touchend', handleTouchEnd);
} 