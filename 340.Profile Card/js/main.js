/*=============== SHOW SOCIAL NETWORKS ===============*/
const showSocial = (toggleCard, socialCard) => {
  const toggle = document.getElementById(toggleCard),
    social = document.getElementById(socialCard);

    toggle.addEventListener('click',()=>{
        //If the animation class exist, we add the down-animation class
        if(social.classList.contains('animation')){
            social.classList.add('down-animation')
            //We remove the down-animation class
            setTimeout(()=>{
                social.classList.remove('down-animation')
            },1000)
        }
        //We add the animation class to the div tag with the card__social class
        social.classList.toggle('animation')
    })
};

showSocial("card-toggle", "card-social");
