const blur = document.getElementById("blur-area");
document.onmousemove = (e) => {
    blur.style.transform = `translate(${e.pageX}px,${e.pageY}px)`
};
