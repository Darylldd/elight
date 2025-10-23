import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const LightingHistory = sequelize.define("LightingHistory", {
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brightness: {
    type: DataTypes.INTEGER
  },
  color: {
    type: DataTypes.STRING
  },
  powerConsumed: {
    type: DataTypes.FLOAT
  },
  duration: {
    type: DataTypes.INTEGER // in minutes
  }
});

export { sequelize };