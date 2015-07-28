$(function() {
	'use strict';
	// Keep track of last used ID
	// TODO: Generate unique ID for posts or let server side handle this
	var lastId = 3426,
	// Set current user to empty user
	currentUser = '',
	REPLY_BUTTON_CLASS = 'reply-button';

	/**
	 * Grab discussions data from the local json file
	 * @param {string} source the path of json file to load
	 * @parm {Function} callback function to call when data is loaded
	 */
	function loadTopics(source, callback) {
		$.getJSON(source,function(result){
			callback(result.topics);
		});
	}

	/**
	 * Loop over topics and display the nested comments for each topic on the index page
	 * @param {Array.<Object>} topics an array of topics to display
	 */
	function displayTopics(topics) {
		$.each(topics, function(i, topic){
			var topicEl, titleEl, responses;
			// Create a discussion division to add the topic and responses to it
			topicEl = $('<div/>', {
		    class: 'topic-container'
			});
			// Title of the topic
			titleEl = $('<div class="topic-title">' + topic.topictitle + '</div>');
			// Loop over responses of each topic and give them a class accoarding to their depth
			// to help style the response to visualize the nesting of comments
			responses = topic.responses;

			topicEl.append(titleEl);
			$.each(responses, function(j, response) {
				var responseEl = createResponseEl(response);
				topicEl.append(responseEl);
			});

			$('.container').append(topicEl);
		});
	}

	/**
	 * Add a reply for a specific user posting
	 * @param {Event} event fired by the clicked button
	 */
	function addReply(event) {
		// TODO: Display replies in the correct order, from oldest to newest
		// It's currently showing newest replies first
		var replyButton, parentId, id, age, depth, author,
											textId, content, response, responseEl;
		replyButton = event.target;
		// TODO: Throw error if reply textarea is empty, or activate reply button only if there's text
		parentId = replyButton.id;
		id = ++lastId;
		// Set age to 1 second
		// TODO: Get time at reply time, then calculate age when sending reply back to server
		age = secondsToHMS(1);
		depth = $(replyButton).data('depth') + 1;
		//TODO: Write a function to check current user and if they're authenticated
		author = currentUser || "Anonymous";
		textId = '#replytxt-'+ parentId;

		content = $(textId).val();

		$(textId).val('');

		response = {
			id: id,
			parentid: parentId,
			age: age,
			depth: depth,
			posttext: '<p>' + content + '</p>',
			author: author
		};

		responseEl = createResponseEl(response);
		responseEl.insertAfter($('#replyto-' + parentId));
	}
	/**
	 * Construct response HTML element from the response object
	 * @param {Object} response a user's response to another user's response
	 * or to a certain topic
	 */
	function createResponseEl(response) {
		var id, parentId, depth, age, author, content, responseEl;

		id = response.id;
		parentId = response.parentid;
		depth = response.depth;
		age =  secondsToHMS(response.age);
		author = response.author;
		content = response.posttext;

		// Create a response div with it's is set to the id number retrieved,
		// and setting a data attribute to hold the parent id.
		// Also add author and timestamp
		// TODO: Use templates to have a clean HTML
		responseEl = $(
			'<div class="response-container depth-'+ depth + '"'+
				' id=response-' + id +
				' data-parent-id= "' + parentId +
			'">'+
				'<div class="author">' + author +
					'<span class="date-stamp">' + age + '</span>' +
				'</div>' +
				content +
			'</div>'+
			'<div class="replyto '+' depth-' + depth + '"' +
			' id="replyto-'+ id + '">' +
				'<textarea id="replytxt-'+ id +'" class="replytext"'+
					'" name="replytext" ' +
					'placeholder="Click here to reply to '+ author +'. Be nice!">' +
				'</textarea>' +
				'<button class="reply-button" id="'+ id +'" data-depth='+ depth +'> Reply</button>' +
			'</div>'
		);
		return responseEl;
	}

	/**
	 * Used to convert age which is in seconds to a text timestamp
	 * TODO: Look for a jQuery plugin to calculate this
	 * @param {number} seconds represents the age of certain response,
	 * indicating how long ago it was posted
	 */
	function secondsToHMS(seconds) {
		var d, h, m, s, timestampTxt;

		d = Math.floor(seconds / 60 / 60 / 24);
		h = Math.floor(seconds / 60 / 60) % 24;
		m = Math.floor(seconds / 60) % 60;
		s = seconds % 60;
		timestampTxt = "";

		if(d) {
			timestampTxt += d + " days ago";
		}
		else if(h) {
			timestampTxt += h + " hours ago";
		}
		else if(m) {
			timestampTxt += m + " minutes ago";
		}
		else if(s) {
			timestampTxt += "less than a minute ago";
		}
		return timestampTxt;
	}

	/**
	 * General click handler to handle all click events on the container,
	 * and filters what we want to handle
	 * @param {Event} event
	 */
	function handleClick(event) {
		var target = event.target;
		if( $(target).hasClass(REPLY_BUTTON_CLASS)) {
			addReply(event);
		}
	}
	// For performance reasons instead of adding a click event on each reply button
	// we catch the click on the container and filter the clicks on the buttons for our use
	$('.container').click(handleClick);

	loadTopics('discussion.json', displayTopics);

});
