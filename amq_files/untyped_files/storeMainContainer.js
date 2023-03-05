'use strict';
/*exported StoreMainContainer*/

class StoreMainContainer {
	constructor($window) {
		this.$noSelectionContainer = $window.find('#swNoSelectionContainer');
		this.$mainContainer = $window.find('#swContentAvatarContainer');
		this.$ticketContainer = $window.find('#swContentTicketsContainer');

		this.$mainContainer.perfectScrollbar({
			suppressScrollX: true,
			wheelSpeed: 3.5
		});
		this.mainScrollListeners = [];
		this.$mainContainer.on('ps-scroll-y', (event) => {
			this.fireScrollEvent(event);
		});

		this.contentChangeListeners = [];

		this._$activeContainer = this.$noSelectionContainer;
	}

	get $activeContainer() {
		return this._$activeContainer;
	}

	set $activeContainer($newContainer) {
		if ($newContainer !== this._$activeContainer) {
			this.$activeContainer.addClass('hide');

			this._$activeContainer = $newContainer;
			this.$activeContainer.removeClass('hide');
		}
	}


	displayContent(contentList) {
		this.$mainContainer.find('.swMainContent').detach();
		for (let i = contentList.length - 1; i >= 0; i--) {
			this.$mainContainer.prepend(contentList[i].$content);
		}
		this.$activeContainer = this.$mainContainer;
		contentList.forEach(content => {
			content.updateTextSize();
		});

		this.updateScroll();
		this.fireContentChangeEvent();
	}

	appendMainContent(content) {
		this.$mainContainer.append(content.$content);
		content.updateTextSize();
		this.updateScroll();
	}

	displayTickets() {
		this.$activeContainer = this.$ticketContainer;
		this.fireContentChangeEvent();
	}

	clearSelection() {
		this.$activeContainer = this.$noSelectionContainer;
		this.fireContentChangeEvent();
	}

	addMainScrollListener(callback) {
		this.mainScrollListeners.push(callback);
	}

	addContentChangeListener(callback) {
		this.contentChangeListeners.push(callback);
	}

	updateScroll() {
		this.$mainContainer.perfectScrollbar('update');
		this.fireScrollEvent();
	}

	fireScrollEvent(event) {
		this.mainScrollListeners.forEach(callback => callback(event));
	}

	fireContentChangeEvent() {
		this.contentChangeListeners.forEach(callback => {
			callback();
		});
	}
}