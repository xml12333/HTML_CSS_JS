$( function() {
  $( ".navigation" ).draggable();
} );

const navigation = document.querySelector(".navigation");
document.querySelector(".toggle").ondblclick = function () {
  this.classList.toggle("active");
  navigation.classList.toggle("active");
};
