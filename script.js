// Load the bookies tree, analyse its structure and order its content.
browser.bookmarks.getSubTree('toolbar_____').then((bookies) => {

	analyzeContent(bookies[0]); 

}).then(() => { 

	// Then check if local settings exist (otherwise, create it).
	checkSettings().then(() => { 

		// Then review and correct the local settings by adding the missing folders, attach the events and start.
		reviewSettings().then(() => {
			
			// Search matches (searchInput) in the specific folder (folderSelect).
			UI.searchInput.oninput = () => {
				filterContent(UI.searchInput.value, UI.folderSelect.value); 
			};
			// Limit visibility to a specific folder (folderSelect).
			UI.folderForm.onchange = () => {
				filterContent(UI.searchInput.value, UI.folderSelect.value);
			};
			// Reset the current search selection.
			document.getElementById('reset').onclick = () => {
				resetSelection();
			};
			// Submit a search query to the selected engine.
			for(let i = 0, l = UI.engines.length; i < l; i++) {
				UI.engines[i].onclick = (e) => {
					submitQuery(UI.searchInput.value, e.target.id);
					e.preventDefault();
				};
			}
			// Or open the visible bookie(s) in new tab(s).
			UI.searchForm.onsubmit = (e) => {
				submitQuery(UI.searchInput.value);
				e.preventDefault();
			};

			// Open settings.
			document.getElementById('open-settings').onclick = () => {
				toggleSettings();
			};
			// Close and save the settings.
			document.getElementById('save-settings').onclick = () => {
				toggleSettings();
				updateSettings();
			};
			// Close settings without saving.
			document.getElementById('close-settings').onclick = () => {
				toggleSettings();
			};
			
			start();

		});
	
	});

});