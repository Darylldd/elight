import { LightingDevice } from "../models/Lightingdevice.js";
import { LightingHistory } from "../models/Lightinghistory.js";

// Get all devices
export const getAllDevices = async (req, res) => {
  try {
    const devices = await LightingDevice.findAll();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get device by ID
export const getDeviceById = async (req, res) => {
  try {
    const device = await LightingDevice.findByPk(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update device status
export const updateDeviceStatus = async (req, res) => {
  try {
    const { status, brightness, color } = req.body;
    const device = await LightingDevice.findByPk(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Log the action in history
    await LightingHistory.create({
      deviceId: device.deviceId,
      action: `status_changed_to_${status}`,
      brightness: brightness || device.brightness,
      color: color || device.color
    });

    await device.update({
      status,
      ...(brightness !== undefined && { brightness }),
      ...(color !== undefined && { color }),
      lastSeen: new Date()
    });

    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get device history
export const getDeviceHistory = async (req, res) => {
  try {
    const device = await LightingDevice.findByPk(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    const history = await LightingHistory.findAll({
      where: { deviceId: device.deviceId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};