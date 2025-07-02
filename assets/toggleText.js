function toggleText() {
    const HiddenTextEllipsis = document.getElementById("HiddenTextEllipsis");
    const HiddenTextmoreText = document.getElementById("HiddenTextmoreText");
    const button = document.getElementById("HiddentextButton");
  
    const isHidden = HiddenTextmoreText.style.display === "none";
  
    HiddenTextmoreText.style.display = isHidden ? "inline" : "none";
    HiddenTextEllipsis.style.display = isHidden ? "none" : "inline";
    button.innerHTML = isHidden ? "Show Less" : "Show More";
 }

// Test from https://www.thepagesmedia.com/blogs/posts/add-a-read-more-for-product-descriptions-in-shopify
$(document).ready(function () {
  $('.readmore').click(function (event) {
      event.preventDefault();
      var description = document.querySelector('#product-description');
      console.log(description.style.height)
      if (description.style.height === ''){
        description.style.height = 'auto';
      } else if (description.style.height === 'auto'){
        description.style.height = '';
      }
      else{
        description.style.height = '92px';
      }
      $(this).text($(this).text() == 'Read less...' ? 'Read full description...' : 'Read less...');
  });
});