'use strict';
module.exports = (sequelize, DataTypes) => {
  const AcademicDegree = sequelize.define('academic_degree', {
    academic_degree_id: {
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

  AcademicDegree.associate = models => {
    AcademicDegree.belongsTo(models.Credentials, {
      foreignKey: 'academic_degree_id',
      targetKey: 'academic_degree_id'
    });
  };

  return AcademicDegree;
};