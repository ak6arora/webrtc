var localVideo;
var remoteVideo;
var peerConnection;
var socket;
var peerConnectionConfig = { 'iceServers': [{ 'url': 'stun:stun.services.mozilla.com' }, { 'url': 'stun:stun.l.google.com:19302' }] };
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function pageReady() {
    id=prompt("Enter ID");
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');
    socket = io.connect('http://localhost:3434');
    // serverConnection = new WebSocket('ws://127.0.0.1:3434');
    // serverConnection.onmessage = gotMessageFromServer;
    socket.on('connect',function(){
       socket.emit('login',id)
    })
    var constraints = {
        video: true,
        audio: true,
    };

    if (navigator.getUserMedia) {
        navigator.getUserMedia(constraints, getUserMediaSuccess, getUserMediaError);
    } else {
        alert('Your browser does not support getUserMedia API');
    }
    socket.on('call',gotMessageFromServer)
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.src = window.URL.createObjectURL(stream);
}

function getUserMediaError(error) {
    console.log(error);
}

function start(isCaller) {
    count=0;
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);

    if (isCaller) {
        peerConnection.createOffer(gotDescription, createOfferError);
    }
}

function gotDescription(description) {
    console.log('got description');
    peerConnection.setLocalDescription(description, function() {
        socket.emit('user',JSON.stringify({ 'sdp': description,'id':id }))
        // serverConnection.send(JSON.stringify({'sdp': description}));

    }, function() { console.log('set description error') });
}

function gotIceCandidate(event) {
    if (event.candidate != null) {
        // serverConnection.send(JSON.stringify({ 'ice': event.candidate }));
        
    }
}

function gotRemoteStream(event) {
    console.log("got remote stream");
    remoteVideo.src = window.URL.createObjectURL(event.stream);
}

function createOfferError(error) {
    console.log(error);
}

function gotMessageFromServer(message) {
    if(!peerConnection) start(false);
console.log(message);
    var signal = JSON.parse(message);
    
    if(signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
            peerConnection.createAnswer(gotDescription, function(err){
                console.log(err);
            });
        },function(err){console.log(err);});
    } else if(signal.ice) {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
    }
}
