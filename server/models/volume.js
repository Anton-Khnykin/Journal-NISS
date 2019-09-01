'use strict';
module.exports = (sequelize, DataTypes) => {
  const Volume = sequelize.define('volume', {
    volume_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    number: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    year: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  Volume.associate = models => {
    Volume.hasMany(models.Issue, {
      foreignKey: 'volume_id',
      sourceKey: 'volume_id'
    });
  };
  return Volume;
};