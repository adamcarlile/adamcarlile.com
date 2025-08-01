document.addEventListener('DOMContentLoaded', function() {
  const proseImages = document.querySelectorAll('.prose img');
  
  proseImages.forEach(img => {
    // Wait for image to load to get its natural dimensions
    if (img.complete && img.naturalWidth !== 0) {
      checkImageSize(img);
    } else {
      img.addEventListener('load', () => checkImageSize(img));
    }
  });
  
  function checkImageSize(img) {
    const container = img.closest('.prose');
    if (!container) return;
    
    // Get the actual container width (the prose content area)
    const containerWidth = container.offsetWidth;
    
    // Use the image's natural (intrinsic) dimensions
    const imageNaturalWidth = img.naturalWidth;
    
    // Only apply breakout if the natural image width would benefit from it
    // This means the image is naturally larger than the container + our breakout space
    if (imageNaturalWidth > containerWidth) {
      img.classList.add('breakout');
      console.log(`Image breakout applied: natural width ${imageNaturalWidth}px > container ${containerWidth}px`);
    } else {
      img.classList.remove('breakout');
      console.log(`Image stays normal: natural width ${imageNaturalWidth}px <= container ${containerWidth}px`);
    }
  }
  
  // Re-check on window resize (container width might change)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      proseImages.forEach(img => {
        if (img.complete && img.naturalWidth !== 0) {
          checkImageSize(img);
        }
      });
    }, 250); // Debounce resize events
  });
});
