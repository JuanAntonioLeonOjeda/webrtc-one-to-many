window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    }
}

async function init() {
    console.log('viewer init')
    const peer = createPeer();
    console.log('peer created: ', peer)
    peer.addTransceiver("video", { direction: "recvonly" })
}

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            },
            {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject"
              },
              {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject"
              },
              {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject"
              }
        ]
    });
    console.log('peer initialized: ', peer)
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    console.log('negotiation start')
    const offer = await peer.createOffer();
    console.log('offer: ', offer)
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };
    console.log('payload: ', payload)
    const { data } = await axios.post('/consumer', payload);
    const desc = new RTCSessionDescription(data.sdp);
    console.log('desc: ', desc)
    peer.setRemoteDescription(desc).catch(e => console.log(e));
    console.log('negotiation end: ', peer)
}

function handleTrackEvent(e) {
    console.log('evento track: ', e)
    document.getElementById("video").srcObject = e.streams[0];
    console.log(e.streams, e.streams[0])
};

