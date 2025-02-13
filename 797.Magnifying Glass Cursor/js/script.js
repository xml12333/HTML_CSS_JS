Splitting({
	whitespace: true
});

console.clear();
var tl = gsap.timeline({});
tl
	.to(".split-text .char", {
		x: 0,
		opacity: 1,
		duration: 1,
		delay: 0.5,
		stagger: {
			amount: 1.5,
			from: "start"
		}
	})
	.to(
		"img",
		{
			filter: "brightness(1)",
			clipPath: "circle(25rem at 82% 82%)",
			scale: 1,
			duration: 4,
			ease: "expo.inOut"
		},
		"-=2"
	)
	.to(".try-it", {
		scale: 1,
		duration: 0.5,
		ease: "back.out(4)"
	})
	.to(
		".try-it",
		{
			rotate: 15,
			transformOrigin: "bottom left",
			duration: 0.5,
			repeat: 5,
			yoyo: true,
			ease: "none"
		},
		"+=1"
	);

/* the magnifying glass */
$(document).ready(function () {
	var sub_width = 0;
	var sub_height = 0;
	$(".magnifying-glass").css(
		"background",
		"url('" + $(".card-image").attr("src") + "') no-repeat"
	);

	$(".card").mousemove(function (e) {
		if (!sub_width && !sub_height) {
			var image_object = new Image();
			image_object.src = $(".card-image").attr("src");
			sub_width = image_object.width;
			sub_height = image_object.height;
		} else {
			var magnify_position = $(this).offset();

			var mx = e.pageX - magnify_position.left;
			var my = e.pageY - magnify_position.top;

			if (mx < $(this).width() && my < $(this).height() && mx > 0 && my > 0) {
				$(".magnifying-glass").fadeIn(100);
			} else {
				$(".magnifying-glass").fadeOut(100);
			}
			if ($(".magnifying-glass").is(":visible")) {
				var rx =
					Math.round(
						(mx / $(".card-image").width()) * sub_width -
							$(".magnifying-glass").width() / 3
					) * -1;
				var ry =
					Math.round(
						(my / $(".card-image").height()) * sub_height -
							$(".magnifying-glass").height() / 3
					) * -1;

				var bgp = rx + "px " + ry + "px";

				var px = mx - $(".magnifying-glass").width() / 2.5;
				var py = my - $(".magnifying-glass").height() / 2.5;

				$(".magnifying-glass").css({ left: px, top: py, backgroundPosition: bgp });
			}
		}
	});
});