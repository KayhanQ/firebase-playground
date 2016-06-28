var databaseRef = firebase.database();

var agentsPublicRef = databaseRef.ref('agents/public');
var agentsPrivateRef = databaseRef.ref('agents/private');
var searchRef = databaseRef.ref('search/');

var storage = firebase.storage();
var storageRef = storage.ref();
var agentsStorageRef = storageRef.child('images/agents');

$('#save-photo').on('click',function(e){
 	e.preventDefault();
	console.log("uploading photo");
	
	var user = firebase.auth().currentUser;

	var metadata = {
  	contentType: 'image/jpeg',
	};
	
	var file = document.getElementById('photo-upload').files[0];
	console.log(file);
	var uploadTask = agentsStorageRef.child(user.uid + "/profile.jpg").put(file, metadata);
	
	uploadTask.on('state_changed', function(snapshot){

	}, function(error) {
		console.log(error);
	}, function() {
		var downloadURL = uploadTask.snapshot.downloadURL;
		console.log(downloadURL);
	});
});

$('#create-account').on('click',function(e){
 	e.preventDefault();
	console.log("create account");
	
	var email = 'carl@gmaixsdlssdfsadf.com';
	var password = 'carlspword';
	
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorCode, errorMessage);
	});
});

$('#populate-account').on('click',function(e){
 	e.preventDefault();
	console.log("populate account");
	
	var user = firebase.auth().currentUser;
	console.log(user.uid);
		populatePrivate(user.uid);

	populateProfile(user.uid);
});

function populatePrivate(uid) {
	console.log('private');
	var email = 'somemail@fljf.com';
	var phone = '514 234 2343';
	var stripe_uid = 'xxxxxxxxxxxxx';
	var approved = true;

	agentsPrivateRef.child(uid).update({
		email: email,
		phone: phone,
		stripe_uid: stripe_uid,
		approved: approved
	});
}

function populateProfile(uid) {
	var bio = 'biosadf';
	var brokerage = 'asdfasdf';
	var designation = 'Sales Rep';
	var questionnaire = 'questions';
	
	agentsPublicRef.child(uid).update({
		bio: bio,
		brokerage: brokerage,
		designation: designation,
		questionnaire: questionnaire
	});
	
	var display = 'Carl Pilkington';
	var first = 'Carl';
	var last = 'Pilkington';
	
	agentsPublicRef.child(uid).child('name').update({
		display: display,
		first: first,
		last: last
	});	
}


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    console.log('User is signed with uid: ' + uid + ' is anonymous: ' + isAnonymous);
  } else {
    console.log('User is signed out.');
  }
});