// import { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Upload, Film, X, CheckCircle } from 'lucide-react';
// import { uploadMovie } from '../../api/movies';
// import toast from 'react-hot-toast';

// export default function UploadMovie() {
//   const navigate = useNavigate();
//   const fileRef = useRef();
//   const [form, setForm] = useState({ title: '', description: '', genre: '', releaseYear: '' });
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [done, setDone] = useState(false);

//   const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Documentary', 'Animation', 'Nollywood', 'Other'];

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleFile = (e) => {
//     const f = e.target.files[0];
//     if (!f) return;
//     if (!f.type.startsWith('video/')) { toast.error('Please select a video file'); return; }
//     if (f.size > 500 * 1024 * 1024) { toast.error('File must be under 500MB'); return; }
//     setFile(f);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const f = e.dataTransfer.files[0];
//     if (f && f.type.startsWith('video/')) setFile(f);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file) { toast.error('Please select a video file'); return; }
//     if (!form.title) { toast.error('Title is required'); return; }

//     const formData = new FormData();
//     formData.append('video', file);
//     formData.append('title', form.title);
//     formData.append('description', form.description);
//     formData.append('genre', form.genre);
//     formData.append('releaseYear', form.releaseYear);

//     setUploading(true);
//     setProgress(0);

//     try {
//       await uploadMovie(formData);
//       setProgress(100);
//       setDone(true);
//       toast.success('Movie uploaded successfully!');
//       setTimeout(() => navigate('/dashboard/movies'), 1500);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Upload failed');
//       setUploading(false);
//       setProgress(0);
//     }
//   };

//   const inputStyle = {
//     backgroundColor: '#1A2622',
//     border: '1px solid #2A3832',
//     color: '#F0F7F4',
//   };

//   if (done) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 space-y-4">
//         <CheckCircle size={56} style={{ color: '#22C55E' }} />
//         <p className="text-xl font-bold" style={{ color: '#F0F7F4' }}>Upload complete!</p>
//         <p style={{ color: '#6B8F82' }}>Redirecting to your movies...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto space-y-6">
//       <div>
//         <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>Upload a Movie</h2>
//         <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
//           Add your film to FairPlayAfrica for automatic piracy protection
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-5">
//         {/* Drop zone */}
//         <div
//           onClick={() => !uploading && fileRef.current.click()}
//           onDrop={handleDrop}
//           onDragOver={(e) => e.preventDefault()}
//           className="relative flex flex-col items-center justify-center p-10 rounded-2xl cursor-pointer transition-all"
//           style={{
//             border: `2px dashed ${file ? '#1B9E85' : '#2A3832'}`,
//             backgroundColor: file ? '#1B9E8510' : '#111A18',
//           }}>
//           <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
//           {file ? (
//             <>
//               <Film size={36} style={{ color: '#1B9E85' }} />
//               <p className="mt-3 font-medium" style={{ color: '#F0F7F4' }}>{file.name}</p>
//               <p className="text-sm" style={{ color: '#6B8F82' }}>
//                 {(file.size / (1024 * 1024)).toFixed(1)} MB
//               </p>
//               {!uploading && (
//                 <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
//                   className="absolute top-3 right-3 p-1.5 rounded-lg"
//                   style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
//                   <X size={14} />
//                 </button>
//               )}
//             </>
//           ) : (
//             <>
//               <Upload size={36} style={{ color: '#2A3832' }} />
//               <p className="mt-3 font-medium" style={{ color: '#F0F7F4' }}>Drop your video here</p>
//               <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>or click to browse — MP4, MOV, AVI up to 500MB</p>
//             </>
//           )}
//         </div>

//         {/* Upload progress */}
//         {uploading && (
//           <div>
//             <div className="flex justify-between text-sm mb-2">
//               <span style={{ color: '#6B8F82' }}>Uploading to Cloudinary...</span>
//               <span style={{ color: '#1B9E85' }}>{progress}%</span>
//             </div>
//             <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1A2622' }}>
//               <div className="h-full rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%`, backgroundColor: '#1B9E85' }} />
//             </div>
//           </div>
//         )}

//         {/* Title */}
//         <div>
//           <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>
//             Movie Title <span style={{ color: '#EF4444' }}>*</span>
//           </label>
//           <input type="text" name="title" value={form.title} onChange={handleChange}
//             placeholder="Enter the official title of your film"
//             className="w-full px-4 py-3 rounded-xl outline-none transition-all"
//             style={inputStyle}
//             onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
//             onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
//         </div>

//         {/* Genre + Year */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>Genre</label>
//             <select name="genre" value={form.genre} onChange={handleChange}
//               className="w-full px-4 py-3 rounded-xl outline-none transition-all"
//               style={inputStyle}>
//               <option value="">Select genre</option>
//               {genres.map((g) => <option key={g} value={g}>{g}</option>)}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>Release Year</label>
//             <input type="number" name="releaseYear" value={form.releaseYear} onChange={handleChange}
//               placeholder="2024" min="1900" max="2099"
//               className="w-full px-4 py-3 rounded-xl outline-none transition-all"
//               style={inputStyle}
//               onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
//               onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
//           </div>
//         </div>

//         {/* Description */}
//         <div>
//           <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>Description</label>
//           <textarea name="description" value={form.description} onChange={handleChange}
//             placeholder="Brief description of your film..."
//             rows={3}
//             className="w-full px-4 py-3 rounded-xl outline-none transition-all resize-none"
//             style={inputStyle}
//             onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
//             onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
//         </div>

//         <button type="submit" disabled={uploading}
//           className="w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
//           style={{
//             backgroundColor: uploading ? '#0f5c4e' : '#1B9E85',
//             cursor: uploading ? 'not-allowed' : 'pointer',
//           }}>
//           <Upload size={18} />
//           {uploading ? 'Uploading...' : 'Upload & Protect'}
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Film, X, CheckCircle, Shield, FileText, AlertTriangle } from 'lucide-react';
import { uploadMovie, saveDeclaration, downloadWatermarked } from '../../api/movies';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STEPS = ['Upload', 'Declaration', 'Download'];

export default function UploadMovie() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileRef = useRef();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', description: '', genre: '', releaseYear: '' });
  const [file, setFile] = useState(null);
  const [movie, setMovie] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [watermarking, setWatermarking] = useState(false);
  const [declaration, setDeclaration] = useState({
    fullName: user?.name || '',
    agreed1: false,
    agreed2: false,
    agreed3: false,
  });

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Documentary', 'Animation', 'Nollywood', 'Other'];

  const inputStyle = {
    backgroundColor: '#1A2622',
    border: '1px solid #2A3832',
    color: '#F0F7F4',
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { toast.error('Please select a video file'); return; }
    if (f.size > 500 * 1024 * 1024) { toast.error('File must be under 500MB'); return; }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('video/')) setFile(f);
  };

  const thumbnailRef = useRef();
  const [thumbnail, setThumbnail] = useState(null);

  // step 1 — upload movie
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a video file'); return; }
    if (!form.title) { toast.error('Title is required'); return; }

    const formData = new FormData();
    formData.append('video', file);
    Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));

    setUploading(true);
    try {
      const { data } = await uploadMovie(formData);
      setMovie(data.movie);
      toast.success('Movie uploaded — now complete your ownership declaration');
      setStep(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // step 2 — legal declaration
  const handleDeclaration = async () => {
    if (!declaration.agreed1 || !declaration.agreed2 || !declaration.agreed3) {
      toast.error('You must agree to all statements');
      return;
    }
    if (!declaration.fullName.trim()) {
      toast.error('Please enter your full legal name');
      return;
    }

    try {
      await saveDeclaration(movie._id, {
        fullName: declaration.fullName,
        agreed: true,
      });
      toast.success('Declaration saved — download your protected copy');
      setStep(2);
    } catch (error) {
      toast.error('Failed to save declaration');
    }
  };

  // step 3 — download watermarked video
  const handleDownload = async () => {
    setWatermarking(true);
    toast('Generating your watermarked copy — this may take a minute...', { icon: '⏳' });
    try {
      const { data } = await downloadWatermarked(movie._id);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${movie.title.replace(/[^a-z0-9]/gi, '_')}_protected.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Protected copy downloaded! Upload this to YouTube.');
      setTimeout(() => navigate('/dashboard/movies'), 2000);
    } catch (error) {
      toast.error('Watermarking failed — try again');
    } finally {
      setWatermarking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>Upload & Protect Your Movie</h2>
        <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
          Complete all 3 steps to register your film for piracy protection
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  backgroundColor: i < step ? '#22C55E' : i === step ? '#1B9E85' : '#1A2622',
                  color: i <= step ? '#fff' : '#6B8F82',
                  border: `2px solid ${i < step ? '#22C55E' : i === step ? '#1B9E85' : '#2A3832'}`,
                }}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <p className="text-xs mt-1" style={{ color: i === step ? '#F0F7F4' : '#6B8F82' }}>{label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-0.5 flex-1 mb-5 transition-all"
                style={{ backgroundColor: i < step ? '#22C55E' : '#2A3832' }} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 0 — Upload */}
      {step === 0 && (
        <form onSubmit={handleUpload} className="space-y-5">
          <div
            onClick={() => !uploading && fileRef.current.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative flex flex-col items-center justify-center p-10 rounded-2xl cursor-pointer transition-all"
            style={{
              border: `2px dashed ${file ? '#1B9E85' : '#2A3832'}`,
              backgroundColor: file ? '#1B9E8510' : '#111A18',
            }}>
            <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
            {file ? (
              <>
                <Film size={36} style={{ color: '#1B9E85' }} />
                <p className="mt-3 font-medium" style={{ color: '#F0F7F4' }}>{file.name}</p>
                <p className="text-sm" style={{ color: '#6B8F82' }}>
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
                {!uploading && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg"
                    style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                    <X size={14} />
                  </button>
                )}
              </>
            ) : (
              <>
                <Upload size={36} style={{ color: '#2A3832' }} />
                <p className="mt-3 font-medium" style={{ color: '#F0F7F4' }}>Drop your video here</p>
                <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>MP4, MOV, AVI up to 500MB</p>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>
              Movie Thumbnail (optional)
            </label>
            <div
              onClick={() => thumbnailRef.current.click()}
              className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
              style={{
                border: `1px dashed ${thumbnail ? '#1B9E85' : '#2A3832'}`,
                backgroundColor: thumbnail ? '#1B9E8510' : '#1A2622',
              }}>
              <input ref={thumbnailRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => setThumbnail(e.target.files[0])} />
              {thumbnail ? (
                <div className="flex items-center gap-3">
                  <img src={URL.createObjectURL(thumbnail)} alt="thumbnail"
                    className="w-16 h-10 object-cover rounded" />
                  <p className="text-sm" style={{ color: '#1B9E85' }}>{thumbnail.name}</p>
                </div>
              ) : (
                <>
                  <Upload size={18} style={{ color: '#6B8F82' }} />
                  <p className="text-sm" style={{ color: '#6B8F82' }}>Upload cover image</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>
              Movie Title <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              placeholder="Official title of your film"
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
              onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>Genre</label>
              <select name="genre" value={form.genre} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={inputStyle}>
                <option value="">Select genre</option>
                {genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>Release Year</label>
              <input type="number" name="releaseYear" value={form.releaseYear} onChange={handleChange}
                placeholder="2024" min="1900" max="2099"
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
                onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Brief description of your film..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl outline-none resize-none"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
              onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
          </div>

          <button type="submit" disabled={uploading}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: uploading ? '#0f5c4e' : '#1B9E85', cursor: uploading ? 'not-allowed' : 'pointer' }}>
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Upload Movie'}
          </button>
        </form>
      )}

      {/* STEP 1 — Legal Declaration */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#F59E0B20' }}>
                <FileText size={20} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#F0F7F4' }}>Copyright Ownership Declaration</p>
                <p className="text-xs" style={{ color: '#6B8F82' }}>This is a legally binding statement</p>
              </div>
            </div>

            <div className="p-4 rounded-xl mb-4 text-sm leading-relaxed"
              style={{ backgroundColor: '#1A2622', color: '#6B8F82' }}>
              By completing this declaration you confirm that you are the original creator and
              copyright holder of <span style={{ color: '#F0F7F4' }}>"{movie?.title}"</span> and
              that you have the legal right to register it for copyright protection on FairPlay Africa.
              This declaration is recorded with your name, timestamp, and IP address as legal evidence.
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              {[
                { key: 'agreed1', text: 'I am the original creator and sole copyright owner of this film, or I am authorized to act on behalf of the copyright owner.' },
                { key: 'agreed2', text: 'I understand that filing false DMCA takedown notices is illegal under 17 U.S.C. § 512(f) and may result in civil liability and account termination.' },
                { key: 'agreed3', text: 'I agree that FairPlay Africa may use my registration information as evidence of copyright ownership in legal proceedings.' },
              ].map(({ key, text }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setDeclaration((d) => ({ ...d, [key]: !d[key] }))}
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer"
                    style={{
                      backgroundColor: declaration[key] ? '#1B9E85' : '#1A2622',
                      border: `2px solid ${declaration[key] ? '#1B9E85' : '#2A3832'}`,
                    }}>
                    {declaration[key] && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: '#6B8F82' }}>{text}</p>
                </label>
              ))}
            </div>

            {/* Signature */}
            <div className="mt-5">
              <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>
                Full Legal Name (acts as your digital signature)
              </label>
              <input
                type="text"
                value={declaration.fullName}
                onChange={(e) => setDeclaration((d) => ({ ...d, fullName: e.target.value }))}
                placeholder="Type your full legal name"
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }}
                onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
                onBlur={(e) => e.target.style.borderColor = '#2A3832'}
              />
              <p className="text-xs mt-2" style={{ color: '#6B8F82' }}>
                Recorded with timestamp: {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{ backgroundColor: '#EF444415', border: '1px solid #EF444430' }}>
            <AlertTriangle size={16} style={{ color: '#EF4444' }} className="shrink-0 mt-0.5" />
            <p className="text-sm" style={{ color: '#EF4444' }}>
              False declarations are a federal offense. FairPlay Africa reserves the right to
              report fraudulent claims to law enforcement and pursue civil damages.
            </p>
          </div>

          <button onClick={handleDeclaration}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1B9E85' }}>
            <Shield size={18} />
            Sign Declaration & Continue
          </button>
        </div>
      )}

      {/* STEP 2 — Download Watermarked */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="p-8 rounded-2xl text-center"
            style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#1B9E8520' }}>
              <Shield size={32} style={{ color: '#1B9E85' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#F0F7F4' }}>
              Declaration Verified ✓
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6B8F82' }}>
              Your movie has been registered. Now download your watermarked copy and upload
              it to YouTube. The watermark is invisible to viewers but contains your ownership
              code — proving you are the original creator.
            </p>

            <div className="p-4 rounded-xl mb-6 text-left space-y-2"
              style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832' }}>
              {[
                'An invisible ownership code is burned into every frame',
                'Your name and registration date are stored in metadata',
                'Anyone claiming your movie on FairPlay Africa will be flagged as fraud',
                'Upload this protected copy to YouTube — we will monitor it automatically',
              ].map((point) => (
                <div key={point} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: '#1B9E85' }}>
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: '#6B8F82' }}>{point}</p>
                </div>
              ))}
            </div>

            <button onClick={handleDownload} disabled={watermarking}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{
                backgroundColor: watermarking ? '#0f5c4e' : '#1B9E85',
                cursor: watermarking ? 'not-allowed' : 'pointer',
              }}>
              <Upload size={18} style={{ transform: 'rotate(180deg)' }} />
              {watermarking ? 'Generating protected copy...' : 'Download Protected Copy'}
            </button>

            <button onClick={() => navigate('/dashboard/movies')}
              className="w-full py-3 rounded-xl font-medium mt-3"
              style={{ color: '#6B8F82' }}>
              Skip for now — go to my movies
            </button>
          </div>
        </div>
      )}
    </div>
  );
}