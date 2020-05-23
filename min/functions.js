function checkSettings(){return new Promise((e,t)=>{browser.storage.local.get(null).then(o=>{o.folder?e("Bookmarker -> local settings found"):t("Bookmarker -> local settings not found")})}).then(e=>{}).catch(e=>{browser.storage.local.set({folder:[],background:[],font:[]}).then(()=>{})})}function reviewSettings(){return new Promise((e,t)=>{browser.storage.local.get().then(e=>{let t,o;for(let o of folders){t=!1;for(let n of e.folder)if(n===o){t=!0;break}t||(e.folder.push(o),e.background.push("555555"),e.font.push("FFFFFF"))}let n=[];for(let t of e.folder){o=!1;for(let e of folders)if(e===t){o=!0;break}o||n.push(e.folder.indexOf(t))}let r=0;for(let t of n)e.folder.splice(t+r,1),e.background.splice(t+r,1),e.font.splice(t+r,1),r--;return e}).then(t=>{settings=t,browser.storage.local.set(settings).then(()=>{e("Bookmarker -> local settings reviewed")})})}).then(e=>{})}function updateSettings(){let e={folder:[],background:[],font:[]},t=document.getElementsByClassName("set");for(let o=0,n=t.length;o<n;o++)e.folder.push(t[o].querySelector("h4").textContent),e.font.push(t[o].querySelector(".font").value),e.background.push(t[o].querySelector(".background").value);settings=e,browser.storage.local.set(settings).then(()=>{applySettings(settings)})}function applySettings(){for(let e=0,t=settings.folder.length;e<t;e++){let t=document.getElementsByClassName(settings.folder[e]);for(let o=0,n=t.length;o<n;o++)t[o].style.color="#"+settings.font[e],t[o].style.backgroundColor="#"+settings.background[e]}}function toggleSettings(){UI.settings.classList.toggle("opened"),UI.bookies.classList.toggle("invisible")}function analyzeContent(e,t){if(e.url)e.folder=t,bookies.push(e);else if("Barre personnelle"!=e.title&&folders.push(e.title),e.children)for(let t=0,o=e.children.length;t<o;t++)analyzeContent(e.children[t],e.title)}function filterContent(e,t){var o=document.getElementsByClassName("bookie"),n="Tout montrer"===t?o:document.getElementsByClassName(t);for(let e=0,t=o.length;e<t;e++)o[e].classList.remove("visible"),o[e].classList.add("invisible");updateCounter();for(let t=0,o=n.length;t<o;t++)n[t].id.toLowerCase().indexOf(e.toLowerCase())>=0&&(n[t].classList.remove("invisible"),n[t].classList.add("visible"),updateCounter(++counter))}function sortContent(){var e=[];for(let t=0,o=bookies.length;t<o;t++){let o=[bookies[t].title,bookies[t].folder,bookies[t].url];e.push(o)}e.sort(function(e,t){return e[0].toLowerCase().localeCompare(t[0].toLowerCase())}),bookies=[];for(let o=0,n=e.length;o<n;o++){var t={title:e[o][0],folder:e[o][1],url:e[o][2]};bookies.push(t)}folders.sort()}function appendContent(){UI.bookies.innerHTML="";for(let e=0,t=bookies.length;e<t;e++){let t=document.createElement("a");t.setAttribute("href",bookies[e].url),t.id=bookies[e].title,t.setAttribute("class",bookies[e].folder),t.classList.add("bookie","visible"),t.textContent=bookies[e].title,UI.bookies.appendChild(t)}updateCounter(bookies.length),UI.folderSelect.innerHTML="",UI.folderSelect.innerHTML="<option selected>Tout montrer</option>";for(let e=0,t=folders.length;e<t;e++){let t=document.createElement("option");t.textContent=folders[e],UI.folderSelect.appendChild(t)}}function submitQuery(e,t){if(t){let o;switch(t){case"ecosia":o="https://www.ecosia.org/search?q=";break;case"qwant":o="https://www.qwant.com/?q=";break;case"duckduckgo":o="https://duckduckgo.com/?q=";break;case"google":o="https://www.google.fr/search?q="}browser.tabs.create({url:o+e})}else if(!t&&counter>0){let e=document.getElementsByClassName("visible");for(let t=0,o=e.length;t<o;t++)browser.tabs.create({url:e[t].href})}else submitQuery(e,"ecosia");resetSelection()}function resetSelection(){UI.folderSelect.children[0].selected="selected",filterContent("","Tout montrer"),UI.searchInput.value="",UI.searchInput.focus()}function updateCounter(e=0){counter=e;let t=counter>1?e+" bookies":e+" bookie";UI.counter.textContent=t,UI.info.textContent=counter>0?"Sélectionnez un bookie ou pressez la touche Entrée pour ouvrir "+t+".":"Aucun résultat. Pressez la touche Entrée ou sélectionnez un moteur pour rechercher sur le web."}function createForm(){UI.sets.innerHTML="";for(let e=0,t=settings.folder.length;e<t;e++){let t=document.createElement("div");t.classList.add("set");let o=document.createElement("h4");o.textContent=settings.folder[e],o.style.color="#"+settings.font[e],o.style.backgroundColor="#"+settings.background[e],t.appendChild(o);for(let o of["font","background"]){let n=document.createElement("label");n.textContent="font"===o?"Police":"Fond";let r=document.createElement("span");r.textContent="#";let l=document.createElement("input");l.setAttribute("type","text"),l.setAttribute("required",!0),l.classList.add(o,"field"),l.value=settings[o][e],l.setAttribute("pattern","[0-9a-fA-F]{6}"),l.oninput=(e=>{let t=e.target.parentNode.querySelector("h4");"font"===o?t.style.color="#"+e.target.value:t.style.backgroundColor="#"+e.target.value,e.target.value=e.target.value.toUpperCase()}),t.appendChild(n),t.appendChild(r),t.appendChild(l)}UI.sets.appendChild(t)}}function start(){sortContent(),appendContent(),createForm(),applySettings()}