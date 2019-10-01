var counter = 0;
var bookies = [];
var folders = [];
var settings;

function analyzeContent (element, folder = 'Barre personnelle') {
	
	// The element have an URL : it's a bookie
	if(element.url) {
		element.folder = folder;
		bookies.push(element);
	}

	// The element doesn't have an URL : it's a folder
	else {
		folders.push(element.title);
	}

	// Does the element have a child ?
	if(element.children) {
		for(children of element.children) {
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
		}
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
		})
	})

}

function reviewSettings() {

	// Check if local setting are sufficiently defined by adding missing folders
	return new Promise((resolve, reject) => {
		
		browser.storage.local.get().then((loadedSettings) => { 
			
			let found = false;
			
			// Browse CURRENT folders
			for(let folder of folders) {			
				found = false;
				
				// Browse STORED folders to compare
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
				}

			}
			
			return loadedSettings;

		// Then update the local setting
		}).then((loadedSettings) => {

			settings = loadedSettings;

			browser.storage.local.set(settings).then(() => {
				resolve('Bookmarker -> local settings reviewed');
			})

		})
	
	}).then((res) => {	
		/* FOR DEBUGGING ONLY
		console.log(res);
		*/
	})

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

	// Create an exit variable.
	var filteredBkElms; 
	folder === 'Tout montrer' ?
		// If 'folder' is 'Tout montrer' : 'filteredBkElms' equals 'completeBkElms'	
		filteredBkElms = completeBkElms :
		// Else, 'filteredBkElms' contains all the corresponding bookies regarding of the name of the class
		filteredBkElms = document.getElementsByClassName(folder);

	// Set the class'invisible' to all the bookies
	for(let bookie of completeBkElms) {
		bookie.classList.remove('visible');
		bookie.classList.add('invisible');
	}

	// Reset the bookies counter
	updateCounter();

	// Then remove the class 'invisible' on the matches and update the bookies counter
	for(let bookie of filteredBkElms) {
		if(bookie['id'].toLowerCase().indexOf(input.toLowerCase()) >= 0) {
			bookie.classList.remove('invisible');
			bookie.classList.add('visible');
			updateCounter(++counter); 
		}
	
	}

}

function updateCounter (value = 0) {

	// Update the number of bookies there are matching the user's selection
	let word;
	counter = value;
	value > 1 ?
		word = 'bookies' :
		word = 'bookie';
	document.getElementById('bookies-counter').textContent = counter + ' ' + word;

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
		!browser.tabs.create({ url: baseUrl + search });

	}

	// Engine not sent : open all the visible bookies
	else {

		let activeBkElms = document.getElementsByClassName('visible');
		
		for(let activeBkElm of activeBkElms) {
			browser.tabs.create({url: activeBkElm.href });
		}

	}

	// Reset the user's selection
	document.getElementById('select-input').children[0].selected = 'selected';
	filterContent('', 'Tout montrer');
	let searchInpElm = document.getElementById('search-input');
	searchInpElm.value = '';
	searchInpElm.focus();

}

function createForm () {

	// Target the sets container
	let setsElm = document.getElementById('sets');

	for(let i = 0, l = settings.folder.length; i < l; i++) {
	
		// Create one set by folder
		let setElm = document.createElement('div');
		setElm.classList.add('set');

		// With a title
		let titleElm = document.createElement('h3');
		titleElm.textContent = settings.folder[i];
		titleElm.style.color = '#' + settings.font[i]; 
		titleElm.style.backgroundColor = '#' + settings.background[i];
		setElm.appendChild(titleElm);

		// And two text fields where the colors could be previewed
		for(let field of ['font', 'background']) {
			
			let labelElm = document.createElement('label');
			field === 'font' ?
				labelElm.textContent = 'Police' :
				labelElm.textContent = 'Fond';
	
			let hashtagElm = document.createElement('span');
			hashtagElm.textContent = '#';

			let inputElm = document.createElement('input');
			inputElm.setAttribute('type', 'text');
			inputElm.setAttribute('required', true);
			inputElm.classList.add(field, 'field');
			inputElm.value = settings[field][i];
			inputElm.setAttribute('pattern', '[0-9a-fA-F]{6}');
			inputElm.oninput = (e) => {
				let targetElm = e.target.parentNode.querySelector('h3');
				field === 'font' ?
					targetElm.style.color = '#' + e.target.value :
					targetElm.style.backgroundColor = '#' + e.target.value;
				e.target.value = e.target.value.toUpperCase();
			}
			
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
		newSettings.folder.push(sFolder.querySelector('h3').textContent);
		newSettings.font.push(sFolder.querySelector('.font').value);
		newSettings.background.push(sFolder.querySelector('.background').value);
	}
	
	// Overwrite settings
	settings = newSettings; 
	
	// Update the settings into the local storage then actualize the display
	browser.storage.local.set(settings).then(() => { 
		/* FOR DEBUGGING ONLY
		console.log('Bookmarker -> local settings updated'); 
		*/
		applySettings(settings);
		toggleSettingsForm();
	});
	
}

function toggleSettingsForm () {
	// Hide / unhide the settings form 
	document.getElementById('about-section').classList.toggle("opened");
}

function attachEvents () {
	
	// Search matches among the bookies
	document.getElementById('search-input').oninput = (e) => {
		filterContent(e.target.value, document.getElementById('select-input').value); 
	};
	
	// Show only the bookies from the selected folder
	document.getElementById('select-form').onchange = (e) => {
		filterContent(document.getElementById('search-input').value, e.target.value);
	};
	
	// Submit a search query to the selected engine
	let engineElms = document.getElementsByClassName('engine');
	for(let engine of engineElms) {
		engine.onclick = (e) => {
			submitQuery(document.getElementById('search-input').value, e.target.id);
			e.preventDefault();
		};
	}
	// Or open the visible bookies in new tabs
	document.getElementById('search-form').onsubmit = (e) => {
		submitQuery(document.getElementById('search-input').value);
		e.preventDefault();
	};
	
	// Open the about section by clicking the button
	document.getElementById('open-about-button').onclick = () => {
		toggleSettingsForm();
	};
	
	// Close the about section by clicking the link
	document.getElementById('close-about-a').onclick = (e) => {
		e.preventDefault();
		toggleSettingsForm();
	};
	
	// Update new settings after submitting the form
	document.getElementById('settings-form').onsubmit = (e) => {
		e.preventDefault();
		updateSettings();
	};

}