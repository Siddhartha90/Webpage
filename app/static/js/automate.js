var fadeout_container = 1000;
var fadein_container = 2000;

// fadein shared by all url's. fadeouts separate for each.
$(document).ready(function() {
        $(".container").css("display", "none");
        $(".suspension_container").css("display", "none");
        $(".credits").css("display", "none");
        $(".l1_content").css("display", "none");
        $(".container").fadeIn(fadein_container);
        $(".credits").fadeIn(2000);
        
        // link locations goes to controller in views.py
        // container fade out is the page fade out
        //links is the outer div class for the 'ul' table in upperJSrow_template.html
        //credits is the div class at the bottom with linkedin etc
    $(".Distributed").click(function(event){
        event.preventDefault();
        linkLocation = "CS425";
        $(".container").fadeOut(fadeout_container, redirectPage);
        $(".links").fadeOut(1000, redirectPage);
        $(".credits").fadeOut(1000, redirectPage);      
    });
    
    $(".Embedded").click(function(event){
        event.preventDefault();
        linkLocation = "CS431";
        $(".container").fadeOut(fadeout_container, redirectPage);
        $(".links").fadeOut(1000, redirectPage);
        $(".credits").fadeOut(1000, redirectPage);      
    });
    
    $(".Data").click(function(event){
        event.preventDefault();
        linkLocation = "CS225";
        $(".container").fadeOut(fadeout_container, redirectPage);
        $(".links").fadeOut(1000, redirectPage);
        $(".credits").fadeOut(1000, redirectPage);      
    });
    
    $(".Computational").click(function(event){
        event.preventDefault();
        linkLocation = "http://web.engr.illinois.edu/~gupta49/cs498dwh/";
        $(".container").fadeOut(fadeout_container, redirectPage);
        $(".links").fadeOut(1000, redirectPage);
        $(".credits").fadeOut(1000, redirectPage);      
    });
    
    $(".Cloud-Computing").click(function(event){
        event.preventDefault();
        linkLocation = "Cloud-Computing";
        $(".container").fadeOut(fadeout_container, redirectPage);
        $(".links").fadeOut(1000, redirectPage);
        $(".credits").fadeOut(1000, redirectPage);      
    });

    $(".Cloud-ComputingII").click(function(event){
        event.preventDefault();
        linkLocation = "Cloud-ComputingII";
        $(".container").fadeOut(fadeout_container, redirectPage);
        $(".links").fadeOut(1000, redirectPage);
        $(".credits").fadeOut(1000, redirectPage);      
    });    

    $(".MyName").click(function(event){
        event.preventDefault();
        linkLocation = "Sid";
        $(".container").fadeOut(fadeout_container, redirectPage);
        $(".links").fadeOut(3000, redirectPage);
        $(".credits").fadeOut(300, redirectPage);      
    });
    
    // $(".giticonclass").hover(function(event){
    //     event.preventDefault();
    //     $(".giticonclass").fadeIn(300);      
    // }, function(event){
    //     event.preventDefault();
    //     $(".giticonclass").fadeOut(300); 
    // });


// Resume link
/*
    / $(".l2").click(function(event){
    /     event.preventDefault();
    /     linkLocation = "http://web.engr.illinois.edu/~gupta49/Resume.html";
    /     $(".container").fadeOut(1000, redirectPage);
    /     $(".links").fadeOut(1000, redirectPage);
    /     $(".credits").fadeOut(1000, redirectPage);      
    / });
*/
    
    
    //hover takes 2 functons, one mouseover and mouseleave
    $(".l1").hover(function(event){
        event.preventDefault();
        $(".l1_content").fadeIn(500);      
    }, function(event){
    	event.preventDefault();
        $(".l1_content").fadeOut(500); 
    });
         
    function redirectPage() {
        window.location = linkLocation;
    }
    });
    
    window.onbeforeunload = function () {
   	document.location.reload(true);
    }

    