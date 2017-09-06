$(document).ready(function() {
    var stickyNavTop = $('.cd-main-header').offset().top;
    var stickyNav = function(){
        var scrollTop = $(window).scrollTop();
        if (scrollTop > stickyNavTop) {
            $('.cd-main-header').addClass('sticky');
            }
        else {
            $('.cd-main-header').removeClass('sticky');
         }
    };
    stickyNav();
    $(window).scroll(function() {
        stickyNav();
    });
});

$(function(){
   $('#main-block a[href^=#]').click(function() {
      var speed = 600;
      var href= $(this).attr("href");
      var target = $(href == "#" || href == "" ? 'html' : href);
      var position = target.offset().top;
      $('body,html').animate({scrollTop:position}, speed, 'swing');
      return false;
   });
});


$(function(){
    $('.lang-switch li').hover(function(){
        $("ul:not(:animated)", this).fadeIn();
    }, function(){
        $("ul.lang-switch-menu",this).fadeOut();
    });
});


$(document).ready(function(){
    $(".pagetop").hide();
    $(window).on("scroll", function() {
 
        if ($(this).scrollTop() > 600) {
         $('.pagetop').slideDown("fast");
        } else {
            $('.pagetop').slideUp("fast");
        }
        scrollHeight = $(document).height(); 
        scrollPosition = $(window).height() + $(window).scrollTop(); 
        footHeight = $("footer").innerHeight();
                 
        if ( scrollHeight - scrollPosition  <= footHeight ) {
            $(".pagetop").css({
                "position":"absolute",
                "bottom": footHeight
            });
        } else {
            $(".pagetop").css({
                "position":"fixed",
                "bottom": "0"
            });
        }
    });
    $('.pagetop a').click(function () {
        $('body,html').animate({
        scrollTop: 0
        }, 600);
        return false;
     });
});