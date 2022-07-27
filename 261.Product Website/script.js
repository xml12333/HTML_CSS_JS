const imgP = document.getElementById("productImg");
const btn = Array.from(document.getElementsByClassName("btn"));
btn.forEach((el, idx) => {
  el.onclick = () => {
    imgP.style.opacity = 0;
    setTimeout(()=>{
        imgP.style.opacity = 1;  
        imgP.src = `img/image${idx + 1}.png`;
    },400)
    
    
    btn.forEach((x) => x.classList.remove("active"));
    el.classList.add("active");
  };
});
