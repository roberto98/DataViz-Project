
$(document).ready(function(){
    $('#tab0-link').click(function(e){
        $('.nav-link.active').removeClass('active');
        $('#tab0-link').addClass('active');
        $('.tab-pane.active').removeClass('active show');
        $('#tab0').addClass('active show');
    });
    $('#tab1-link').click(function(e){
        $('.nav-link.active').removeClass('active');
        $('#tab1-link').addClass('active');
        $('.tab-pane.active').removeClass('active show');
        $('#tab1').addClass('active show');
    });
    $('#tab2-link').click(function(e){
        $('.nav-link.active').removeClass('active');
        $('#tab2-link').addClass('active');
        $('.tab-pane.active').removeClass('active show');
        $('#tab2').addClass('active show');
    });
    $('#tab3-link').click(function(e){
        $('.nav-link.active').removeClass('active');
        $('#tab3-link').addClass('active');
        $('.tab-pane.active').removeClass('active show');
        $('#tab3').addClass('active show');
    });
});
