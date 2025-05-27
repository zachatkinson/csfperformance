document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('mc-embedded-subscribe-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('mce-EMAIL');
    const errorResponse = document.getElementById('mce-error-response');
    const successResponse = document.getElementById('mce-success-response');
    
    // Hide any existing messages
    errorResponse.style.display = 'none';
    successResponse.style.display = 'none';
    
    // Submit the form using fetch
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      mode: 'no-cors'
    })
    .then(() => {
      // Show success message
      successResponse.style.display = 'block';
      emailInput.value = '';
    })
    .catch(() => {
      // Show error message
      errorResponse.style.display = 'block';
      errorResponse.querySelector('.error-message').textContent = 'An error occurred. Please try again.';
    });
  });
}); 