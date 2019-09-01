'use strict';
module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('country', {
    country_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    name_ru: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    name_en: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  Country.associate = models => {
    Country.belongsTo(models.Credentials, {
      foreignKey: 'country_id',
      targetKey: 'country_id'
    });
  };

  return Country;
};