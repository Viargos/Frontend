import React, { useState } from 'react';
import { MediaManager, MediaUploader, MediaGallery } from './index';
import type { MediaItem } from './index';

// Example 1: Complete Media Manager
export const CompleteMediaManagerExample = () => {
  const [journeyMedia, setJourneyMedia] = useState<MediaItem[]>([]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Journey Media Manager</h2>
      <MediaManager
        initialMedia={journeyMedia}
        onMediaChange={setJourneyMedia}
        uploadFolder="journeys"
        fileType="images"
        maxFiles={8}
        maxFileSize={5 * 1024 * 1024} // 5MB
        allowMultiple={true}
        allowReorder={true}
        galleryColumns={4}
        className="border rounded-lg p-4"
      />
    </div>
  );
};

// Example 2: Simple Image Uploader
export const SimpleImageUploaderExample = () => {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleUploadComplete = (urls: string[]) => {
    setUploadedUrls(prev => [...prev, ...urls]);
  };

  const handleUploadError = (error: string) => {
    alert(`Upload failed: ${error}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Simple Image Uploader</h2>
      <MediaUploader
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        multiple={true}
        accept="image/*"
        maxFiles={3}
        folder="profile-images"
        fileType="images"
        showPreview={true}
        className="mb-4"
      />
      
      {uploadedUrls.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Uploaded URLs:</h3>
          <ul className="space-y-1">
            {uploadedUrls.map((url, index) => (
              <li key={index} className="text-sm text-blue-600 break-all">
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Example 3: Media Gallery Only
export const MediaGalleryOnlyExample = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      url: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Image+1',
      name: 'Sample Image 1.jpg',
      size: 245760,
      type: 'image/jpeg',
    },
    {
      id: '2',
      url: 'https://via.placeholder.com/400x600/4ECDC4/FFFFFF?text=Image+2',
      name: 'Sample Image 2.jpg',
      size: 389120,
      type: 'image/jpeg',
    },
    {
      id: '3',
      url: 'https://via.placeholder.com/600x400/45B7D1/FFFFFF?text=Image+3',
      name: 'Sample Image 3.jpg',
      size: 512000,
      type: 'image/jpeg',
    },
  ]);

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleReorder = (reorderedItems: MediaItem[]) => {
    setMediaItems(reorderedItems);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Media Gallery Only</h2>
      <MediaGallery
        items={mediaItems}
        onDelete={handleDelete}
        onReorder={handleReorder}
        columns={3}
        showLightbox={true}
        showControls={true}
        allowReorder={true}
      />
    </div>
  );
};

// Example 4: Video Upload Manager
export const VideoUploadExample = () => {
  const [videoMedia, setVideoMedia] = useState<MediaItem[]>([]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Video Upload Manager</h2>
      <MediaManager
        initialMedia={videoMedia}
        onMediaChange={setVideoMedia}
        uploadFolder="videos"
        fileType="videos"
        maxFiles={3}
        maxFileSize={100 * 1024 * 1024} // 100MB
        acceptedTypes="video/mp4,video/mov,video/avi"
        allowMultiple={false} // One at a time for large videos
        galleryColumns={2}
      />
    </div>
  );
};

// Example 5: Document Manager
export const DocumentManagerExample = () => {
  const [documents, setDocuments] = useState<MediaItem[]>([]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Document Manager</h2>
      <MediaManager
        initialMedia={documents}
        onMediaChange={setDocuments}
        uploadFolder="documents"
        fileType="documents"
        maxFiles={10}
        maxFileSize={10 * 1024 * 1024} // 10MB
        allowMultiple={true}
        allowReorder={false}
        showGallery={true}
        galleryColumns={1}
      />
    </div>
  );
};

// Example 6: Profile Picture Uploader (Single Image)
export const ProfilePictureExample = () => {
  const [profileImage, setProfileImage] = useState<MediaItem[]>([]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profile Picture</h2>
      <MediaManager
        initialMedia={profileImage}
        onMediaChange={setProfileImage}
        uploadFolder="profile-pictures"
        fileType="images"
        maxFiles={1}
        acceptedTypes="image/jpeg,image/png,image/webp"
        allowMultiple={false}
        allowReorder={false}
        galleryColumns={1}
        className="border-2 border-dashed border-gray-300 rounded-lg"
      />
    </div>
  );
};

// Main component showcasing all examples
export const MediaComponentsShowcase = () => {
  const [activeExample, setActiveExample] = useState('complete');

  const examples = [
    { id: 'complete', label: 'Complete Media Manager', component: CompleteMediaManagerExample },
    { id: 'uploader', label: 'Simple Uploader', component: SimpleImageUploaderExample },
    { id: 'gallery', label: 'Gallery Only', component: MediaGalleryOnlyExample },
    { id: 'video', label: 'Video Manager', component: VideoUploadExample },
    { id: 'documents', label: 'Document Manager', component: DocumentManagerExample },
    { id: 'profile', label: 'Profile Picture', component: ProfilePictureExample },
  ];

  const ActiveComponent = examples.find(ex => ex.id === activeExample)?.component || CompleteMediaManagerExample;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example.id)}
                className={`
                  flex-shrink-0 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeExample === example.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default MediaComponentsShowcase;
