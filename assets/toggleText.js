function toggleText() {
    const points = document.getElementById("points");
    const HiddenTextmoreText = document.getElementById("HiddenTextmoreText");
    const button = document.getElementById("textButton");
  
    const isHidden = HiddenTextmoreText.style.display === "none";
  
    HiddenTextmoreText.style.display = isHidden ? "inline" : "none";
    points.style.display = isHidden ? "none" : "inline";
    button.innerHTML = isHidden ? "Show Less" : "Show More";
 }