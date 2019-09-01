'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('role', {
    role_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  Role.associate = models => {
    Role.belongsTo(models.UserRole, {
      foreignKey: 'role_id',
      targetKey: 'role_id'
    });
  };
  return Role;
};