class VideoOnHover extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.classList.add("container");
    container.classList.add("animating");

    const img = document.createElement("img");
    img.src = this.getAttribute("image");
    container.appendChild(img);

    const video = document.createElement("video");
    video.src = this.getAttribute("src");
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    container.appendChild(video);

    const style = document.createElement("style");
    style.textContent = `
    :host{
    display: block;
    }
    
.container{
  position: relative;
width: 100%;
height: 100%;
cursor: pointer;
}

video{
  width: 100%;
}

img{
position: absolute;
top: 0;
left: 0;
width: 100%;
transition: opacity 0.4s;
}

.container.animating > img {
opacity: 0;
}

.container:hover > img {
opacity: 0;
}

        `;

    const shadowRoot = this.shadowRoot;
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(container);

   
   container.addEventListener("mouseover", () => video.play());
    container.addEventListener("mouseout", () => video.pause());
    
    setTimeout(() => {
      container.classList.remove('animating')
    }, 1000);
  }
}

customElements.define("video-on-hover", VideoOnHover);
