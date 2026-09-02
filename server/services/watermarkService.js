const dotenv = require('dotenv');
dotenv.config();
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

const watermarkVideo = async (videoUrl, watermarkData) => {
  const { userId, movieId, ownerName, title, } = watermarkData;

  const tmpDir = path.join(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const outputPath = path.join(tmpDir, `watermarked_${movieId}.mp4`);
  const ownerCode = `FPA-${userId.toString().slice(-6).toUpperCase()}-${movieId.toString().slice(-6).toUpperCase()}`;
  const timestamp = new Date().toISOString().split('T')[0];

  // metadata-only watermark — no drawtext filter needed
  // ownership data is burned into video metadata and re-encoded
  // const ffmpegCommand = `ffmpeg -i "${videoUrl}" \
  //   -metadata title="${title}" \
  //   -metadata comment="FAIRPLAYAFRICA_OWNER=${ownerCode}" \
  //   -metadata copyright="© ${ownerName} - Protected by FairPlay Africa" \
  //   -metadata description="FPA_MOVIE_ID=${movieId}_USER_ID=${userId}_DATE=${timestamp}" \
  //   -metadata artist="${ownerName}" \
  //   -metadata album="FairPlay Africa Protected Content" \
  //   -c:v copy -c:a copy \

    // "${outputPath}" -y`;
    const ffmpegCommand = `ffmpeg -i "${videoUrl}" \
    -map 0 \
    -map_metadata 0 \
    -metadata title="${title}" \
    -metadata artist="${ownerName}" \
    -metadata album_artist="FairPlay Africa" \
    -metadata comment="FAIRPLAYAFRICA_OWNER=${ownerCode}" \
    -metadata copyright="FairPlay Africa - ${ownerName} - ${ownerCode}" \
    -metadata synopsis="FPA_MOVIE_ID=${movieId}_USER_ID=${userId}_DATE=${timestamp}" \
    -metadata description="FPA_MOVIE_ID=${movieId}_USER_ID=${userId}_DATE=${timestamp}" \
    -movflags use_metadata_tags \
    -c:v copy -c:a copy \
    "${outputPath}" -y`;

  console.log(`Watermarking video for: ${title} (${ownerCode})`);
  await execAsync(ffmpegCommand, { maxBuffer: 1024 * 1024 * 100 });

  if (!fs.existsSync(outputPath)) throw new Error('Watermarked file was not created');

  const stats = fs.statSync(outputPath);
  console.log(`Watermark complete: ${ownerCode} — ${(stats.size / (1024 * 1024)).toFixed(1)}MB`);

  return { outputPath, ownerCode };
};

const extractWatermark = async (videoUrl) => {
  try {
    const command = `ffprobe -v quiet -print_format json -show_format "${videoUrl}"`;
    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);
    const tags = data.format?.tags || {};

    const ownerCode = tags.comment?.replace('FAIRPLAYAFRICA_OWNER=', '') || null;
    const copyright = tags.copyright || null;
    const description = tags.description || null;

    let movieId = null;
    let userId = null;

    if (description) {
      const movieMatch = description.match(/FPA_MOVIE_ID=([a-f0-9]+)/);
      const userMatch = description.match(/USER_ID=([a-f0-9]+)/);
      if (movieMatch) movieId = movieMatch[1];
      if (userMatch) userId = userMatch[1];
    }

    return { ownerCode, copyright, movieId, userId, isWatermarked: !!ownerCode };
  } catch (error) {
    console.error('Watermark extraction error:', error.message);
    return { isWatermarked: false };
  }
};

const cleanupWatermarkedFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Cleaned up watermarked file:', filePath);
    }
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
};

module.exports = { watermarkVideo, extractWatermark, cleanupWatermarkedFile };