import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/lib/api-helpers';

// Define Settings schema in-place since it's only used here
const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: String,
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

// GET: Get WhatsApp Setting
export async function GET() {
  try {
    await dbConnect();
    let setting = await Settings.findOne({ key: 'whatsapp' });
    return Response.json({ success: true, whatsapp: setting ? setting.value : '6281234567890' });
  } catch (err) {
    return errorResponse(err.message);
  }
}

// POST: Set WhatsApp Setting
export async function POST(request) {
  try {
    await dbConnect();
    const { whatsapp } = await request.json();

    let setting = await Settings.findOne({ key: 'whatsapp' });
    if (!setting) {
      setting = new Settings({ key: 'whatsapp', value: whatsapp });
    } else {
      setting.value = whatsapp;
    }

    await setting.save();
    return Response.json({ success: true, whatsapp: setting.value });
  } catch (err) {
    return errorResponse(err.message);
  }
}
