import mongoose from 'mongoose';
const bandFileSchema = new mongoose.Schema({
  bandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Band', required: true, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  resourceType: { type: String, enum: ['image','video','raw'], required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export default mongoose.model('BandFile', bandFileSchema);
