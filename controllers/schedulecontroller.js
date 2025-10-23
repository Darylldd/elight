import { LightingSchedule } from "../models/Lightingschedule.js";

export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await LightingSchedule.findAll();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const schedule = await LightingSchedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const schedule = await LightingSchedule.findByPk(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    await schedule.update(req.body);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await LightingSchedule.findByPk(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    await schedule.destroy();
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};