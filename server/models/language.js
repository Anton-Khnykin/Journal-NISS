'use strict';
module.exports = (sequelize, DataTypes) => {
  const Language = sequelize.define('language', {
    language_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    language_code: {
      type: DataTypes.STRING(2),
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  Language.associate = models => {
    Language.belongsTo(models.Submission, {
      foreignKey: 'submission_id',
      targetKey: 'submission_id',
    });
    Language.belongsTo(models.Keyword, {
      foreignKey: 'language_id',
      targetKey: 'language_id',
    });
  };

  return Language;
};