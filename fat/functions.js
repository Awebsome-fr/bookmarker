function buildDatas(element) {

	/*
	The element DOESN'T have an URL : it's a folder.
	List element in the array "folders" and move forward.
	*/
	if(!element.url) {

		if(element.title != 'Barre de favoris' && element.title != 'Autres favoris') {
			folders.push(element.title);
			foldersIndex++;
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
		element.folder = folders[foldersIndex];
		bookies.push(element);
	}

}

function checkSettings() {

	// chrome.storage.local.clear();

	return new Promise((resolve, reject) => {
		
		chrome.storage.local.get(null, function(settings) {

			if(settings.folder === undefined) {
				console.log('Bookmarker -> settings not found in the local storage of the navigator.');
				reject(undefined);
			}

			else {
				console.log('Bookmarker -> settings found in the local storage of the navigator.');
				resolve(settings);
			}

		});

	});

}

function initSettings() {

	return new Promise((resolve, reject) => {

		let settings = {
			folder: [],
			background : [],
			font: [] 
		}

		chrome.storage.local.set(
			settings,			
			() => { 
				console.log('Bookmarker -> settings initialized.'); 
				resolve(settings);
			}
		);

	});

}

function reviewSettings(settings) {

	return new Promise((resolve, reject) => {
		
		// First : check if local setting are sufficiently defined by adding missing folders.
		let found;
		
		// Browse CURRENT folders.
		for(let folder of folders) {			
			
			found = false;

			// Browse STORED folders.
			for(let savedFolder of settings.folder) {
				// Found : set 'found' to true and break the loop.
				if(savedFolder === folder) {
					found = true;
					break;
				}
			}	
			
			// Missing ('found' is always false) : complete statement needed.
			if(!found) {
				
				settings.folder.push(folder);
				settings.background.push('555555');
				settings.font.push('FFFFFF');
				
				console.log('Bookmarker -> the missing settings for the folder "' + folder + '" were created');
			
			}

		}

		// Second : check if there are some unnecessary folders to remove.
		let active;
		let indexesToRemove = [];

		// Browse STORED folders
		for(let savedFolder of settings.folder) {

			active = false;

			// Browse CURRENT folders.
			for(let folder of folders) {

				// Found : set 'active' to true and break the loop.
				if(folder === savedFolder) {
					active = true;
					break;
				}

			}

			// Not found ('active' is always false) : it is an unnecessary folder to remove.
			if(!active) {

				indexesToRemove.push(settings.folder.indexOf(savedFolder));		

				// FOR DEBUGGING ONLY
				// console.log('Bookmarker -> Useless settings for the folder "' + savedFolder + '" found');
				
			}

		}

		// Third : remove unnecessary folders.
		let compArray = 0;

		for(let indexToRemove of indexesToRemove) {

			settings.folder.splice(indexToRemove + compArray, 1);
			settings.background.splice(indexToRemove + compArray, 1);
			settings.font.splice(indexToRemove + compArray, 1);

			// FOR DEBUGGING ONLY
			// console.log('Bookmarker -> Useless settings for the folder "' + settings.folder[indexToRemove + compArray] + '" were deleted');

			compArray--;

		}

		console.log('Bookmarker -> settings successfully reviewed.');
		resolve(settings);

	});

}								

function updateSettings(settings) {

	return new Promise(

		function(resolve, reject) {

			// Four : update the local storage.
			user.settings = settings;

			chrome.storage.local.set(user.settings, function() {

				console.log('Bookmarker -> settings updated in the local storage of the navigator.');
				resolve();

			});


		}

	);

}

function xxxSettings() {

	// Create an empty object to receive the new 
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
	settings = newSettings; 
	
	// Update the settings into the local storage then actualize the display.
	browser.storage.local.set(settings).then(() => { 
		
		applySettings(settings);
		
		console.log('Bookmarker -> local settings updated'); 
		
	});
	
}

function applySettings() {
	
	for(let i = 0, l = user.settings.folder.length; i < l; i++) {
		
		let bookies = document.getElementsByClassName(user.settings.folder[i]);
		
		for(let j = 0, k = bookies.length; j < k; j++) {

			bookies[j].style.color = '#' + user.settings.font[i];
			bookies[j].style.backgroundColor = '#' + user.settings.background[i];
		
		}

	}
	
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
			updateCounter(++counter); 
		}
	
	}

}

function sortContent() {
	
	// 1. BOOKIES
	
	var sortedArray = []; // Array for temporary storage.
	// a. Convert each object as an array.
	for(let i = 0, l = bookies.length; i < l; i++) {
		let currentBookie = [bookies[i].title, bookies[i].folder, bookies[i].url];	
		// Then store it into another array.
		sortedArray.push(currentBookie);
	}
	
	// b. Sort the new array.
	sortedArray.sort(function(a, b) {
		return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
	});		

	// c. Empty the initial array.
	bookies = [];
	// d. Then recreate it.
	for(let i = 0, l = sortedArray.length; i < l; i++) {
		var object = {
			'title': sortedArray[i][0],
			'folder': sortedArray[i][1],
			'url': sortedArray[i][2]
		};
		bookies.push(object);
	}
	
	// 2. FOLDERS

	folders.sort();
	
	console.log('Bookmarker -> bookies and folders ordered by name'); 

}

function appendContent() {

	// 1. BOOKIES

	// Empty the bookies section before appending bookies
	UI.bookies.innerHTML = '';

	// Create bookies.
	for(let i = 0, l = bookies.length; i < l; i++) {

		let bookieElm = document.createElement('a');
		bookieElm.setAttribute('href', bookies[i].url);
		bookieElm.id = bookies[i].title;
		// Set the class manually because there are sometimes spaces inside the folder name
		bookieElm.setAttribute('class', bookies[i].folder);
		bookieElm.classList.add('bookie', 'visible');
		bookieElm.textContent = bookies[i].title;
		UI.bookies.appendChild(bookieElm);				

	}

	updateCounter(bookies.length);

	// 2. FOLDERS

	// Empty the select input before appending folders	
	UI.folderSelect.innerHTML = '';
	UI.folderSelect.innerHTML = '<option selected>Tout montrer</option>';

	for(let i = 0, l = folders.length; i < l; i++) {	
	
		let optionElm = document.createElement('option');
		optionElm.textContent = folders[i];
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

	counter = value;
	let countMess = counter > 1 ? value + ' bookies' : value + ' bookie';
	UI.counter.textContent = countMess;
	UI.info.textContent = counter > 0 ? 
		'Sélectionnez un bookie ou pressez la touche Entrée pour ouvrir ' + countMess + '.': 
		'Aucun résultat. Pressez la touche Entrée ou sélectionnez un moteur pour rechercher sur le web.';

}

function createForm () {

	UI.sets.innerHTML = '';

	for(let i = 0, l = user.settings.folder.length; i < l; i++) {
	
		// Create one set by folder.
		let setElm = document.createElement('div');
		setElm.classList.add('set');

		// With a title.
		let titleElm = document.createElement('h4');
		titleElm.textContent = user.settings.folder[i];
		titleElm.style.color = '#' + user.settings.font[i]; 
		titleElm.style.backgroundColor = '#' + user.settings.background[i];
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
			inputElm.value = user.settings[field][i];
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