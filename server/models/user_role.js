'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('user_role', {
    user_role_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    role_id: {
      type: DataTypes.SMALLINT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  UserRole.associate = models => {
    UserRole.hasOne(models.User, {
      foreignKey: 'user_id',
      sourceKey: 'user_id'
    });
    UserRole.hasOne(models.Role, {
      foreignKey: 'role_id',
      sourceKey: 'role_id'
    });
  };
  return UserRole;
};