'use strict';
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('file', {
    file_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    file_data: {
      type: DataTypes.BLOB,
      allowNull: false
    },
    file_type: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  File.associate = models => {
    File.belongsTo(models.Issue, {
      foreignKey: 'file_id',
      targetKey: 'file_id'
    });
    File.belongsTo(models.IssueSubmission, {
      foreignKey: 'file_id',
      targetKey: 'file_id'
    });
    File.hasMany(models.MessageFile, {
      foreignKey: 'file_id',
      sourceKey: 'file_id'
    });
    File.belongsTo(models.Review, {
      foreignKey: 'file_id',
      targetKey: 'review_file'
    });
    File.belongsTo(models.Review, {
      foreignKey: 'file_id',
      targetKey: 'review_file_signed'
    });
    File.belongsTo(models.ReviewTemplate, {
      foreignKey: 'file_id',
      targetKey: 'file_id'
    });
    File.belongsTo(models.SubmissionFile, {
      foreignKey: 'file_id',
      targetKey: 'file_id'
    });
  };

  return File;
};