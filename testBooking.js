// Mimics how we may handle bookings from the Scheduling form
// First we create an anonymous account and then we push the users data

var databaseRef = firebase.database();

var usersRef = databaseRef.ref('users/');
var meetingsRef = databaseRef.ref('meetings/');
var agentsRef = databaseRef.ref('agents/public');

// Create an anonymous user account
$('#auth').on('click', function(e) {
	e.preventDefault();
	signInAnonymously();
});

// Each booking request can have multiple meetings 
// A booking request corresponds to one complete process throught the schedule form
// First we push the users info to the unique user id node
// Update the main meeting node with the new meetings
// For each agent update their meeting node with the meeting id
// Update the users booking_requests with the new booking request and store the meetings ids in that node
// this is what firebase calls denormalizing data
$('#submit-booking').on('click', function(e) {
	e.preventDefault();
	
	var user = firebase.auth().currentUser;
	var userRef = usersRef.child(user.uid);

	var firstName = 'Penne';
	var lastName = 'Pasta';
	var phoneNumber = '514 667 323';
	var email = 'penneemail@gmail.com'
	
	var date = '2016-05-30';
	var representation = 'Broker';
	var location = 'My house';
	
	var agentID = 'test_agent_id';
	
	updateUser(userRef, firstName, lastName, phoneNumber, email);
	
	var bookingID = createBookingRequest(userRef);
																			 
	//for each meeting (right now I just make one as I have dummy data)
		var meetingID = createMeeting(date, representation, location, user.uid, agentID, bookingID);
		updateBookingRequest(userRef, bookingID, meetingID);
		updateAgentsMeetings(agentsRef.child(agentID), meetingID);
	
});

function signInAnonymously() {
	firebase.auth().signInAnonymously().catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorCode, errorMessage);
	});
}

function updateUser(userRef, firstName, lastName, phoneNumber, email) {	
	userRef.update({
		first_name: firstName,
		last_name: lastName,
		phone_number: phoneNumber,
		email: email
	});
}

function createMeeting(date, representation, location, userID, agentID, bookingID) {
	var meetingID = meetingsRef.push({
		date: date,
		representation: representation,
		location: location,
		user_id: userID,
		agent_id: agentID,
		booking_id: bookingID
	}).key;
	
	return meetingID
}

function createBookingRequest(userRef) {
	var bookingID = userRef.child('booking_requests').push().key;
	return bookingID;
}

function updateBookingRequest(userRef, bookingID, meetingID) {
	var meeting = {}; 
	meeting[meetingID] = true;
	userRef.child('booking_requests').child(bookingID).update(meeting);
}

function updateAgentsMeetings(agentRef, meetingID) {
	var meeting = {};
	meeting[meetingID] = true;
	agentRef.child('meetings').update(meeting);
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
