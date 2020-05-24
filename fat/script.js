chrome.bookmarks.getTree(
	function(tree) {
	
		buildDatas(tree[0]);
	
		checkSettings().then((status) => {
	
			console.log(status);
	
			reviewSettings().then((status) => {
	
				console.log(status);

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

	}
);