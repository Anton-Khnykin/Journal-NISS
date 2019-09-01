'use strict';
module.exports = (sequelize, DataTypes) => {
  const IssueSubmission = sequelize.define('issue_submission', {
    issue_submission_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    issue_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pages: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submission_search: {
      type: 'tsvector',
      allowNull: true
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  IssueSubmission.associate = models => {
    IssueSubmission.hasOne(models.Submission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
    IssueSubmission.hasOne(models.Issue, {
      foreignKey: 'issue_id',
      sourceKey: 'issue_id'
    });
      IssueSubmission.hasOne(models.File, {
        foreignKey: 'file_id',
        sourceKey: 'file_id'
    });
  };
  return IssueSubmission;
};