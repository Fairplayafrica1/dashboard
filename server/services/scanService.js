// const Movie = require('../models/Movie');
// const Infringement = require('../models/Infringement');
// const { searchYouTube } = require('./youtubeService');
// const { compareAudioFingerprint } = require('./fingerprintService');

// const calculateTitleConfidence = (movieTitle, youtubeTitle) => {
//   const movie = movieTitle.toLowerCase().trim();
//   const yt = youtubeTitle.toLowerCase().trim();

//   if (yt.includes(movie) || movie.includes(yt)) return 'high';

//   const movieWords = movie.split(' ').filter((w) => w.length > 3);
//   const matchCount = movieWords.filter((word) => yt.includes(word)).length;
//   const ratio = matchCount / movieWords.length;

//   if (ratio >= 0.6) return 'high';
//   if (ratio >= 0.3) return 'medium';
//   return 'low';
// };

// const scanMovie = async (movieId) => {
//   const movie = await Movie.findById(movieId);
//   if (!movie) throw new Error('Movie not found');

//   console.log(`Scanning: ${movie.title}`);
//   await Movie.findByIdAndUpdate(movieId, { scanStatus: 'scanning' });

//   try {
//     const results = await searchYouTube(movie.title);
//     let newInfringements = 0;

//     for (const result of results) {
//       // step 1 — title confidence check
//       const titleConfidence = calculateTitleConfidence(movie.title, result.youtubeTitle);
//       if (titleConfidence === 'low') continue;

//       // step 2 — audio fingerprint comparison if fingerprint is ready
//       let finalConfidence = titleConfidence;

//       if (movie.fingerprint && movie.fingerprint !== 'pending' && movie.fingerprint !== 'error') {
//         console.log(`Comparing audio for: ${result.youtubeTitle}`);
//         const audioResult = await compareAudioFingerprint(result.youtubeVideoId, movie.fingerprint);

//         if (audioResult.match) {
//           finalConfidence = 'high';
//           console.log(`Audio match found: ${result.youtubeTitle}`);
//         } else {
//           // no audio match — only flag if title confidence is high
//           if (titleConfidence !== 'high') continue;
//           finalConfidence = 'medium';
//         }
//       }

//       try {
//         await Infringement.create({
//           movie: movie._id,
//           owner: movie.owner,
//           ...result,
//           matchConfidence: finalConfidence,
//           status: 'detected',
//         });
//         newInfringements++;
//       } catch (err) {
//         if (err.code === 11000) continue;
//         throw err;
//       }
//     }

//     await Movie.findByIdAndUpdate(movieId, {
//       scanStatus: 'scanned',
//       lastScannedAt: new Date(),
//       infringementCount: await Infringement.countDocuments({ movie: movie._id }),
//     });

//     console.log(`Scan complete for "${movie.title}": ${newInfringements} new infringements`);
//     return { newInfringements };
//   } catch (error) {
//     await Movie.findByIdAndUpdate(movieId, { scanStatus: 'error' });
//     throw error;
//   }
// };

// const scanAllMovies = async () => {
//   const movies = await Movie.find({ scanStatus: { $ne: 'scanning' } });
//   console.log(`Starting scan for ${movies.length} movies`);
//   for (const movie of movies) {
//     await scanMovie(movie._id);
//   }
// };

// module.exports = { scanMovie, scanAllMovies };

const Movie = require('../models/Movie');
const Infringement = require('../models/Infringement');
const { searchYouTube } = require('./youtubeService');
const { compareAudioFingerprint } = require('./fingerprintService');
const { log } = require('./activityService');

const calculateTitleConfidence = (movieTitle, youtubeTitle) => {
  const movie = movieTitle.toLowerCase().trim();
  const yt = youtubeTitle.toLowerCase().trim();
  if (yt.includes(movie) || movie.includes(yt)) return 'high';
  const movieWords = movie.split(' ').filter((w) => w.length > 3);
  const matchCount = movieWords.filter((word) => yt.includes(word)).length;
  const ratio = matchCount / movieWords.length;
  if (ratio >= 0.6) return 'high';
  if (ratio >= 0.3) return 'medium';
  return 'low';
};

const scanMovie = async (movieId, app = null) => {
  const movie = await Movie.findById(movieId);
  if (!movie) throw new Error('Movie not found');

  console.log(`Scanning: ${movie.title}`);
  await Movie.findByIdAndUpdate(movieId, { scanStatus: 'scanning' });

  try {
    const results = await searchYouTube(movie.title);
    let newInfringements = 0;
    const newInfringementDocs = [];

    for (const result of results) {
      const titleConfidence = calculateTitleConfidence(movie.title, result.youtubeTitle);
      if (titleConfidence === 'low') continue;

      let finalConfidence = titleConfidence;

      if (movie.fingerprint && movie.fingerprint !== 'pending' && movie.fingerprint !== 'error') {
        const audioResult = await compareAudioFingerprint(result.youtubeVideoId, movie.fingerprint);
        if (audioResult.match) {
          finalConfidence = 'high';
        } else {
          if (titleConfidence !== 'high') continue;
          finalConfidence = 'medium';
        }
      }

      try {
        const infringement = await Infringement.create({
          movie: movie._id,
          owner: movie.owner,
          ...result,
          matchConfidence: finalConfidence,
          status: 'detected',
        });
        newInfringements++;
        newInfringementDocs.push(infringement);
      } catch (err) {
        if (err.code === 11000) continue;
        throw err;
      }
    }

    await Movie.findByIdAndUpdate(movieId, {
      scanStatus: 'scanned',
      lastScannedAt: new Date(),
      infringementCount: await Infringement.countDocuments({ movie: movie._id }),
    });

    // real-time notification if new infringements found
    if (newInfringements > 0 && app) {
      const { notifyUser } = require('./notificationService');
      notifyUser(app, movie.owner.toString(), 'new_infringements', {
        movieTitle: movie.title,
        count: newInfringements,
        infringements: newInfringementDocs.map((i) => ({
          id: i._id,
          youtubeTitle: i.youtubeTitle,
          youtubeChannel: i.youtubeChannel,
          youtubeThumbnail: i.youtubeThumbnail,
          matchConfidence: i.matchConfidence,
        })),
      });
      
    }
    if (newInfringements > 0 && app) {
      const { notifyUser } = require('./notificationService');
      await notifyUser(app, movie.owner.toString(), 'new_infringements', {
        type: 'infringement',
        title: `${newInfringements} new piracy detected`,
        message: `"${movie.title}" was found on ${newInfringements} YouTube channel${newInfringements > 1 ? 's' : ''}`,
        metadata: {
          movieTitle: movie.title,
          count: newInfringements,
          movieId: movie._id,
        },
      });
    }
    if (newInfringements > 0) {
        log('infringement_detected',
          `${newInfringements} infringement(s) detected for "${movie.title}"`,
          movie.owner,
          { movieId: movie._id, count: newInfringements }
        );
      }

    console.log(`Scan complete for "${movie.title}": ${newInfringements} new infringements`);
    return { newInfringements };
  } catch (error) {
    await Movie.findByIdAndUpdate(movieId, { scanStatus: 'error' });
    throw error;
  }
};

const scanAllMovies = async (app = null) => {
  const movies = await Movie.find({ scanStatus: { $ne: 'scanning' } });
  console.log(`Starting scan for ${movies.length} movies`);
  for (const movie of movies) {
    await scanMovie(movie._id, app);
  }
};

module.exports = { scanMovie, scanAllMovies };