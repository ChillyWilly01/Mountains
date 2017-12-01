<script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
  <script>
    $(function(){
  var links = $('.m-menu-link, .close_menu');
  var menu = $('.m-menu');

  links.on('click', function(event) {
    event.preventDefault();
    menu.toggleClass('m-menu__active');
  });
});
  </script>