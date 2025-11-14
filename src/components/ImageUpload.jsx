import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageUpload({ onImageCapture, onPDFUpload }) {
  const [previewImage, setPreviewImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type === 'application/pdf') {
      setPreviewImage(null)
      onPDFUpload(file)
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target.result)
        onImageCapture(event.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Format non supporté. Utilisez JPG, PNG ou PDF')
    }
  }

  return (
    <div className='space-y-4'>
      <div>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*,application/pdf'
          onChange={handleFileUpload}
          className='hidden'
          id='file-upload'
        />
        <label
          htmlFor='file-upload'
          className='btn-primary inline-flex items-center gap-2 cursor-pointer'
        >
          <Upload size={20} />
          Choisir Image ou PDF
        </label>
      </div>

      {previewImage && (
        <div className='relative'>
          <img src={previewImage} alt='Preview' className='w-full rounded-lg max-h-96 object-contain border-2 border-senegal-green' />
          <button
            onClick={() => {
              setPreviewImage(null)
              toast.success('Image supprimée')
            }}
            className='absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600'
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  )
}