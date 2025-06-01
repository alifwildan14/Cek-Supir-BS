// models/Driver.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriver extends Document {
  driverName: string;
  plateNumber: string;
  kirExpiration: Date; // Menggunakan Date untuk masa berlaku KIR
  busYear: number;
}

const DriverSchema: Schema = new Schema({
  driverName: { type: String, required: true },
  plateNumber: { type: String, required: true, unique: true }, // Plat nomor unik
  kirExpiration: { type: Date, required: true },
  busYear: { type: Number, required: true },
});

const Driver: Model<IDriver> = mongoose.models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);

export default Driver;