const btn = document.getElementById("btn");
const spans = Array.from(document.getElementsByTagName("span"));

btn.onclick = () => {
  spans.forEach(el => el.classList.add("anim"))
  setTimeout(()=>{ spans.forEach(el => el.classList.remove("anim")) },500)
};
