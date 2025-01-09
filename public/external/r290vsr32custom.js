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
        const regex = /\[ranking_head(?:#(\w+))?\](.*?)\[\/ranking_head\]/gs;
        let fileContent = document.body.innerHTML;
        let match;
        while ((match = regex.exec(fileContent)) !== null) {
            const id = match[1] || '';
            const content = match[2];
        
            // Create the custom-ranking-head div with optional id
            let customDiv = document.createElement('div');
            customDiv.className = 'custom-ranking-head';
            if (id) customDiv.id = id;
            customDiv.innerHTML = content;
        
            // Replace the original tag with the new div
            fileContent = fileContent.replace(match[0], customDiv.outerHTML);
        }
        document.body.innerHTML = fileContent;
        

        // load custom css
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = filesLocationDomain + cssEndpointPathname;
        link.type = "text/css";
        link.media = "all";
        document.head.appendChild(link);
    }

});