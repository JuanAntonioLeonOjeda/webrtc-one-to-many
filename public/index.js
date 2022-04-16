window.onload = () => {
  document.getElementById("my-button").onclick = () => {
    init();
  };
};

async function init() {
  console.log('iniciado')
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  console.log(stream)
  document.getElementById("video").srcObject = stream;
  const peer = createPeer();
  console.log('peer creado: ', peer)
  stream.getTracks().forEach((track) => {
    console.log('track: ',track)
    peer.addTrack(track, stream)
  });
  console.log('stream después de getTracks:', stream)
}

function createPeer() {
  console.log('peer creándose')
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
  console.log('negociación')
  const offer = await peer.createOffer();
  console.log('offer: ', offer)
  await peer.setLocalDescription(offer);
  const payload = {
    sdp: peer.localDescription,
  };
  console.log('payload: ', payload)
  const { data } = await axios.post("/broadcast", payload);
  const desc = new RTCSessionDescription(data.sdp);
  console.log('desc: ', desc)
  peer.setRemoteDescription(desc).catch((e) => console.log(e));
}
