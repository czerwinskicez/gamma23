const filesLocationDomain = "https://gamma.23.net.pl/";

const cssEndpointPathname = "public/external/r290vsr32custom.css";
const coIconPathname = "public/external/ikony_co.svg";
const podlogowkaIconPathname = "public/external/ikony_podlogowka.svg";

const cssEndpointAddress = filesLocationDomain + cssEndpointPathname;
const coIconAddress = filesLocationDomain + coIconPathname;
const podlogowkaIconAddress = filesLocationDomain + podlogowkaIconPathname;

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
        const replaceRankingHead = _=>{
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
        };
        replaceRankingHead();

        const replaceSecondarySection = _ => {
            const regex = /\[secondary_section(?:#(\w+))?\](.*?)\[\/secondary_section\]/gs;
            let fileContent = document.body.innerHTML;
            let match;
            while ((match = regex.exec(fileContent)) !== null) {
                const id = match[1] || '';
                const content = match[2];
            
                // Create the custom-secondary-section div with optional id
                let customDiv = document.createElement('div');
                customDiv.className = 'secondary-section-custom';
                if (id) customDiv.id = id;
                customDiv.innerHTML = `<div class='secondary-section-overlay'></div>`;
                customDiv.innerHTML += `<div class='secondary-section-content'>${content}</div>`;
            
                // Replace the original tag with the new div
                fileContent = fileContent.replace(match[0], customDiv.outerHTML);
            }
            document.body.innerHTML = fileContent;
        };
        replaceSecondarySection();

        /**
         * @param {BB tag} tag (eg. [ikona_co/])
         * @param {HTML} content
         */
        const replaceTags = (tag, content) => {
            const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedTag, 'g');
            document.body.innerHTML = document.body.innerHTML.replace(regex, content);
          };

          replaceTags("[ikona_co/]", `
            <div class='toggle-label-icon'><img src='${coIconAddress}'></div>
        `);
        replaceTags("[ikona_podlogowka/]", `
            <div class='toggle-label-icon'><img src='${podlogowkaIconAddress}'></div>
        `);

        // load custom css
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssEndpointAddress;
        link.type = "text/css";
        link.media = "all";
        document.head.appendChild(link);
    }

});