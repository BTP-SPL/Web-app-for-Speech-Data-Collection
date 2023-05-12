import * as React from 'react';
import { useState } from 'react';
import { useAudioRecorder, AudioRecorder } from 'react-audio-voice-recorder';
import "./back.css";
import "./main.css";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import "primereact/resources/themes/lara-light-indigo/theme.css";     
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";  
import { FFmpeg } from 'react-ffmpeg';
import axios from 'axios';


function convertMP3ToWAV(mp3URL) {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', mp3URL, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      audioContext.decodeAudioData(xhr.response, (buffer) => {
        const wavBuffer = audioContext.createBuffer(
          1, buffer.length, audioContext.sampleRate
        );
        wavBuffer.copyToChannel(buffer.getChannelData(0), 0);
        const wavData = wavBuffer.getChannelData(0);
        const wavBlob = new Blob([wavData], { type: 'audio/wav' });
        const wavURL = URL.createObjectURL(wavBlob);
        resolve(wavURL);
      });
    };
    xhr.onerror = (e) => reject(e);
    xhr.send();
  });
}


const Home = () => {

  const [Audio, setAudio] = useState(null);
  const [text_to_be_read, settext_to_be_read] = useState("");
  const recorderControls = useAudioRecorder()
  const [recording, setRecording] = useState(false)
  const [visible, setVisible] = useState(false);
  const [type, settype] = useState("0");
  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
  } = useAudioRecorder();
  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    setAudio(audio.src);
  };

  React.useEffect(() => {
    fetch("http://localhost:3001/user/getText")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        settext_to_be_read(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const refreshPage = () => {
    window.location.reload("/main");
  }

  const ButtonHide = () => {
    if (type === "0") {
      settype("1");
    }
    else {
      settype("0");
    }
  }


  
  async function handleConvertToWAV() {
    const url = await convertMP3ToWAV(Audio);
    setAudio(url);
  }

  const submitRecording = () => {
    setVisible(false);
    console.log("Submitted");
    handleConvertToWAV();

    axios.post('http://localhost:3001/user/add', {
      file: Audio,
      text: text_to_be_read.text,
      index: text_to_be_read.index,
      filename: text_to_be_read.filename,
    })
      .then(function (response) {
        alert("Audio Uploaded successfully");
        window.location.reload("/main");
      })
      .catch(function (error) {
        alert("error occured")
        console.log(error);
      }
      );
  }
  // create async submitRecording function

  
  const footerContent = (
    <div>
        <Button label="No" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
        <Button label="Yes" icon="pi pi-check" onClick={submitRecording} autoFocus />
    </div>
);

  return (
    <div className='background'>
      {recording === false &&
        <div className='main_card'>
          <div className='text_box'>{text_to_be_read.text}</div>
          <br />
          <div className='button-style' style={{display:"flex",flesDirection:"column",justifyContent:"center",alignContent:"center"}}><AudioRecorder
            onRecordingComplete={(blob) => addAudioElement(blob)}
            recorderControls={recorderControls}
            onClick={ButtonHide}
          />{type==="0" && <div style={{marginTop:"auto",marginBottom:"auto",marginLeft:".7vw"}}onClick={ButtonHide}>Start Recording</div>}</div>
          <div>
            <button className='button-style' onClick={recorderControls.stopRecording}>Stop recording</button>
            <button className='button-style' onClick={refreshPage}>Restart recording</button>
          </div>
          <div className="card flex justify-content-center">
            <Button label="Submit" icon="pi pi-external-link" onClick={() => setVisible(true)} />
            <Dialog header="Confirm" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)} footer={footerContent}>
              <audio controls src={Audio}></audio>
              <p className="m-0">
                <b>Are you sure that you want to submit this recording?</b>
              </p>
            </Dialog>
          </div>
        </div>
      }
    </div>
  )

};
export default Home;

