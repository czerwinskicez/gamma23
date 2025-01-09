const filesLocationDomain = "https://gamma.23.net.pl/";
const cssEndpointPathname = "public/external/r290vsr32custom.css";

document.addEventListener("DOMContentLoaded", _=>{
    if(location.pathname=='/glowna_preprod'){
        const collapsibles = document.querySelectorAll(".collapsible");
    
        // modify collapsibles
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

        // replace [ranking_head]
        const fileContent = document.body.innerHTML;
        const regex = /\[ranking_head\](.*?)\[\/ranking_head\]/s;
        const match = fileContent.match(regex);

        if (match) {
            const content = match[1];

            // Insert the content into the custom-ranking-head div
            let customDiv = document.createElement('div');
            customDiv.className = 'custom-ranking-head';
            customDiv.innerHTML = content;

            // Replace the original tags with the new div
            document.body.innerHTML = fileContent.replace(regex, customDiv.outerHTML);
        }

        // load custom css
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = filesLocationDomain + cssEndpointPathname;
        link.type = "text/css";
        link.media = "all";
        document.head.appendChild(link);
    }

});