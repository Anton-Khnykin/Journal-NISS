'use strict';
module.exports = (sequelize, DataTypes) => {
  const FileType = sequelize.define('file_type', {
    file_type_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    file_type_name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  FileType.associate = models => {
    FileType.belongsTo(models.SubmissionFile, {
      foreignKey: 'file_type_id',
      targetKey: 'file_type_id'
    });
  };

  return FileType;
};