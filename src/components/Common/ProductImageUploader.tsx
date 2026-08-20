import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Sparkles,
  FolderOpen,
  Camera,
  Star,
  Plus,
  Layers,
  Trash2,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';

interface ProductImageUploaderProps {
  currentImage?: string;
  gallery?: string[];
  onImagesChange?: (mainImage: string, gallery: string[]) => void;
  onImageChange?: (imageUrl: string) => void;
  category?: string;
  label?: string;
}

const PRESET_HARDWARE_IMAGES = [
  { name: 'Processor / CPU', cat: 'processor', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80' },
  { name: 'Graphics Card / GPU', cat: 'gpu', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80' },
  { name: 'Laptop / Notebook', cat: 'laptop', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80' },
  { name: 'Motherboard', cat: 'motherboard', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80' },
  { name: 'RAM Memory', cat: 'ram', url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80' },
  { name: 'NVMe SSD Storage', cat: 'storage', url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Gaming Monitor', cat: 'monitor', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80' },
  { name: 'Gaming Casing', cat: 'casing', url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Power Supply / PSU', cat: 'power_supply', url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mechanical Keyboard', cat: 'keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80' },
];

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  currentImage = '',
  gallery = [],
  onImagesChange,
  onImageChange,
  category,
  label = 'প্রোডাক্টের ছবি ও গ্যালারি (Multi-Image Upload)',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to build images array from props
  const buildImagesList = (main: string, extra: string[]): string[] => {
    const list: string[] = [];
    if (main && typeof main === 'string' && main.trim()) {
      list.push(main.trim());
    }
    if (extra && Array.isArray(extra)) {
      extra.forEach((img) => {
        if (img && typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list;
  };

  const [images, setImages] = useState<string[]>(() => buildImagesList(currentImage, gallery));

  // Sync internal state when external props change meaningfully
  useEffect(() => {
    const fromProps = buildImagesList(currentImage, gallery);
    setImages(fromProps);
  }, [currentImage, JSON.stringify(gallery)]);

  // Notify parent component cleanly
  const notifyParent = (newImagesList: string[]) => {
    const validImages = newImagesList.filter((img) => typeof img === 'string' && img.trim().length > 0);
    const main = validImages[0] || '';
    const extraGallery = validImages.slice(1);

    if (onImagesChange) {
      onImagesChange(main, extraGallery);
    } else if (onImageChange) {
      onImageChange(main);
    }
  };

  const updateImages = (newImagesList: string[]) => {
    setImages(newImagesList);
    notifyParent(newImagesList);
  };

  // Convert File to compressed base64 data URL with canvas resize
  const processFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve('');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        if (!rawDataUrl) {
          resolve('');
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 850; // High resolution, ultra-compact base64 size
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.82);
              resolve(compressed);
            } else {
              resolve(rawDataUrl);
            }
          } catch (canvasErr) {
            console.warn('Canvas optimization fallback:', canvasErr);
            resolve(rawDataUrl);
          }
        };

        img.onerror = () => {
          resolve(rawDataUrl);
        };
        img.src = rawDataUrl;
      };

      reader.onerror = () => {
        resolve('');
      };

      reader.readAsDataURL(file);
    });
  };

  // Process multiple files in parallel
  const handleProcessFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    try {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((f) => f.type.startsWith('image/'));

      if (validFiles.length === 0) {
        alert('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WEBP, GIF) নির্বাচন করুন।');
        setIsProcessing(false);
        return;
      }

      const processedUrls = await Promise.all(validFiles.map((f) => processFileToDataUrl(f)));
      const successfulUrls = processedUrls.filter((url) => Boolean(url && url.trim().length > 0));

      if (successfulUrls.length === 0) {
        alert('ছবি প্রসেস করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setIsProcessing(false);
        return;
      }

      // Append newly uploaded images to the current images list
      const updated = [...images];
      successfulUrls.forEach((url) => {
        if (!updated.includes(url)) {
          updated.push(url);
        }
      });

      updateImages(updated);
      setUploadSuccessMessage(`${successfulUrls.length}টি নতুন ছবি সফলভাবে গ্যালারিতে যোগ হয়েছে!`);
      setTimeout(() => setUploadSuccessMessage(null), 3500);
    } catch (err) {
      console.error('File upload error:', err);
      alert('ছবি আপলোডে কোনো সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Add direct online image link (URL)
  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    const trimmed = urlInput.trim();
    if (!images.includes(trimmed)) {
      const updated = [...images, trimmed];
      updateImages(updated);
      setUploadSuccessMessage('অনলাইন ছবির লিংক সফলভাবে গ্যালারিতে যোগ হয়েছে!');
      setTimeout(() => setUploadSuccessMessage(null), 3000);
    }
    setUrlInput('');
  };

  // Set an image as primary cover photo (index 0)
  const handleSetAsMain = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    const updated = [item, ...rest];
    updateImages(updated);
  };

  // Remove a specific image
  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    updateImages(updated);
  };

  // Add preset hardware image
  const handleAddPreset = (url: string) => {
    if (!images.includes(url)) {
      const updated = [...images, url];
      updateImages(updated);
      setUploadSuccessMessage('রেডিমেড প্রিসেট ছবি গ্যালারিতে যোগ হয়েছে!');
      setTimeout(() => setUploadSuccessMessage(null), 2500);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Top Header Label & Counter */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-rose-400 font-black">*</span>
          {images.length > 0 && (
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              মোট {images.length}টি ছবি গ্যালারিতে আছে
            </span>
          )}
        </label>

        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>{showPresets ? 'প্রিসেট বন্ধ করুন' : 'রেডিমেড ছবি যোগ'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {uploadSuccessMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{uploadSuccessMessage}</span>
        </div>
      )}

      {/* Hidden Multi-File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center gap-4 ${
          isDragging
            ? 'border-rose-500 bg-rose-950/60 ring-2 ring-rose-500/30 scale-[1.01]'
            : images.length > 0
            ? 'border-emerald-500/60 bg-slate-900/90 hover:border-emerald-400 hover:bg-slate-900 shadow-md'
            : 'border-rose-500/50 bg-slate-900/90 hover:border-rose-500 hover:bg-slate-900 shadow-md'
        }`}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-rose-950/70 to-slate-900 border border-rose-500/30 flex flex-col items-center justify-center text-rose-400 shrink-0">
          {isProcessing ? (
            <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
          ) : (
            <Upload className="w-7 h-7 mb-1 text-rose-400 animate-pulse" />
          )}
          <span className="text-[10px] font-bold text-slate-300">
            {isProcessing ? 'আপলোড হচ্ছে...' : 'ফাইল নির্বাচন'}
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-black text-sm text-white flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-rose-500 shrink-0" />
              {images.length > 0
                ? 'আরও ছবি যোগ করতে এখানে ক্লিক করুন (বা ড্র্যাগ করুন)'
                : 'কম্পিউটার বা মোবাইল থেকে এক বা একাধিক ছবি সিলেক্ট করুন'}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            একসাথে একাধিক ছবি নির্বাচন করতে কিবোর্ডে <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700 text-amber-300">Ctrl</kbd> বা <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700 text-amber-300">Shift</kbd> চেপে সব ছবি একবারে বাছুন। বারবার ক্লিক করেও একাধিক ছবি যোগ করতে পারবেন।
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5 text-[10px] text-slate-400">
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono border border-slate-700">
              JPG, PNG, WEBP, GIF
            </span>
            <span>• যেকোনো সাইজ ও রেজোলিউশন সাপোর্ট করে</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isProcessing}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black rounded-xl transition shadow-md shadow-rose-950/50 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>আপলোড হচ্ছে...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>{images.length > 0 ? '+ আরও ছবি যোগ করুন' : '+ ছবি সিলেক্ট করুন'}</span>
            </>
          )}
        </button>
      </div>

      {/* Alternative: Add image URL input */}
      <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
        <LinkIcon className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddUrlImage();
            }
          }}
          placeholder="অথবা সরাসরি কোনো ছবির ওয়েব লিংক (URL) পেস্ট করুন: https://..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-hidden font-mono"
        />
        <button
          type="button"
          onClick={handleAddUrlImage}
          disabled={!urlInput.trim()}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>লিংক যোগ</span>
        </button>
      </div>

      {/* Uploaded Photos Gallery Grid */}
      {images.length > 0 && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-white">
              <Layers className="w-4 h-4 text-rose-500" />
              <span>আপলোডকৃত গ্যালারি ({images.length}টি ছবি যুক্ত আছে)</span>
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">
              #1 চিহ্নিত ছবিটি মূল কভার ছবি হিসেবে হোমপেজে ও কার্ডে প্রদর্শিত হবে
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((imgUrl, index) => {
              const isMain = index === 0;
              return (
                <div
                  key={`${imgUrl.slice(0, 30)}-${index}`}
                  className={`relative rounded-xl bg-slate-900 border p-2 flex flex-col items-center justify-between gap-2 transition group ${
                    isMain
                      ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/40 shadow-lg'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* Top Controls: Index & Cover Button */}
                  <div className="w-full flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      #{index + 1}
                    </span>
                    {isMain ? (
                      <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-slate-950" />
                        মূল কভার
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetAsMain(index)}
                        className="text-[9px] font-bold text-amber-400 hover:text-amber-300 bg-slate-800 hover:bg-amber-950/60 px-1.5 py-0.2 rounded transition cursor-pointer"
                        title="এই ছবিকে ১ নম্বর মূল কভার ছবি করুন"
                      >
                        কভার করুন
                      </button>
                    )}
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="w-full aspect-square bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-800/80">
                    <img
                      src={imgUrl}
                      alt={`Product Photo ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="w-full py-1 text-[10px] font-bold text-rose-400 hover:text-white bg-slate-800/80 hover:bg-rose-600 rounded-md transition flex items-center justify-center gap-1 cursor-pointer"
                    title="এই ছবিটি গ্যালারি থেকে মুছুন"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>ছবি মুছুন</span>
                  </button>
                </div>
              );
            })}

            {/* Quick Add More Tile */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-slate-700 hover:border-rose-500 bg-slate-900/60 hover:bg-slate-900 p-2 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer aspect-square"
            >
              <Plus className="w-6 h-6" />
              <span className="text-[10px] font-bold">+ আরও যোগ</span>
            </button>
          </div>
        </div>
      )}

      {/* Preset Quick Hardware Gallery Accordion */}
      {showPresets && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
          <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
            <span>রেডিমেড কম্পিউটার কম্পোনেন্ট ছবি (গ্যালারিতে যুক্ত করতে ক্লিক করুন):</span>
            <span className="text-[10px] text-slate-400">এক ক্লিকেই যুক্ত হবে</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PRESET_HARDWARE_IMAGES.map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleAddPreset(preset.url)}
                className={`p-1.5 rounded-lg border text-left flex flex-col items-center gap-1 transition cursor-pointer ${
                  images.includes(preset.url)
                    ? 'border-amber-400 bg-amber-950/40'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <span className="text-[10px] font-bold text-slate-300 text-center truncate w-full">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
