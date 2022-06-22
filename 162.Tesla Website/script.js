const header = document.getElementById("header");
const models = document.getElementById("models");
const model3 = document.getElementById("model3");
const modelx = document.getElementById("modelx");
const modely = document.getElementById("modely");
const model = document.getElementById("model");


models.onclick = ()=>{
    header.style.backgroundImage="url(images/image-1.png)"
    model.innerHTML = "Model S";
}
model3.onclick = ()=>{
    header.style.backgroundImage="url(images/image-2.png)"
    model.innerHTML = "Model 3";
}
modelx.onclick = ()=>{
    header.style.backgroundImage="url(images/image-3.png)"
    model.innerHTML = "Model X";
}
modely.onclick = ()=>{
    header.style.backgroundImage="url(images/image-4.png)"
    model.innerHTML = "Model Y";
}