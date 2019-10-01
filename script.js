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
			attachEvents();
		})
	})
})