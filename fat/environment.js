const UI = {
	bookies: document.getElementById('bookies'),
	counter: document.getElementById('counter'),
	engines: document.getElementsByClassName('engine'),
	folderForm: document.getElementById('folder-form'),
	folderSelect: document.getElementById('folder-select'),
	info: document.getElementById('info'),
	searchForm: document.getElementById('search-form'),
	searchInput: document.getElementById('search-input'),
	settings: document.getElementById('settings'),
	sets: document.getElementById('sets')
};

var datas = {
	bookies: [],
	counter: 0,
	folders: [],
	foldersIndex: -1,
	settings: []
};

