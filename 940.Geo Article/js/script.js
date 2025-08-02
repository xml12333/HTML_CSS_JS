//paralax scroll on the sky
$(window).scroll(function(e){
	scroller();
});
$(window).resize(function(){
    scroller();
});
$('body').on({
    'touchmove': function(e) { 
        console.log($(this).scrollTop()); // Replace this with your code.
    }
});
function scroller(){
	var scrollTop = $(window).scrollTop();
	var winHeight = $(window).height();
	var docHeight = $(document).height();
	var scrollPercent = (scrollTop) / (docHeight-winHeight);
	var scrollPercentRounded = scrollPercent*100
	//$('.maintitle').text(scrollPercentRounded)
	$('#imache').css("transform","translate(-50%,"+((scrollPercentRounded*2)-50)+"%)");
	$('#text1').css("transform","translateY("+((scrollPercentRounded*2.5)-80)+"%)");
	$('#text2').css("transform","translateY("+((scrollPercentRounded*2.5)-200)+"%)");
	$('#text3').css("transform","translateY("+((scrollPercentRounded*2)-300)+"%)");
}