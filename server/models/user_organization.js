'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserOrganization = sequelize.define('user_organization', {
    user_organization_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    credentials_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    organization_name_ru: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    organization_name_en: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    organization_address_ru: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    organization_address_en: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    person_position_ru: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    person_position_en: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false,
    // modelName: UserOrganization
  });
  UserOrganization.associate = models => {
    UserOrganization.hasOne(models.Credentials, {
      foreignKey: 'credentials_id',
      sourceKey: 'credentials_id'
    });
  };
  return UserOrganization;
};