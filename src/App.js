import "./App.css";
import Peer from "peerjs";
import { useState } from "react";

function App() {
  // const [userId, setUserId] = useState(null);
  const peer = new Peer();
  const [calling, setCalling] = useState(false);

  let currentCall;

  peer.on("open", function (id) {
    document.getElementById("uuid").innerText = id;
    // setUserId(id);
  });

  peer.on("call", (call) => {
    console.log(call);
    if (window.confirm(`Accept call from ${call.peer}?`)) {
      // grab the camera and mic
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          // play the local preview
          document.querySelector("#local-video").srcObject = stream;
          document.querySelector("#local-video").play();
          // answer the call
          call.answer(stream);
          // save the close function
          currentCall = call;
          // change to the video view
          document.querySelector("#menu").style.display = "none";
          document.querySelector("#live").style.display = "block";
          call.on("stream", (remoteStream) => {
            // when we receive the remote stream, play it
            document.getElementById("remote-video").srcObject = remoteStream;
            document.getElementById("remote-video").play();
          });
        })
        .catch((err) => {
          console.log("Failed to get local stream:", err);
        });
    } else {
      // user rejected the call, close it
      call.close();
    }
  });

  async function callUser() {
    // get the id entered by the user
    setCalling(true);
    const peerId = document.querySelector("input").value;
    // grab the camera and mic
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // switch to the video call and play the camera preview
    document.getElementById("menu").style.display = "none";
    document.getElementById("live").style.display = "block";
    document.getElementById("local-video").srcObject = stream;
    document.getElementById("local-video").play();
    // make the call
    const call = peer.call(peerId, stream);
    call.on("stream", (stream) => {
      document.getElementById("remote-video").srcObject = stream;
      document.getElementById("remote-video").play();
    });
    call.on("data", (stream) => {
      document.querySelector("#remote-video").srcObject = stream;
    });
    call.on("error", (err) => {
      console.log(err);
    });
    call.on("close", () => {
      endCall();
    });
    call.on("disconnected", () => {
      console.log("야 dis");
      endCall();
    });
    call.on("destroyed", () => {
      console.log("야 de");
      endCall();
    });
    // save the close function
    currentCall = call;
  }

  function endCall() {
    // Go back to the menu
    document.querySelector("#menu").style.display = "block";
    document.querySelector("#live").style.display = "none";
    // If there is no current call, return
    if (!currentCall) return;
    // Close the call, and reset the function
    try {
      currentCall.close();
    } catch {}
    currentCall = undefined;
  }

  return (
    <>
      <div id="menu">
        <p>Your ID:</p>
        <p id="uuid"></p>
        <input id="input" type="text" placeholder="Peer id" />
        <button onClick={() => callUser()}>Connect</button>
      </div>
      {/* {calling && <div>전화 거는 중</div>} */}
      <div id="live">
        <video id="remote-video" />
        <video id="local-video" muted={true} />
        <button id="end-call" onClick={() => endCall()}>
          End Call
        </button>
      </div>
    </>
  );
}

export default App;
