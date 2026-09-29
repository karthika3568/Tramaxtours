import { useState, useRef } from 'react';
import Modal from '../../ui/Modal';
import mediaService from '../../../services/mediaService';

export default function MediaUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB maximum upload limit.');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClearSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    handleClearSelection();
    setAltText('');
    setCaption('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (altText.trim()) {
        formData.append('alt_text', altText.trim());
      }
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }

      const uploadedMedia = await mediaService.uploadMedia(formData);

      handleClearSelection();
      setAltText('');
      setCaption('');
      onUploadSuccess(uploadedMedia);
      onClose();
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload media. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload New Media Asset"
      size="md"
    >
      <form onSubmit={handleSubmit} className="media-upload-form">
        {uploadError && (
          <div className="upload-error-alert" role="alert">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <span>{uploadError}</span>
          </div>
        )}

        {/* File Drop / Selection Area */}
        <div className="upload-dropzone-box">
          <input
            ref={fileInputRef}
            type="file"
            id="media-file-input"
            className="file-hidden-input"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
            disabled={isUploading}
          />

          {selectedFile ? (
            <div className="upload-selected-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="Upload preview" className="selected-img-preview" />
              ) : (
                <div className="selected-doc-icon">📄</div>
              )}
              <div className="selected-meta-info">
                <span className="selected-filename">{selectedFile.name}</span>
                <span className="selected-filesize">
                  {(selectedFile.size / 1024).toFixed(1)} KB ({selectedFile.type || 'Unknown type'})
                </span>
                <button
                  type="button"
                  className="btn btn-link remove-file-btn"
                  onClick={handleClearSelection}
                  disabled={isUploading}
                >
                  Change / Remove File
                </button>
              </div>
            </div>
          ) : (
            <label htmlFor="media-file-input" className="upload-dropzone-label">
              <div className="dropzone-icon" aria-hidden="true">📁</div>
              <span className="dropzone-prompt">
                <strong>Click to browse</strong> or drag & drop file here
              </span>
              <span className="dropzone-hint">
                Supported: JPEG, PNG, WEBP, SVG, GIF, PDF (Max 10 MB)
              </span>
            </label>
          )}
        </div>

        {/* Metadata Inputs */}
        <div className="form-group">
          <label htmlFor="media-alt-text" className="form-label">
            Alt Text (Accessibility Description)
          </label>
          <input
            type="text"
            id="media-alt-text"
            className="form-input"
            placeholder="e.g. Scenic sunset over Sigiriya rock fortress"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            maxLength={255}
            disabled={isUploading}
          />
          <span className="form-hint">Used by screen readers and for SEO. Max 255 characters.</span>
        </div>

        <div className="form-group">
          <label htmlFor="media-caption" className="form-label">
            Caption (Optional Display Title)
          </label>
          <input
            type="text"
            id="media-caption"
            className="form-input"
            placeholder="e.g. Sigiriya Rock Fortress, Central Province"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={255}
            disabled={isUploading}
          />
        </div>

        {/* Form Actions */}
        <div className="modal-actions-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary upload-submit-btn"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading to Server...' : 'Upload Asset'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
