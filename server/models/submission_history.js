'use strict';
module.exports = (sequelize, DataTypes) => {
  const SubmissionHistory = sequelize.define('submission_history', {
    submission_history_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    submission_status_id: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('NOW')
    },
    review_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deadline_author: {
      type: DataTypes.DATE,
      allowNull: true
    },
    commentary: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  SubmissionHistory.associate = models => {
    SubmissionHistory.hasOne(models.Submission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
    SubmissionHistory.hasOne(models.SubmissionStatus, {
      as: 'status',
      foreignKey: 'submission_status_id',
      sourceKey: 'submission_status_id'
    });
    SubmissionHistory.hasMany(models.Review, {
      foreignKey: 'review_id',
      sourceKey: 'review_id'
    });
  };
  return SubmissionHistory;
};