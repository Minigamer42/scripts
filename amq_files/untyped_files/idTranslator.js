'use strict';
/*exported idTranslator*/

function IdTranslator () {
	this.tagNames = {};
	this.genreNames = {};
}

IdTranslator.prototype.setup = function(genresInfo, tagsInfo) {
	tagsInfo.forEach((tagInfo) => {
		this.tagNames[tagInfo.id] = tagInfo.name;
	});
	genresInfo.forEach((genreInfo) => {
		this.genreNames[genreInfo.id] = genreInfo.name;
	});
};

var idTranslator = new IdTranslator(); 