const list = [
  {
    url:
      "https://images.unsplash.com/photo-1758640927926-9f0b1cda712e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjA1Nzg0OTN8&ixlib=rb-4.1.0&q=80&w=400",
    orientation: "horizontal"
  },
  {
    url:
      "https://images.unsplash.com/photo-1758557683300-45ae99df1342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjA1ODE5ODJ8&ixlib=rb-4.1.0&q=80&w=400",
    orientation: "vertical"
  },
  {
    url:
      "https://images.unsplash.com/photo-1758640920780-c60f90d7cc07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjA1ODIwMjB8&ixlib=rb-4.1.0&q=80&w=400",
    orientation: "horizontal"
  },
  {
    url: "https://images.unsplash.com/photo-1751644372956-eb3250751df6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjA1ODE5Mzd8&ixlib=rb-4.1.0&q=80&w=400",
    orientation: 'vertical'
  }
];

const bgEl = document.querySelector('.image-bg')
const imgEl = document.querySelector('img')


const setImage = (data) => {
  bgEl.style.backgroundImage = `url(${data.url})`;
  imgEl.src = data.url;
  if (data.orientation === 'vertical') {
    imgEl.classList.add('vertical')
  } else {
    imgEl.classList.remove('vertical')
  }
}

const setList = () => {
  const imgList = document.querySelector('.image-list')
  for (const data of list) {
    const { url } = data
    const thumbnail = document.createElement('div')
    thumbnail.classList.add('thumbnail')
    thumbnail.style.backgroundImage = `url(${url})`
    thumbnail.addEventListener('click', () => setImage(data))
    imgList.appendChild(thumbnail)
  }
}

const onLoad = () => {
  // set images
  const img = list[0]
  setImage(img)
  // set list
  setList()
}

window.addEventListener('load', onLoad)