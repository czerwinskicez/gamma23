document.addEventListener("DOMContentLoaded", _=>{
    const collapsibles = document.querySelectorAll(".collapsible");

    collapsibles.forEach(collapsible=>{
        collapsible.querySelectorAll("label.toggle-label").forEach(toggleLabel=>{
            // toggleLabel.style.display = "flex";
            toggleLabel.classList.add("custom-toggle-label");
            
            const zobaczButton = document.createElement("span");
            zobaczButton.classList.add("zobacz-button");
            zobaczButton.innerText = "Zobacz";
            // zobaczButton.style.display = "block";
            // zobaczButton.style.marginLeft = "auto";

            toggleLabel.appendChild(zobaczButton);
        });
    });

    if(location.pathname=='/glowna_preprod'){
        // load custom css
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://gamma.23.net.pl/public/external/r290vsr32custom.css";
        link.type = "text/css";
        link.media = "all";
        document.head.appendChild(link);
    }

});