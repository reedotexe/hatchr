import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function ImageUpload({ onFileSelect, className = '', preview = null }) {
  const [previewUrl, setPreviewUrl] = useState(preview)
  
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.[0]) {
      const file = acceptedFiles[0]
      onFileSelect(file)
      // Create preview URL
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1
  })

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-[300px] mx-auto rounded"
              onLoad={() => {
                // Clean up old preview URL when new image loads
                if (previewUrl !== preview) {
                  URL.revokeObjectURL(previewUrl)
                }
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm">
              Click or drop to change
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            {isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <p>Drag and drop an image/video here, or click to select</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}