const UI = {
	bookies: document.getElementById('bookies-container'),
	counter: document.getElementById('counter'),
	engines: document.getElementsByClassName('engine'),
	folderForm: document.getElementById('folder-form'),
	folderSelect: document.getElementById('folder-select'),
	info: document.getElementById('info'),
	searchForm: document.getElementById('search-form'),
	searchInput: document.getElementById('search-input'),
	sets: document.getElementById('sets')
};

var user = {
	bookies: [],
	folders: [],
	settings: []
}

var counter = 0, foldersIndex = -1;

chrome.bookmarks.getSubTree(favRootFolderIndex,

	function(bookmarksTree) {
	
		buildDatas(bookmarksTree[0]);
		
		checkSettings()

			.then((settings) => settings) // Settings found in the local storage of the navigator ? Do nothing.
			
			.catch(() => initSettings()) // Settings not found ? Initialize them. 
			
			.then((settings) => reviewSettings(settings)
				
				.then((settings) => updateSettings(settings)
				
					.then(() => {

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

							updateSettings(newSettings);
							applySettings();
							toggleSettings();
						};
						// Close settings without saving.
						document.getElementById('close-settings').onclick = () => {
							toggleSettings();
						};

						start();

					}

				)

			)

		);

	}

);