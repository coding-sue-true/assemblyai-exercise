// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import busboy from "busboy";
import fs from "fs";
import axios from 'axios'

export const config = {
  api: {
    bodyParser: false,
  },
};

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
      authorization: process.env.ASSEMBLY_API_TOKEN,
      "content-type": "application/json",
      "transfer-encoding": "chunked",
  },
});

function transcribeAudio(data) {
  const payload = {
    audio_url: data['upload_url']
  }
  return assembly.post("/transcript", payload)
  .then((res) => {
    return {
      id: res.data['id'],
      status: res.data['status']
    }
  })
  .catch((err) => console.error(err));
}

function uploadAudioToServer(res, filePath) {
  return fs.readFile(filePath, (err, data) => {
    if (err) return console.error(err);

    (async () => {
      // upload local file to AssemblyAI CDN
      const response = await fetch("https://api.assemblyai.com/v2/upload", {
        method: 'POST',
        headers: {
          authorization: process.env.ASSEMBLY_API_TOKEN,
          "content-type": "audio/mpeg",
          "transfer-encoding": "chunked",
      },
        body: data
      })
      const upload_url = await response.json();

      // transcribe audio to text & check until it's ready
      const transcript = await transcribeAudio(upload_url)
      function get() {
        return assembly.get(`/transcript/${transcript['id']}`).then(function(response) {
            if (response.data.status != "completed") {
              return get();
            } else {
              return response.data
            }
        });
      }
      const transcriptResult = await get();
      return res.status(200).json({ transcriptResult })
  })()
})

  return null
}

export default function handler(req, res) {
  const method = req.method;
  const bb = busboy({ headers: req.headers });

  if (method === "POST") {  
    var filePath = ""
    bb.on("file", (_, file, info) => {
      const fileName = info.filename;
      filePath = `./audios/${fileName}`;
      const stream = fs.createWriteStream(filePath);
  
      file.pipe(stream);
    });
  
    bb.on("close", () => {
      return uploadAudioToServer(res, filePath);
      res.writeHead(200, { Connection: "close" });
      res.end("All done now");
    });
  
    req.pipe(bb);
    return
    
  }

  return res.status(405).json({ error: `Method ${method} is not allowed` });
}
