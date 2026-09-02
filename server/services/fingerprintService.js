const dotenv = require('dotenv');
dotenv.config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const { promisify } = require('util');
const execAsync = promisify(exec);

const ACRCLOUD_HOST = process.env.ACRCLOUD_HOST;
const ACRCLOUD_ACCESS_KEY = process.env.ACRCLOUD_ACCESS_KEY;
const ACRCLOUD_ACCESS_SECRET = process.env.ACRCLOUD_ACCESS_SECRET;

// extract 60 seconds of audio from video file using ffmpeg
const extractAudio = async (videoUrl, outputPath, duration = 60) => {
  const command = `ffmpeg -i "${videoUrl}" -t ${duration} -ar 8000 -ac 1 -f s16le "${outputPath}" -y`;
  await execAsync(command);
};

// build ACRCloud signature
const buildSignature = (method, uri, accessKey, dataType, signatureVersion, timestamp, secret) => {
  const signString = [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
  return crypto.createHmac('sha1', secret).update(signString).digest('base64');
};

// identify audio against ACRCloud
const identifyAudio = async (audioPath) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const method = 'POST';
  const uri = '/v1/identify';
  const dataType = 'audio';
  const signatureVersion = '1';

  const signature = buildSignature(
    method, uri,
    ACRCLOUD_ACCESS_KEY,
    dataType,
    signatureVersion,
    timestamp,
    ACRCLOUD_ACCESS_SECRET
  );

  const audioData = fs.readFileSync(audioPath);
  const form = new FormData();
  form.append('sample', audioData, { filename: 'sample.pcm', contentType: 'audio/pcm' });
  form.append('access_key', ACRCLOUD_ACCESS_KEY);
  form.append('data_type', dataType);
  form.append('signature_version', signatureVersion);
  form.append('signature', signature);
  form.append('sample_bytes', audioData.length);
  form.append('timestamp', timestamp);

  const response = await axios.post(`https://${ACRCLOUD_HOST}${uri}`, form, {
    headers: form.getHeaders(),
    timeout: 15000,
  });

  return response.data;
};

// register audio fingerprint with ACRCloud custom library
const registerFingerprint = async (videoUrl, movieId, title) => {
  try {
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const audioPath = path.join(tmpDir, `${movieId}_register.pcm`);

    console.log(`Extracting audio for registration: ${title}`);
    await extractAudio(videoUrl, audioPath, 60);

    // for now store the audio hash as fingerprint
    const audioData = fs.readFileSync(audioPath);
    const fingerprint = crypto.createHash('sha256').update(audioData).digest('hex');

    // cleanup
    fs.unlinkSync(audioPath);

    console.log(`Fingerprint registered for: ${title}`);
    return fingerprint;
  } catch (error) {
    console.error('Fingerprint registration error:', error.message);
    throw error;
  }
};

// compare a youtube video's audio against our registered fingerprint
const compareAudioFingerprint = async (youtubeVideoId, registeredFingerprint) => {
  try {
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    // download audio from youtube video using yt-dlp
    const audioPath = path.join(tmpDir, `${youtubeVideoId}_compare.pcm`);
    const ytDlpCommand = `yt-dlp -x --audio-format wav -o "${tmpDir}/${youtubeVideoId}.%(ext)s" "https://www.youtube.com/watch?v=${youtubeVideoId}" --quiet`;

    await execAsync(ytDlpCommand);

    const wavPath = path.join(tmpDir, `${youtubeVideoId}.wav`);
    if (!fs.existsSync(wavPath)) return { match: false, confidence: 0 };

    // convert to pcm for comparison
    await execAsync(`ffmpeg -i "${wavPath}" -t 60 -ar 8000 -ac 1 -f s16le "${audioPath}" -y`);

    const audioData = fs.readFileSync(audioPath);
    const fingerprint = crypto.createHash('sha256').update(audioData).digest('hex');

    // cleanup
    [audioPath, wavPath].forEach((f) => { if (fs.existsSync(f)) fs.unlinkSync(f); });

    const match = fingerprint === registeredFingerprint;
    return { match, confidence: match ? 100 : 0, fingerprint };
  } catch (error) {
    console.error('Audio comparison error:', error.message);
    return { match: false, confidence: 0 };
  }
};

module.exports = { registerFingerprint, compareAudioFingerprint, extractAudio };