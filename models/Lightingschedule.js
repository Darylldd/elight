import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const LightingSchedule = sequelize.define("LightingSchedule", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('on', 'off', 'dim'),
    allowNull: false
  },
  brightness: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  scheduledTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  days: {
    type: DataTypes.STRING, // comma-separated days: mon,tue,wed,etc
    defaultValue: 'mon,tue,wed,thu,fri,sat,sun'
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

export { sequelize };