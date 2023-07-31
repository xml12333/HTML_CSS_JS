let xpos = 35;
let ypos = 25;
let myCounter = 0;
let myCounter1 = 9;

$(() => {

    var myInterrupt = setInterval(myTimer, 65);
 
		function myTimer() {
	  myCounter++; 
      console.log(myCounter);
      const xpos=  Math.floor(Math.random() * 95) + 1
      const ypos=  Math.floor(Math.random() * 95) + 1
   $(".burst:nth-child(" + (myCounter) + ")").css("left", xpos+ 0 + "%").css("top", ypos + "%").addClass("burstanim");
      

      
      if (myCounter > 18) {
        var temp = myCounter - 18;
    $(".burst:nth-child(" + (temp) + ")").removeClass("burstanim");
       }
      if (myCounter > 180) {myCounter = 32;}
    }
});