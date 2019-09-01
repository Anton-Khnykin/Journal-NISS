'use strict';
module.exports = (sequelize, DataTypes) => {
  const AcademicTitle = sequelize.define('academic_title', {
    academic_title_id: {
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

  AcademicTitle.associate = models => {
    AcademicTitle.belongsTo(models.Credentials, {
      foreignKey: 'academic_title_id',
      targetKey: 'academic_title_id'
    });
  };

  return AcademicTitle;
};