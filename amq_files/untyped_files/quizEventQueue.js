"use strict";
/*exported QuizEventQueue*/

class QuizEventQueue {
	constructor(quiz) {
		this.quiz = quiz;

		this.queue = [];
		this.currentEvents = [];
		this.finishedEventCount = 0;
		this.running = false;
	}

	reset() {
		this.queue = [];
		this.currentEvents = [];
		this.finishedEventCount = 0;
		this.running = false;
	}

	addEvent(events, skipDelay) {
		if (events.length) {
			this.queue.push({ events, skipDelay });

			if (!this.running) {
				this.startQueue();
			}
		}
	}

	startQueue() {
		this.running = true;
		this.tickNextEvents();
	}

	tickNextEvents() {
		if (this.queue.length === 0) {
			this.running = false;
		} else {
			let { events, skipDelay } = this.queue.shift();

			//Prepend nested queue events, so they are executed before the later events
			let newQueueEvents = events.filter((event) => event.type === NEXUS_EVENTS.QUEUE_EVENT);
			for (let i = newQueueEvents.length - 1; i >= 0; i--) {
				this.queue.unshift({ events: newQueueEvents[i].events, skipDelay: newQueueEvents[i].skipDelay });
			}

			this.currentEvents = events.filter((event) => event.type !== NEXUS_EVENTS.QUEUE_EVENT);

			if (this.currentEvents.length) {
				let delay = skipDelay ? 0 : this.TICK_DELAY;
				setTimeout(() => {
					this.finishedEventCount = 0;
					this.currentEvents.forEach((event) => {
						this.quiz.handleNexusEvent(event, () => {
							this.finishedEventCount++;
							if (this.finishedEventCount >= this.currentEvents.length) {
								this.tickNextEvents();
							}
						});
					});
				}, delay);
			} else {
				this.tickNextEvents();
			}
		}
	}
}
QuizEventQueue.prototype.TICK_DELAY = 300; //ms
