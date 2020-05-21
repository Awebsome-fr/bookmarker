// jshint esversion: 6
// Load the bookies tree then analyse its structure and order its content by name 
browser.bookmarks.getSubTree('toolbar_____').then((bookies) => {
	analyzeContent(bookies[0]); 
	sortContent();
}).then(() => { 
	// Then check if local settings exist (otherwise, create it)
	checkSettings().then(() => { 
		// Then review and correct local settings by adding missing folders
		reviewSettings().then(() => {
			// Finally, call the necessary functions
			appendContent();
			createForm();
			applySettings();
			// And attach events
			// Search matches among the bookies
			document.getElementById('search-input').oninput = (e) => {
				filterContent(e.target.value, document.getElementById('select-input').value); 
			};	
			// Show only the bookies from the selected folder
			document.getElementById('select-form').onchange = (e) => {
				filterContent(document.getElementById('search-input').value, e.target.value);
			};
			// Reset the selection
			document.getElementById('reset-button').onclick = () => {
				resetSelection();
			};
			// Submit a search query to the selected engine
			let engineElms = document.getElementsByClassName('engine');
			for(let engineElm of engineElms) {
				engineElm.onclick = (e) => {
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

		});
	});
});