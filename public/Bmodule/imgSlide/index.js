$(document).ready(function(){
    $('.imgList').css('left', -1000);
    $('.imgList').last().prependTo('.imgList');

    setInterval(function(){
        $('.imgList').animate({left:'-='+1000},'slow',function(){
            $('.imgList li') .first().appendTo('.imgList');
            $('.imgList').css('left',-1000);
        });
    },2000);
})