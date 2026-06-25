$(document).ready(function (){
    let offset = {offset: "100%"}
    $(".table_of_content_title").waypoint(function(){
        $(".table_of_content_title").addClass(
            "animate__animated animate__backInUp"
        );
    }, offset );
});