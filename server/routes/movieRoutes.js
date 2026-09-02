
const express = require('express');
const router = express.Router();
const { uploadMovie, getMyMovies, getMovie, deleteMovie } = require('../controllers/movieController');
const { protect } = require('../middleware/auth');
const { uploadVideo } = require('../config/cloudinary');
const Movie = require('../models/Movie');
const { sendVerificationRequestEmail } = require('../services/emailService');
const User = require('../models/User');

const { watermarkVideo, cleanupWatermarkedFile } = require('../services/watermarkService');
const fs = require('fs');
const path = require('path');

// generate watermarked download
// router.post('/watermark/:id', protect, async (req, res) => {
//   try {
//     const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
//     if (!movie) return res.status(404).json({ message: 'Movie not found' });

//     if (!movie.legalDeclaration?.agreed) {
//       return res.status(403).json({ message: 'You must complete the legal declaration first' });
//     }

//     await Movie.findByIdAndUpdate(req.params.id, { watermarkStatus: 'processing' });

//     const { outputPath, ownerCode } = await watermarkVideo(movie.fileUrl, {
//       userId: req.user._id,
//       movieId: movie._id,
//       ownerName: req.user.name,
//       title: movie.title,
//     });

//     await Movie.findByIdAndUpdate(req.params.id, {
//       ownerCode,
//       watermarkStatus: 'ready',
//     });

//     // stream file to client
//     const stat = fs.statSync(outputPath);
//     res.setHeader('Content-Type', 'video/mp4');
//     res.setHeader('Content-Length', stat.size);
//     res.setHeader('Content-Disposition', `attachment; filename="${movie.title.replace(/[^a-z0-9]/gi, '_')}_protected.mp4"`);

//     const readStream = fs.createReadStream(outputPath);
//     readStream.pipe(res);

//     // cleanup after download
//     readStream.on('end', () => cleanupWatermarkedFile(outputPath));
//     readStream.on('error', () => cleanupWatermarkedFile(outputPath));
//   } catch (error) {
//     console.error('Watermark error:', error);
//     await Movie.findByIdAndUpdate(req.params.id, { watermarkStatus: 'error' });
//     res.status(500).json({ message: 'Watermarking failed', error: error.message });
//   }
// });
router.post('/watermark/:id', protect, async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // block if legal declaration not signed
    if (!movie.legalDeclaration?.agreed) {
      return res.status(403).json({ message: 'Complete the legal declaration first' });
    }

    // block if fraud check is still running
    if (movie.fraudCheckStatus === 'checking' || movie.fraudCheckStatus === 'pending') {
      return res.status(403).json({
        message: 'Verification in progress — please wait a moment and try again',
        fraudCheckStatus: movie.fraudCheckStatus,
      });
    }

    // block if fraud detected
    if (movie.fraudCheckStatus === 'failed') {
      return res.status(403).json({
        message: 'Download blocked — this content failed our verification check',
        reason: movie.fraudCheckResult,
        fraudCheckStatus: 'failed',
      });
    }

    await Movie.findByIdAndUpdate(req.params.id, { watermarkStatus: 'processing' });

    const { outputPath, ownerCode } = await watermarkVideo(movie.fileUrl, {
      userId: req.user._id,
      movieId: movie._id,
      ownerName: req.user.name,
      title: movie.title,
    });

    await Movie.findByIdAndUpdate(req.params.id, {
      ownerCode,
      watermarkStatus: 'ready',
      lastDownloadedAt: new Date(),
    });

    // log download
    const { log } = require('../services/activityService');
    log('movie_downloaded', `Protected copy downloaded: ${movie.title}`, req.user._id, {
      movieId: movie._id, ownerCode,
    });

    const stat = fs.statSync(outputPath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition',
      `attachment; filename="${movie.title.replace(/[^a-z0-9]/gi, '_')}_protected.mp4"`);

    const readStream = fs.createReadStream(outputPath);
    readStream.pipe(res);
    readStream.on('end', () => cleanupWatermarkedFile(outputPath));
    readStream.on('error', () => cleanupWatermarkedFile(outputPath));
  } catch (error) {
    console.error('Watermark error:', error);
    await Movie.findByIdAndUpdate(req.params.id, { watermarkStatus: 'error' });
    res.status(500).json({ message: 'Watermarking failed', error: error.message });
  }
});

// save legal declaration
router.post('/declaration/:id', protect, async (req, res) => {
  try {
    const { fullName, agreed } = req.body;
    if (!agreed) return res.status(400).json({ message: 'You must agree to the declaration' });
    if (!fullName) return res.status(400).json({ message: 'Full name is required' });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const movie = await Movie.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        legalDeclaration: {
          agreed: true,
          agreedAt: new Date(),
          ipAddress,
          fullName,
        },
      },
      { returnDocument: 'after' }
    );

    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Declaration saved', movie });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// verify ownership of an uploaded movie by extracting watermark
router.post('/verify-ownership/:id', protect, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const { extractWatermark } = require('../services/watermarkService');
    const watermark = await extractWatermark(movie.fileUrl);

    if (!watermark.isWatermarked) {
      return res.json({ verified: false, message: 'No FairPlay Africa watermark found' });
    }

    // check if watermark matches a registered owner
    const registeredMovie = await Movie.findById(watermark.movieId).populate('owner', 'name email');

    if (!registeredMovie) {
      return res.json({ verified: false, message: 'Watermark found but no matching registration' });
    }

    // if person claiming ownership is not the watermarked owner — fraud detected
    const isFraud = registeredMovie.owner._id.toString() !== req.user._id.toString();

    res.json({
      verified: true,
      isOriginalOwner: !isFraud,
      isFraud,
      registeredOwner: isFraud ? {
        name: registeredMovie.owner.name,
        registeredAt: registeredMovie.createdAt,
        ownerCode: watermark.ownerCode,
      } : null,
      message: isFraud
        ? `Fraud detected — this content is already registered by another user`
        : 'Ownership verified — you are the registered owner',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const { uploadThumbnail } = require('../config/cloudinary');

// upload ownership evidence (script, BTS photos, etc)
router.post('/evidence/:id', protect, uploadThumbnail.single('evidence'), async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const movie2 = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        ownershipEvidence: {
          fileUrl: req.file.path,
          fileType: req.file.mimetype,
          uploadedAt: new Date(),
        },
        verificationStatus: 'pending',
      },
      { returnDocument: 'after' }
    );

    // notify admin that evidence was submitted
    const user = await User.findById(req.user._id);
    await sendVerificationRequestEmail({
      adminEmail: process.env.EMAIL_USER,
      userName: user.name,
      userEmail: user.email,
      movieTitle: movie.title,
      evidenceUrl: req.file.path,
    }).catch((err) => console.error('Verification email error:', err.message));

    res.json({ message: 'Evidence uploaded — pending admin review', movie: movie2 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PDFDocument = require('pdfkit');

router.get('/certificate/:id', protect, async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    if (movie.fraudCheckStatus !== 'passed') {
      return res.status(403).json({ message: 'Certificate only available for verified content' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 60 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="${movie.title.replace(/[^a-z0-9]/gi, '_')}_certificate.pdf"`);
    doc.pipe(res);

    // Certificate design
    doc.rect(0, 0, 612, 792).fill('#0A0F0E');
    doc.rect(40, 40, 532, 712).stroke('#1B9E85');
    doc.rect(45, 45, 522, 702).stroke('#2A3832');

    // Header
    doc.fillColor('#1B9E85').fontSize(28).font('Helvetica-Bold')
      .text('FAIRPLAY AFRICA', 60, 80, { align: 'center' });
    doc.fillColor('#6B8F82').fontSize(12).font('Helvetica')
      .text('COPYRIGHT REGISTRATION CERTIFICATE', 60, 116, { align: 'center' });

    // Divider
    doc.moveTo(80, 145).lineTo(532, 145).stroke('#2A3832');

    // Certificate body
    doc.fillColor('#F0F7F4').fontSize(14).font('Helvetica-Bold')
      .text('This certifies that the following work has been registered', 60, 165, { align: 'center' });
    doc.fillColor('#6B8F82').fontSize(11).font('Helvetica')
      .text('with FairPlay Africa Content Protection Platform', 60, 185, { align: 'center' });

    // Movie title
    doc.fillColor('#1B9E85').fontSize(32).font('Helvetica-Bold')
      .text(movie.title, 60, 230, { align: 'center' });

    // Details
    const details = [
      ['Owner', req.user.name],
      ['Email', req.user.email],
      ['Owner Code', movie.ownerCode || 'Pending watermark'],
      ['Registration Date', new Date(movie.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })],
      ['Genre', movie.genre || 'Not specified'],
      ['Release Year', movie.releaseYear?.toString() || 'Not specified'],
      ['Verification Status', 'VERIFIED'],
      ['Certificate ID', `FPA-CERT-${movie._id.toString().slice(-8).toUpperCase()}`],
    ];

    let y = 310;
    details.forEach(([label, value]) => {
      doc.fillColor('#6B8F82').fontSize(10).font('Helvetica')
        .text(label, 100, y);
      doc.fillColor('#F0F7F4').fontSize(10).font('Helvetica-Bold')
        .text(value, 280, y);
      doc.moveTo(100, y + 16).lineTo(512, y + 16).stroke('#2A3832');
      y += 28;
    });

    // Legal text
    doc.fillColor('#6B8F82').fontSize(8).font('Helvetica')
      .text(
        'This certificate serves as evidence of copyright registration on the FairPlay Africa platform. ' +
        'The registered owner asserts copyright over this work under applicable international copyright law. ' +
        'Unauthorized reproduction, distribution, or use of this content is prohibited.',
        80, y + 20, { align: 'center', width: 452 }
      );

    // Footer
    doc.fillColor('#1B9E85').fontSize(10).font('Helvetica-Bold')
      .text('www.fairplayafrica.com', 60, 730, { align: 'center' });
    doc.fillColor('#6B8F82').fontSize(8).font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString()}`, 60, 748, { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Certificate generation failed', error: error.message });
  }
});
router.post('/thumbnail/:id', protect, uploadThumbnail.single('thumbnail'), async (req, res) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { thumbnailUrl: req.file.path },
      { returnDocument: 'after' }
    );
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Thumbnail updated', movie });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', protect, uploadVideo.single('video'), uploadMovie);
router.get('/', protect, getMyMovies);
router.get('/:id', protect, getMovie);
router.delete('/:id', protect, deleteMovie);

module.exports = router;