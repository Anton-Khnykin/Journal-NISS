'use strict';
module.exports = (sequelize, DataTypes) => {
  const Keyword = sequelize.define('keyword', {
    keyword_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    word: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    language_id: {
      type: DataTypes.SMALLINT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  Keyword.associate = models => {
    Keyword.hasOne(models.Language, {
      foreignKey: 'language_id',
      sourceKey: 'language_id'
  });
  };
  return Keyword;
};