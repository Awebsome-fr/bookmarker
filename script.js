// Load the bookies tree, analyse its structure and order its content.
browser.bookmarks.getSubTree('toolbar_____').then((bookies) => {

	analyzeContent(bookies[0]); 
	sortContent();

}).then(() => { 

	// Then check if local settings exist (otherwise, create it).
	checkSettings().then(() => { 

		// Then review and correct the local settings by adding the missing folders.
		reviewSettings().then(() => {
			
			// Then attach the events.
			UI.searchInput.oninput = () => {
				filterContent(UI.searchInput.value, UI.folderSelect.value); 
			};	
			UI.folderForm.onchange = () => {
				filterContent(UI.searchInput.value, UI.folderSelect.value);
			};
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
			// Or open the visible bookies in new tabs.
			UI.searchForm.onsubmit = (e) => {
				submitQuery(UI.searchInput.value);
				e.preventDefault();
			};
			document.getElementById('open-settings').onclick = () => {
				toggleSettings();
			};
			document.getElementById('save-settings').onclick = () => {
				toggleSettings();
				updateSettings();
			};
			document.getElementById('close-settings').onclick = () => {
				toggleSettings();
			};
			
			// And start.
			appendContent();
			createForm();
			applySettings();

		});
	
	});

});