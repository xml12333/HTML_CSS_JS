let n = 0;
const CART_CNT = document.querySelector("output");
document.querySelectorAll("[type='radio']").forEach(radio => {
    radio.onclick = () => {
            CART_CNT.innerText = ++n;
            CART_CNT.setAttribute("arial-label", `${n}`)
     }
});