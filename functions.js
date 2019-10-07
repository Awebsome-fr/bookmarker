// jshint esversion: 6
var counter = 0, bookies = [], folders = [], settings;

function analyzeContent (element, folder = 'Barre personnelle') {
	
	element.url ?
		// The element have an URL : it's a bookie
		[element.folder = folder, bookies.push(element)]:
		// The element doesn't have an URL : it's a folder
		[folders.push(element.title)];

	// Does the element have a child ?
	if(element.children) {
		for(let children of element.children) {
			analyzeContent(children, element.title);
		}
	}

	/* FOR DEBUGGING ONLY
	console.log('Bookmarker -> bookies and folders isolated'); 
	*/
	
}

function sortContent() {
	
	// 1. BOOKIES
	
	var sortedArray = []; // Array for temporary storage
	// a. Convert each object as an array
	for(let bookie of bookies) {
		let currentBookie = [bookie.title, bookie.folder, bookie.url];	
		// Then store it into another array
		sortedArray.push(currentBookie);
	}
	// b. Sort the new array
	sortedArray.sort();
	// c. Empty the initial array
	bookies = [];
	// d. Then recreate it
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
	
	/* FOR DEBUGGING ONLY
	console.log('Bookmarker -> bookies and folders ordered by name'); 
	*/

}

function checkSettings() {

	// Check if local setting are already defined
	return new Promise((resolve, reject) => {
		browser.storage.local.get(null).then((settings) => {
			settings.folder ?
				resolve('Bookmarker -> local settings found'):
				reject('Bookmarker -> local settings not found');
		});
	})

	// Success : do nothing
	.then((res) => {

		/* FOR DEBUGGING ONLY
		console.log(res);
		*/

	})
	// Fail : create starting settings
	.catch((rej) => {

		/* FOR DEBUGGING ONLY
		console.log(rej);
		*/

		browser.storage.local.set(
			{
				folder: [],
				background : [],
				font: [] 
			}
		)
		.then(() => { 

			/* FOR DEBUGGING ONLY
			console.log('Bookmarker -> local settings created'); 
			*/

		});
	});

}

function reviewSettings() {

	return new Promise((resolve, reject) => {
		
		browser.storage.local.get().then((loadedSettings) => { 
			
			// First : check if local setting are sufficiently defined by adding missing folders
			let found;
			
			// Browse CURRENT folders
			for(let folder of folders) {			
				
				found = false;

				// Browse STORED folders
				for(let savedFolder of loadedSettings.folder) {
					// Found : set 'found' to true and break the loop
					if(savedFolder === folder) {
						found = true;
						break;
					}
				}	
				
				// Missing ('found' is always false) : complete statement needed
				if(!found) {
					
					loadedSettings.folder.push(folder);
					loadedSettings.background.push('555555');
					loadedSettings.font.push('FFFFFF');
					
					/* FOR DEBUGGING ONLY
					console.log('Bookmarker -> the missing settings for the folder "' + folder + '" were created');
					*/
				
				}

			}

			// Second : check if there are some unnecessary folders to remove 
			let active;
			let indexesToRemove = [];

			// Browse STORED folders
			for(let savedFolder of loadedSettings.folder) {

				active = false;

				// Browse CURRENT folders
				for(let folder of folders) {

					// Found : set 'active' to true and break the loop
					if(folder === savedFolder) {
						active = true;
						break;
					}

				}

				// Not found ('active' is always false) : it is an unnecessary folder to remove
				if(!active) {

					indexesToRemove.push(loadedSettings.folder.indexOf(savedFolder));		

					/* FOR DEBUGGING ONLY
					console.log('Bookmarker -> Useless settings for the folder "' + savedFolder + '" found');
					*/
					
				}

			}

			// Third : remove unnecessary folders 
			let compArray = 0;

			for(let indexToRemove of indexesToRemove) {

				loadedSettings.folder.splice(indexToRemove + compArray, 1);
				loadedSettings.background.splice(indexToRemove + compArray, 1);
				loadedSettings.font.splice(indexToRemove + compArray, 1);

				/* FOR DEBUGGING ONLY
				console.log('Bookmarker -> Useless settings for the folder "' + loadedSettings.folder[indexToRemove + compArray] + '" were deleted');
				*/

				compArray--;

			}

			return loadedSettings;

		// Then update the local setting
		}).then((loadedSettings) => {

			settings = loadedSettings;

			browser.storage.local.set(settings).then(() => {
				resolve('Bookmarker -> local settings reviewed');
			});

		});
	
	}).then((res) => {	
	
		/* FOR DEBUGGING ONLY
		console.log(res);
		*/
	
	});

}

function applySettings() {
	
	// Applied defined styles to the bookies
	for(let i = 0, l = settings.folder.length; i < l; i++) {
		let bookies = document.getElementsByClassName(settings.folder[i]);
		for(let bookie of bookies) {
			bookie.style.color = '#' + settings.font[i];
			bookie.style.backgroundColor = '#' + settings.background[i];
		}	
	}
	
	/* FOR DEBUGGING ONLY
	console.log('Bookmarker -> local settings applied')
	*/

}

function appendContent() {

	// 1. BOOKIES

	// Empty the bookies section before appending bookies
	let sectionElm = document.getElementById('bookies-section');
	sectionElm.innerHTML = '';
	for(let bookie of bookies) {
		let crBookieElm = document.createElement('a');
		crBookieElm.setAttribute('href', bookie.url);
		crBookieElm.id = bookie.title;
		// Set the class manually because there are sometimes spaces inside the folder name
		crBookieElm.setAttribute('class', bookie.folder);
		crBookieElm.classList.add('bookie', 'visible');
		crBookieElm.textContent = bookie.title;
		sectionElm.appendChild(crBookieElm);				
	}

	// Update the bookies counter
	updateCounter(bookies.length);

	// 2. FOLDERS

	// Empty the select input before appending folders	
	let selectInpElm = document.getElementById('select-input');
	selectInpElm.innerHTML = '';
	selectInpElm.innerHTML = '<option selected>Tout montrer</option>';
	for(let folder of folders) {		
		let optionElm = document.createElement('option');
		optionElm.textContent = folder;
		selectInpElm.appendChild(optionElm);
	}

}

function filterContent (input, folder) {

	// Target all the bookies.
	var completeBkElms = document.getElementsByClassName('bookie');

	/* 
	Create an exit variable
	If 'folder' is 'Tout montrer' : 'filteredBkElms' equals 'completeBkElms'
	Else, 'filteredBkElms' contains all the corresponding bookies regarding of the name of the class
	*/
	var filteredBkElms = folder === 'Tout montrer' ? completeBkElms : document.getElementsByClassName(folder);

	// Set the class'invisible' to all the bookies
	for(let bookie of completeBkElms) {
		bookie.classList.remove('visible');
		bookie.classList.add('invisible');
	}

	// Reset the bookies counter
	updateCounter();

	// Then remove the class 'invisible' on the matches and update the bookies counter
	for(let bookie of filteredBkElms) {
		if(bookie.id.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
			bookie.classList.remove('invisible');
			bookie.classList.add('visible');
			updateCounter(++counter); 
		}
	
	}

}

function updateCounter (value = 0) {

	// On the inferface, update the number of bookies there are matching the user's selection
	counter = value;
	let countMess = counter > 1 ? value + ' bookies' : value + ' bookie';
	document.getElementById('bookies-counter').textContent = countMess;
	document.getElementById('pop-info').textContent = counter > 0 ? 
		'Sélectionnez un bookie ou pressez la touche Entrée pour ouvrir ' + countMess + '.': 
		'Aucun résultat. Pressez la touche Entrée ou sélectionnez un moteur pour rechercher sur le web.';

}

function submitQuery (search, engine) {

	// Engine sent : use this one
	if(engine) {

		// State baseUrl and determinate the initial path
		let baseUrl;
		switch(engine) {
			case 'qwant-engine':
				baseUrl = 'https://www.qwant.com/?q=';
				break;
			case 'google-engine':
				baseUrl = 'https://www.google.fr/search?q=';
				break;
			case 'lilo-engine':
				baseUrl = 'https://search.lilo.org/results.php?q=';
				break;
		}

		// Open the search results into a new tab 
		browser.tabs.create({ url: baseUrl + search });

	}

	// Engine not sent AND there are active bookies : open all the visible bookies
	else if(!engine && counter > 0) {

		let activeBkElms = document.getElementsByClassName('visible');
		
		for(let activeBkElm of activeBkElms) {
			browser.tabs.create({url: activeBkElm.href });
		}

	}

	// Engine not sent AND there are NO active bookies : open the search results into a new tab with recursive 
	else {

		submitQuery(search, 'qwant-engine');

	}

	resetSelection();

}

function createForm () {

	// Target the sets container
	let setsElm = document.getElementById('sets');

	for(let i = 0, l = settings.folder.length; i < l; i++) {
	
		// Create one set by folder
		let setElm = document.createElement('div');
		setElm.classList.add('set');

		// With a title
		let titleElm = document.createElement('h4');
		titleElm.textContent = settings.folder[i];
		titleElm.style.color = '#' + settings.font[i]; 
		titleElm.style.backgroundColor = '#' + settings.background[i];
		setElm.appendChild(titleElm);

		// And two text fields where the colors could be previewed
		for(let field of ['font', 'background']) {
			
			let labelElm = document.createElement('label');
			labelElm.textContent = field === 'font' ? 'Police' : 'Fond';
	
			let hashtagElm = document.createElement('span');
			hashtagElm.textContent = '#';

			let inputElm = document.createElement('input');
			inputElm.setAttribute('type', 'text');
			inputElm.setAttribute('required', true);
			inputElm.classList.add(field, 'field');
			inputElm.value = settings[field][i];
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
	
		// Then append the result to the container	
		setsElm.appendChild(setElm);

	}

}

function updateSettings() {

	// Create an empty object to receive the new datas
	let newSettings =
		{
			folder: [],
			background : [],
			font: [] 
		};
		
	// Target all the sets from the setting form then add their values to newSetting
	let sFolders = document.getElementsByClassName('set');
	for(let sFolder of sFolders) {
		newSettings.folder.push(sFolder.querySelector('h4').textContent);
		newSettings.font.push(sFolder.querySelector('.font').value);
		newSettings.background.push(sFolder.querySelector('.background').value);
	}
	
	// Overwrite settings
	settings = newSettings; 
	
	// Update the settings into the local storage then actualize the display
	browser.storage.local.set(settings).then(() => { 
		
		applySettings(settings);
		
		/* FOR DEBUGGING ONLY
		console.log('Bookmarker -> local settings updated'); 
		*/
		
	});
	
}

function toggleSettingsForm () {

	// Hide / unhide the settings form 
	document.getElementById('about-section').classList.toggle("opened");

}

function resetSelection() {

	// Reset the user's selection
	document.getElementById('select-input').children[0].selected = 'selected';
	filterContent('', 'Tout montrer');
	let searchInpElm = document.getElementById('search-input');
	searchInpElm.value = '';
	searchInpElm.focus();

}