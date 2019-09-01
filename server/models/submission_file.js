'use strict';
module.exports = (sequelize, DataTypes) => {
  const SubmissionFile = sequelize.define('submission_file', {
    submission_file_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    file_type_id: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  SubmissionFile.associate = models => {
    SubmissionFile.hasOne(models.Submission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
    SubmissionFile.hasOne(models.FileType, {
      foreignKey: 'file_type_id',
      sourceKey: 'file_type_id'
    });
    SubmissionFile.hasOne(models.File, {
      foreignKey: 'file_id',
      sourceKey: 'file_id'
    });
  };
  return SubmissionFile;
};