function toggleText() {
    const HiddenTextEllipsis = document.getElementById("HiddenTextEllipsis");
    const HiddenTextmoreText = document.getElementById("HiddenTextmoreText");
    const button = document.getElementById("HiddentextButton");
  
    const isHidden = HiddenTextmoreText.style.display === "none";
  
    HiddenTextmoreText.style.display = isHidden ? "inline" : "none";
    HiddenTextEllipsis.style.display = isHidden ? "none" : "inline";
    button.innerHTML = isHidden ? "Show Less" : "Show More";
 }