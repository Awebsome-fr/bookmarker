function buildDatas(element) {

	/*
	The element DOESN'T have an URL : it's a folder.
	List element in the array "folders" and move forward.
	*/
	if(!element.url) {

		if(element.title != 'Barre de favoris' && element.title != 'Autres favoris') {
			datas.folders.push(element.title);
			datas.foldersIndex++;
		}
	
		// Does the current folder have a child ?
		if(element.children) {
			for(let i = 0, l = element.children.length; i < l; i++) {
				buildDatas(element.children[i]);
			}
		}
	
	}

	/*
	The element have an URL : it's a bookie.
	List element in the array "bookies" with its parent folder.
	*/
	else {
		element.folder = datas.folders[datas.foldersIndex];
		datas.bookies.push(element);
	}

}

function checkSettings() {

	return new Promise(
		
		function(resolve, reject) {
		
			chrome.storage.local.get(null, function(settings) {

				// Local settings not found ? Create start settings !
				if(settings.folder === undefined) {
					
					chrome.storage.local.set(
						
						{
							folder: [],
							background : [],
							font: [] 
						},
						
						function() { 
							
							// FOR DEBUGGING ONLY
							// console.log('Bookmarker -> local settings created.'); 
						
						}

					);

				}

			});

			resolve('Bookmarker -> local settings successfully checked.');

		}
	);

}

function reviewSettings() {

	return new Promise(
		
		function(resolve, reject) {
		
			chrome.storage.local.get(null, function(loadedSettings) {

				// First : check if local setting are sufficiently defined by adding missing folders.
				let found;
				
				// Browse CURRENT folders.
				for(let folder of datas.folders) {			
					
					found = false;

					// Browse STORED folders.
					for(let savedFolder of loadedSettings.folder) {
						// Found : set 'found' to true and break the loop.
						if(savedFolder === folder) {
							found = true;
							break;
						}
					}	
					
					// Missing ('found' is always false) : complete statement needed.
					if(!found) {
						
						loadedSettings.folder.push(folder);
						loadedSettings.background.push('555555');
						loadedSettings.font.push('FFFFFF');
						
						// FOR DEBUGGING ONLY
						// console.log('Bookmarker -> the missing settings for the folder "' + folder + '" were created');
					
					}

				}

				// Second : check if there are some unnecessary folders to remove.
				let active;
				let indexesToRemove = [];

				// Browse STORED folders
				for(let savedFolder of loadedSettings.folder) {

					active = false;

					// Browse CURRENT folders.
					for(let folder of datas.folders) {

						// Found : set 'active' to true and break the loop.
						if(folder === savedFolder) {
							active = true;
							break;
						}

					}

					// Not found ('active' is always false) : it is an unnecessary folder to remove.
					if(!active) {

						indexesToRemove.push(loadedSettings.folder.indexOf(savedFolder));		

						// FOR DEBUGGING ONLY
						// console.log('Bookmarker -> Useless settings for the folder "' + savedFolder + '" found');
						
					}

				}

				// Third : remove unnecessary folders.
				let compArray = 0;

				for(let indexToRemove of indexesToRemove) {

					loadedSettings.folder.splice(indexToRemove + compArray, 1);
					loadedSettings.background.splice(indexToRemove + compArray, 1);
					loadedSettings.font.splice(indexToRemove + compArray, 1);

					// FOR DEBUGGING ONLY
					// console.log('Bookmarker -> Useless settings for the folder "' + loadedSettings.folder[indexToRemove + compArray] + '" were deleted');

					compArray--;

				}

				// Four : update the local storage.
				datas.settings = loadedSettings;

				chrome.storage.local.set(datas.settings, function() {

					// FOR DEBUGGING ONLY
					// console.log('Bookmarker -> local settings reviewed');

				});

			});

			resolve('Bookmarker -> local settings successfully reviewed.');

		}

	);

}								

function updateSettings() {

	// Create an empty object to receive the new datas.
	let newSettings =
		{
			folder: [],
			background : [],
			font: [] 
		};
		
	// Target all the sets from the setting form then add their values to newSetting.
	let userSettings = document.getElementsByClassName('set');
	for(let i = 0, l = userSettings.length; i < l; i++) {
		newSettings.folder.push(userSettings[i].querySelector('h4').textContent);
		newSettings.font.push(userSettings[i].querySelector('.font').value);
		newSettings.background.push(userSettings[i].querySelector('.background').value);
	}
	
	// Overwrite settings.
	datas.settings = newSettings; 
	
	// Update the settings into the local storage then actualize the display.
	browser.storage.local.set(datas.settings).then(() => { 
		
		applySettings(datas.settings);
		
		// FOR DEBUGGING ONLY
		console.log('Bookmarker -> local settings updated'); 
		
	});
	
}

function applySettings() {
	
	for(let i = 0, l = datas.settings.folder.length; i < l; i++) {
		
		let bookies = document.getElementsByClassName(datas.settings.folder[i]);
		
		for(let j = 0, k = datas.bookies.length; j < k; j++) {

			datas.bookies[j].style.color = '#' + datas.settings.font[i];
			datas.bookies[j].style.backgroundColor = '#' + datas.settings.background[i];
		
		}

	}
	
	// FOR DEBUGGING ONLY
	console.log('Bookmarker -> local settings applied');

}

function toggleSettings () {

	UI.settings.classList.toggle("opened");
	UI.bookies.classList.toggle("invisible");

}

function filterContent (input, folder) {

	// Target all the bookies.
	var completeBkElms = document.getElementsByClassName('bookie');

	/* 
	Create an exit variable.
	If 'folder' is 'Tout montrer' : 'filteredBkElms' equals 'completeBkElms'.
	Else, 'filteredBkElms' contains all the corresponding bookies regarding of the name of the class.
	*/
	var filteredBkElms = folder === 'Tout montrer' ? completeBkElms : document.getElementsByClassName(folder);

	// Set the class'invisible' to all the bookies
	for(let i = 0, l = completeBkElms.length; i < l; i++) {
		completeBkElms[i].classList.remove('visible');
		completeBkElms[i].classList.add('invisible');
	}

	// Reset the bookies counter
	updateCounter();

	// Then remove the class 'invisible' on the matches and update the bookies counter
	for(let i = 0, l = filteredBkElms.length; i < l; i++) {
		if(filteredBkElms[i].id.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
			filteredBkElms[i].classList.remove('invisible');
			filteredBkElms[i].classList.add('visible');
			updateCounter(++datas.counter); 
		}
	
	}

}

function sortContent() {
	
	// 1. BOOKIES
	
	var sortedArray = []; // Array for temporary storage.
	// a. Convert each object as an array.
	for(let i = 0, l = datas.bookies.length; i < l; i++) {
		let currentBookie = [datas.bookies[i].title, datas.bookies[i].folder, datas.bookies[i].url];	
		// Then store it into another array.
		sortedArray.push(currentBookie);
	}
	
	// b. Sort the new array.
	sortedArray.sort(function(a, b) {
		return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
	});		

	// c. Empty the initial array.
	datas.bookies = [];
	// d. Then recreate it.
	for(let i = 0, l = sortedArray.length; i < l; i++) {
		var object = {
			'title': sortedArray[i][0],
			'folder': sortedArray[i][1],
			'url': sortedArray[i][2]
		};
		datas.bookies.push(object);
	}
	
	// 2. FOLDERS

	datas.folders.sort();
	
	// FOR DEBUGGING ONLY
	console.log('Bookmarker -> bookies and folders ordered by name'); 

}

function appendContent() {

	// 1. BOOKIES

	// Empty the bookies section before appending bookies
	UI.bookies.innerHTML = '';

	// Create bookies.
	for(let i = 0, l = datas.bookies.length; i < l; i++) {

		let bookieElm = document.createElement('a');
		bookieElm.setAttribute('href', datas.bookies[i].url);
		bookieElm.id = datas.bookies[i].title;
		// Set the class manually because there are sometimes spaces inside the folder name
		bookieElm.setAttribute('class', datas.bookies[i].folder);
		bookieElm.classList.add('bookie', 'visible');
		bookieElm.textContent = datas.bookies[i].title;
		UI.bookies.appendChild(bookieElm);				

	}

	updateCounter(datas.bookies.length);

	// 2. FOLDERS

	// Empty the select input before appending folders	
	UI.folderSelect.innerHTML = '';
	UI.folderSelect.innerHTML = '<option selected>Tout montrer</option>';

	for(let i = 0, l = datas.folders.length; i < l; i++) {	
	
		let optionElm = document.createElement('option');
		optionElm.textContent = datas.folders[i];
		UI.folderSelect.appendChild(optionElm);

	}

}

function submitQuery (search, engine) {

	// Engine sent : use this one.
	if(engine) {

		// State baseUrl.
		let baseUrl;
		switch(engine) {
			case 'ecosia':
				baseUrl = 'https://www.ecosia.org/search?q=';
				break;
			case 'qwant':
				baseUrl = 'https://www.qwant.com/?q=';
				break;
			case 'duckduckgo':
				baseUrl = 'https://duckduckgo.com/?q=';
				break;
			case 'google':
				baseUrl = 'https://www.google.fr/search?q=';
				break;
		}

		// Open the search results into a new tab.
		browser.tabs.create({ url: baseUrl + search });

	}

	// Engine not sent AND there are active bookies : open ALL the visible bookies.
	else if(!engine && counter > 0) {

		let activeBkElms = document.getElementsByClassName('visible');
		
		for(let i = 0, l = activeBkElms.length; i < l; i++) {

			browser.tabs.create({url: activeBkElms[i].href });
		
		}

	}

	// Engine not sent AND there are NO active bookies : open the search results into a new tab with recursive.
	else {

		submitQuery(search, 'ecosia');

	}

	resetSelection();

}

function resetSelection() {

	UI.folderSelect.children[0].selected = 'selected';
	filterContent('', 'Tout montrer');
	UI.searchInput.value = '';
	UI.searchInput.focus();

}

function updateCounter (value = 0) {

	datas.counter = value;
	let countMess = counter > 1 ? value + ' bookies' : value + ' bookie';
	UI.counter.textContent = countMess;
	UI.info.textContent = counter > 0 ? 
		'Sélectionnez un bookie ou pressez la touche Entrée pour ouvrir ' + countMess + '.': 
		'Aucun résultat. Pressez la touche Entrée ou sélectionnez un moteur pour rechercher sur le web.';

}

function createForm () {

	UI.sets.innerHTML = '';

	for(let i = 0, l = datas.settings.folder.length; i < l; i++) {
	
		// Create one set by folder.
		let setElm = document.createElement('div');
		setElm.classList.add('set');

		// With a title.
		let titleElm = document.createElement('h4');
		titleElm.textContent = datas.settings.folder[i];
		titleElm.style.color = '#' + datas.settings.font[i]; 
		titleElm.style.backgroundColor = '#' + datas.settings.background[i];
		setElm.appendChild(titleElm);

		// And two text fields where the colors could be previewed.
		for(let field of ['font', 'background']) {
			
			let labelElm = document.createElement('label');
			labelElm.textContent = field === 'font' ? 'Police' : 'Fond';
	
			let hashtagElm = document.createElement('span');
			hashtagElm.textContent = '#';

			let inputElm = document.createElement('input');
			inputElm.setAttribute('type', 'text');
			inputElm.setAttribute('required', true);
			inputElm.classList.add(field, 'field');
			inputElm.value = datas.settings[field][i];
			inputElm.setAttribute('pattern', '[0-9a-fA-F]{6}');
			inputElm.oninput = (e) => {
				let targetElm = e.target.parentNode.querySelector('h4');
				field === 'font' ?
					targetElm.style.color = '#' + e.target.value :
					targetElm.style.backgroundColor = '#' + e.target.value;
				e.target.value = e.target.value.toUpperCase();
			};
			
			setElm.appendChild(labelElm);
			setElm.appendChild(hashtagElm);
			setElm.appendChild(inputElm);

		}
	
		UI.sets.appendChild(setElm);

	}

}

function start () {
	
	sortContent();
	appendContent();
	createForm();
	applySettings();

}