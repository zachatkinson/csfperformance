function toggleText() {
    const points = document.getElementById("points");
    const moreText = document.getElementById("moreText");
    const button = document.getElementById("textButton");
  
    const isHidden = moreText.style.display === "none";
  
    moreText.style.display = isHidden ? "inline" : "none";
    points.style.display = isHidden ? "none" : "inline";
    button.innerHTML = isHidden ? "Show Less" : "Show More";
 }