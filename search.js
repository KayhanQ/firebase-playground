var databaseRef = firebase.database();

var usersRef = databaseRef.ref('users/');
var meetingsRef = databaseRef.ref('meetings/');
var agentsPublicRef = databaseRef.ref('agents/public');
var searchRef = databaseRef.ref('search/');

var storage = firebase.storage();
var storageRef = storage.ref();
var agentsStorageRef = storageRef.child('images/agents');

var searchTerms = [];
var matchWholeWords = true;
var agentsData;


populateAgents();

function populateAgents() {
	agentsPublicRef.once('value').then(function(snapshot) {
			console.log('populating');

			agentsData = snapshot.val();
			createAgents(snapshot.val());
	});
}

// Create the agents thumbnails 
function createAgents(agentsData) {
	console.log(agentsData);
	console.log("creating Agent");
	
	$.each(agentsData, function (key, value) {
		
		var container = $('<div>').attr({
			class: 'col-sm-6 col-md-3',
			id: key
		});
		
		var thumbnail = $('<div>').attr({
			class: 'thumbnail'
		});
		
		var img = $('<img>').attr({
			src: 'http://placehold.it/200',
			id: key + '-profile'
		});
		putProfilePicture(key);

		var caption = $('<div>').attr({
			class: 'caption'
		});
		
		var name = $('<h3>').text(this.name.display);
		var designation = $('<h4>').text(this.designation);
		var brokerage = $('<h4>').text(this.brokerage);

		caption.append(name);
		caption.append(designation);
		caption.append(brokerage);

		thumbnail.append(img);
		thumbnail.append(caption);
		
		container.append(thumbnail);
		
		$('#agent-results').append(container);
	});
}

// Get the profile picture of an agent and add it to the thumbnail
function putProfilePicture(userUID) {
	var profilePicRef = agentsStorageRef.child(userUID + '/profile.jpg');
	
	profilePicRef.getDownloadURL().then(function(url) {		
		$('#' + userUID + '-profile').attr({
			src: url
		});
	}).catch(function(error) {
		console.log(error);
		switch (error.code) {
			case 'storage/object_not_found':
				break;
			case 'storage/unauthorized':
				break;
			case 'storage/canceled':
				break;
			case 'storage/unknown':
				break;
		}
	});
}

// Display the search term as a tag
function createTag(text) {
	var table = $('<table></table>');
	var tag = $('<button>').attr({
		type: 'button',		
		class: 'btn btn-info'
		}).text(text);
	
	tag.on('click', function(e) {
		var i = searchTerms.indexOf($(this).text());
		if(i != -1) {
			searchTerms.splice(i, 1);
		}
		
		this.remove();
	});
	
	return tag;
}

// Submit search
$('#search-form').on('submit',function(e){
 	e.preventDefault();
	console.log('submit');
	
	var searchbar = $('#search-bar');
	var searchTerm = searchbar.val();
	searchbar.val('');
	
	searchTerms.push(searchTerm);
	
	console.log(searchTerms);
	console.log(searchTerm);

	var tagsDiv = $('#tags');
	tagsDiv.append(createTag(searchTerm));
	
	doSearch('firebase', 'user', buildQuery(searchTerms.join(' ')));	
});

// Start search
function doSearch(index, type, query) {
	var key = searchRef.child('request').push({ index: index, type: type, query: query }).key;
	console.log('search', key, { index: index, type: type, query: query });
	console.log('results');
	searchRef.child('response/'+key).on('value', showResults);
}

// We can build any elastic search query
function buildQuery(term) {
	return {
				"match": {
					"_all": {
						"query": term,
						"fuzziness": "AUTO",
						"prefix_length" : 3,
            "max_expansions": 50,
						"boost": 1
					}
				}
//				"match": {
//					"brokerage": {
//						"query": term,
//						"fuzziness": "AUTO",
//						"prefix_length" : 3,
//            "max_expansions": 50,
//						"boost": 1
//						
//					}
//				
//				}

//		"query_string" : {
//        "fields" : ["profile.*"],
//        "query" : term+"~1",
//				"fuzzy_max_expansions": 50,
//				"fuzziness": "AUTO",
//				"fuzzy_prefix_length" : 3,
//
//        "use_dis_max" : true
//    }
		
		
		};
}

function makeTerm(term, matchWholeWords) {
	if( !matchWholeWords ) {
		 if( !term.match(/^\*/) ) { term = '*'+term; }
		 if( !term.match(/\*$/) ) { term += '*'; }
	}
	return term;
}

// Once we get the query result reorder the agents list
function showResults(snap) {
	if( snap.val() === null ) { return; } // wait until we get data
	var dat = snap.val();
	console.log(snap.val());
	reorderAgents(snap.val());
	
	snap.ref.off('value', showResults);
	snap.ref.remove();
	var $pair = $('#results')
		 .text(JSON.stringify(dat, null, 2))
		 .add( $('#total').text(dat.total) )
		 .removeClass('error zero');
	if( dat.error ) {
		 $pair.addClass('error');
	}
	else if( dat.total < 1 ) {
		 $pair.addClass('zero');
	}
}

// Reorder list of agents according to search result
function reorderAgents(results) {
	var list = [];
	
	if (results.total == 0) return;
	
	console.log('reordering');
	
	$.each(results.hits, function (key, value) {
		list.push(value._id);
	});

	$.each(agentsData, function (key, value) {
		if (list.indexOf(key) == -1) list.push(key);
	});
	
	$.each(list, function(key, value) {
		console.log('prepending');
		var div = $('#'+value);
		$('#agent-results').append(div);
	});

	console.log(list);
}


// Test a query
$('#test-es').on('click',function(e){
 	e.preventDefault();
	console.log("testing elastic search");
	doSearch('firebase', 'user', buildQuery('kay*', ''));
});
