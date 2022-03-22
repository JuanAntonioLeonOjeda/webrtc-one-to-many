window.onload = () => {
  document.getElementById("my-button").onclick = () => {
    init();
  };
};

async function init() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  document.getElementById("video").srcObject = stream;
  const peer = createPeer();
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));
}

function createPeer() {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
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
    ],
  });
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
    sdp: peer.localDescription,
  };

  const { data } = await axios.post("/broadcast", payload);
  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch((e) => console.log(e));
}
