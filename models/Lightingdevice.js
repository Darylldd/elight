import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const LightingDevice = sequelize.define("LightingDevice", {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('on', 'off', 'dimmed', 'error'),
    defaultValue: 'off'
  },
  brightness: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: { min: 0, max: 100 }
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#ffffff'
  },
  powerConsumption: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  location: {
    type: DataTypes.STRING
  },
  lastSeen: {
    type: DataTypes.DATE
  }
});

export { sequelize };