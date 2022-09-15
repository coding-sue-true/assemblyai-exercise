import React, { useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import styles from '../styles/Home.module.css';

function AudioUpload() {
  const [file, setFile] = useState();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [speechToText, setSpeechToText] = useState(null);

  async function handleSubmit() {
    const data = new FormData();

    if (!file) return;

    setSubmitting(true);

    data.append("file", file);

    try {
      let res = await axios.post("/api/upload-audio", data);
      setSpeechToText(res.data)
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSetFile(event) {
    const files = event.target.files;

    if (files?.length) {
      setFile(files[0]);
    }
  }

  return (
    <>
    <div className={styles.container}>
      <h3>1. Please go ahead and upload a small sample audio file</h3>
      <p style={{fontSize: '12px'}}><i>Feel free to download one of <a href="https://audio-samples.github.io/#section-4" target="_blank">these</a>. We only accept .mp3 files for now </i></p>
      <form action="POST">
        <div>
          <label htmlFor="file">Choose your audio file</label>
          <input type="file" id="file" accept=".mp3" onChange={handleSetFile} />
        </div>
      </form>
      <br />
      <h3>2. Press <button onClick={handleSubmit}>Transcribe Audio</button> to see your your audio file in text format</h3>
      {error && <p>{error}</p>}
      {submitting && <p>Transcribing...</p>}
    </div>
    { speechToText && 
        <div className={styles.container}>
          <h1>Et Voila!</h1>
          <p>Your audio to text: <i>{speechToText.transcriptResult.text}</i></p>
          <h4>JSON data</h4>
          <p><i>{JSON.stringify(speechToText.transcriptResult, null, 2)}</i></p>
        </div>
    }
    </>
  );
}

export default AudioUpload;