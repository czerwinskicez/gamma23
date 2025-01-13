const filesLocationDomain = "https://gamma.23.net.pl/";

const cssEndpointPathname = "public/external/r290vsr32custom.css";
const coIconPathname = "public/external/ikony_co.svg";
const podlogowkaIconPathname = "public/external/ikony_podlogowka.svg";

const copIconPathname = "public/external/ikony_COP.svg";
const halasIconPathname = "public/external/ikony_halas.svg";
const mocIconPathname = "public/external/ikony_moc.svg";

const cssEndpointAddress = filesLocationDomain + cssEndpointPathname;
const coIconAddress = filesLocationDomain + coIconPathname;
const podlogowkaIconAddress = filesLocationDomain + podlogowkaIconPathname;

const copIconAddress = filesLocationDomain + copIconPathname;
const halasIconAddress = filesLocationDomain + halasIconPathname;
const mocIconAddress = filesLocationDomain + mocIconPathname;

document.addEventListener("DOMContentLoaded", _=>{
    if(String(document.body.innerHTML).includes("[load_custom_scripts/]")){

        /**
         * @param {BB tag} tag (eg. [ikona_co/])
         * @param {HTML} content
         */
        const replaceTags = (tag, content) => {
            const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedTag, 'g');
            document.body.innerHTML = document.body.innerHTML.replace(regex, content);
        };

        const replaceAnchorTargets = () => {
            const regex = /\[anchor_target#([^\]]+?)\/\]/g;
            document.body.innerHTML = document.body.innerHTML.replace(regex, (_, id) => `<div id="${id}"></div>`);
        };
          
        replaceAnchorTargets();

        replaceTags("[ikona_co/]", `
            <img class='toggle-label-icon' src='${coIconAddress}'>
        `);
        replaceTags("[ikona_podlogowka/]", `
            <img class='toggle-label-icon' src='${podlogowkaIconAddress}'>
        `);
        replaceTags("[ikona_cop/]", `
            <img class='section-icon' src='${copIconAddress}'>    
        `);
        replaceTags("[ikona_halas/]", `
            <img class='section-icon' src='${halasIconAddress}'>    
        `);
        replaceTags("[ikona_moc/]", `
            <img class='section-icon' src='${mocIconAddress}'>    
        `);
        replaceTags("[load_custom_scripts/]",``);

        replaceTags("[red_decor/]", `<div class='red-decor-custom'></div>`);
        replaceTags("[karty_cta/]", `
            <div class="cta-cards-wrapper">
                <div class='cta-card'>
                    <img src="https://www.r290vsr32.pl/content/pl/uploads/202501/foto_moc_1000x575px.jpg" alt="Moc grzewcza">
                    <div class='cta-card-content'>
                        <h3>Moc grzewcza</h3>
                        <a href="${location.origin+location.pathname}#rankingmocygrzewczej">
                            <span>Zobacz ranking</span><span>&nbsp;&nbsp;&gt</span>
                        </a>
                    </div>
                </div>    
                <div class='cta-card'>
                    <img src="https://www.r290vsr32.pl/content/pl/uploads/202501/foto_cop_1000x575px.jpg" alt="Współczynnik COP">
                    <div class='cta-card-content'>
                        <h3>Wartość współczynnika COP</h3>
                        <a href="${location.origin+location.pathname}#rankingcop">
                            <span>Zobacz ranking</span><span>&nbsp;&nbsp;&gt</span>
                        </a>
                    </div>
                </div>    
                <div class='cta-card'>
                    <img src="https://www.r290vsr32.pl/content/pl/uploads/202501/foto_halas_1000x575px.jpg" alt="Moc akustyczna">
                    <div class='cta-card-content'>
                        <h3>Moc akustyczna</h3>
                        <a href="${location.origin+location.pathname}#rankingmocyakustycznej">
                            <span>Zobacz ranking</span><span>&nbsp;&nbsp;&gt</span>
                        </a>
                    </div>
                </div>
            </div>
        `);

        const collapsibles = document.querySelectorAll(".collapsible");
    
        // modify collapsibles
        collapsibles.forEach(collapsible=>{
            collapsible.classList.add("custom-collapsible");
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

        document.querySelectorAll(".page-title")[0].style.display = "none";
        document.querySelectorAll(".subtitle")[0].style.display = "none";
        
        document.querySelectorAll("a.email-hash").forEach(hashedMailElement=>{
            if(hashedMailElement.innerText.endsWith("=")){
                hashedMailElement.innerText = atob(hashedMailElement.innerText)
            }
        })

        // load custom css
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssEndpointAddress;
        link.type = "text/css";
        link.media = "all";
        document.head.appendChild(link);
    }

});
