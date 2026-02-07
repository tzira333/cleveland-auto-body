'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

interface ScheduleFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceType: string;
  vehicleInfo: string;
  additionalNotes: string;
  preferredDate: string;
  preferredTime: string;
  uploadFiles: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

export default function ScheduleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    serviceType: 'collision-repair',
    vehicleInfo: '',
    additionalNotes: '',
    preferredDate: '',
    preferredTime: '',
    uploadFiles: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Format phone number as user types
  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      
      // Clear uploaded files if checkbox is unchecked
      if (name === 'uploadFiles' && !checked) {
        setUploadedFiles([]);
        setUploadError('');
      }
    } else if (name === 'phoneNumber') {
      const formatted = formatPhoneInput(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadError('');
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const maxFiles = 10;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const newFiles: UploadedFile[] = [];
    const currentCount = uploadedFiles.length;

    if (currentCount + files.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    Array.from(files).forEach((file) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`${file.name}: File type not supported. Please upload images or PDF/Word documents.`);
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        setUploadError(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      // Create preview for images
      const uploadedFile: UploadedFile = { file };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          uploadedFile.preview = reader.result as string;
          setUploadedFiles((prev) => [...prev, uploadedFile]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(uploadedFile);
      }
    });

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadError('');
  };

  const generateConfirmationNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `SCH-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      submitData.append('customer_name', formData.fullName);
      submitData.append('customer_phone', formData.phoneNumber);
      submitData.append('customer_email', formData.email);
      submitData.append('service_type', formData.serviceType);
      submitData.append('vehicle_info', formData.vehicleInfo);
      submitData.append('damage_description', formData.additionalNotes);
      submitData.append('appointment_date', formData.preferredDate);
      submitData.append('appointment_time', formData.preferredTime);
      submitData.append('status', 'pending');

      // Add files if any
      if (formData.uploadFiles && uploadedFiles.length > 0) {
        uploadedFiles.forEach((uploadedFile, index) => {
          submitData.append(`file_${index}`, uploadedFile.file);
        });
        submitData.append('file_count', uploadedFiles.length.toString());
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit appointment');
      }

      const result = await response.json();

      // Generate confirmation number
      const confNumber = generateConfirmationNumber();
      setConfirmationNumber(confNumber);

      // Store submitted data for display
      setSubmittedData({
        ...formData,
        filesUploaded: uploadedFiles.length,
        confirmationNumber: confNumber,
      });

      // Show confirmation
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error submitting appointment:', error);
      alert('Failed to submit appointment. Please try again or call us at (216) 481-8696.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  // Confirmation Page
  if (showConfirmation && submittedData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden no-print">
            {/* Success Header */}
            <div className="bg-green-600 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Appointment Scheduled!
              </h2>
              <p className="text-green-100 text-lg">
                We've received your request and will contact you shortly
              </p>
            </div>

            {/* Confirmation Details */}
            <div className="px-6 py-8">
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                <p className="text-sm text-blue-800 font-semibold mb-1">
                  Confirmation Number
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {confirmationNumber}
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Your Information
              </h3>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{submittedData.fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{submittedData.phoneNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{submittedData.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Service Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {submittedData.serviceType.replace('-', ' ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
                  <dd className="mt-1 text-sm text-gray-900">{submittedData.vehicleInfo}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Preferred Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(submittedData.preferredDate).toLocaleDateString()} at{' '}
                    {submittedData.preferredTime}
                  </dd>
                </div>
                {submittedData.filesUploaded > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Files Uploaded</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {submittedData.filesUploaded} file(s) attached
                    </dd>
                  </div>
                )}
              </dl>

              {submittedData.additionalNotes && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {submittedData.additionalNotes}
                  </dd>
                </div>
              )}

              {/* Urgent Call to Confirm */}
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
                <h4 className="text-lg font-semibold text-red-900 mb-2">
                  📞 Important: Please Call to Confirm
                </h4>
                <p className="text-sm text-red-800 mb-3">
                  To ensure we can accommodate your preferred date and time, please call
                  us as soon as possible.
                </p>
                <a
                  href="tel:+12164818696"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Call Now: (216) 481-8696
                </a>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Confirmation
                </button>
                <button
                  onClick={handleReturnHome}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Schedule Form
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Schedule an Estimate
            </h1>
            <p className="text-blue-100">
              Fill out the form below and we'll contact you to confirm your appointment
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Service Type */}
              <div>
                <label
                  htmlFor="serviceType"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Service Type <span className="text-red-600">*</span>
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="collision-repair">Collision Repair</option>
                  <option value="paintless-dent">Paintless Dent Removal</option>
                  <option value="frame-straightening">Frame Straightening</option>
                  <option value="paint-refinishing">Paint & Refinishing</option>
                  <option value="insurance-claims">Insurance Claims Assistance</option>
                  <option value="free-estimate">Free Estimate</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="216-555-1234"
                  maxLength={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Vehicle Information */}
              <div>
                <label
                  htmlFor="vehicleInfo"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Vehicle Information <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="vehicleInfo"
                  name="vehicleInfo"
                  value={formData.vehicleInfo}
                  onChange={handleInputChange}
                  required
                  placeholder="2020 Honda Accord"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Preferred Date */}
              <div>
                <label
                  htmlFor="preferredDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Preferred Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Preferred Time */}
              <div>
                <label
                  htmlFor="preferredTime"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Preferred Time <span className="text-red-600">*</span>
                </label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                </select>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mt-6">
              <label
                htmlFor="additionalNotes"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Additional Notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the damage..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* File Upload Checkbox */}
            <div className="mt-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="uploadFiles"
                  checked={formData.uploadFiles}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Upload pictures and/or documents
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Help us better understand your needs by uploading photos of the damage
                    or relevant documents (Max 10 files, 10MB each)
                  </p>
                </div>
              </label>
            </div>

            {/* File Upload Section */}
            {formData.uploadFiles && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <label
                    htmlFor="fileUpload"
                    className="mt-2 block text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    <span className="text-blue-600 hover:text-blue-700">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Images (JPG, PNG, GIF, WebP) or Documents (PDF, DOC, DOCX) up to 10MB
                  </p>
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Upload Error */}
                {uploadError && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                    {uploadError}
                  </div>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Uploaded Files ({uploadedFiles.length}/10):
                    </p>
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          {uploadedFile.preview ? (
                            <img
                              src={uploadedFile.preview}
                              alt={uploadedFile.file.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {uploadedFile.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Schedule Appointment'
                )}
              </button>
            </div>

            {/* Contact Information */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Questions? Call us at{' '}
                <a
                  href="tel:+12164818696"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  (216) 481-8696
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
