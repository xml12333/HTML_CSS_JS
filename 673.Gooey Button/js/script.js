/** 
    very simply js to capture mouse position 
    and set variables to the % location. Everything else is css/svg.
**/
function moveBg(e) {
    const rect = e.target.getBoundingClientRect();
    e.target.style.setProperty('--x', (e.clientX - rect.x) / rect.width * 100);
    e.target.style.setProperty('--y', (e.clientY - rect.y) / rect.height * 100);
}
document.querySelector("button").addEventListener('pointermove', moveBg);


























/** just some JS for the intro animation, nothing here is needed
for the gooey interaction. **/
let x;
function intro() {
    let i = 4; 
    let $b = document.querySelector("button");
    $b.style.setProperty( "--a", '100%' );
    x = setInterval(() => {
        $b.style.setProperty( 
            "--x", ((Math.cos(i) + 2) / 3.6) * 100
        );
        $b.style.setProperty( 
            "--y", ((Math.sin(i) + 2) / 3.6) * 100
        );
        i+= 0.03;
        if( i > 11.5 ) {
            clearInterval(x);
            $b.style.setProperty( "--a", '' );
        }
    },16);
}
intro();
document.querySelector("button").addEventListener('pointerover', (e) => {
    clearInterval(x);
    e.target.style.setProperty( "--a", '' );
});