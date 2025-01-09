document.addEventListener("DOMContentLoaded", _=>{
    console.log(document.querySelectorAll(".collapsible"));
});

if(location.pathname=='/glowna_preprod'){
    // load custom css
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "r290vsr32custom.css";
    link.type = "text/css";
    link.media = "all";
    document.head.appendChild(link);
}