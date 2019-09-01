'use strict';
module.exports = (sequelize, DataTypes) => {
  const SubmissionStatus = sequelize.define('submission_status', {
    submission_status_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  SubmissionStatus.associate = models => {
    SubmissionStatus.belongsTo(models.Submission, {
      foreignKey: 'submission_status_id',
      targetKey: 'submission_status_id'
    });
    SubmissionStatus.belongsTo(models.SubmissionHistory, {
      foreignKey: 'submission_status_id',
      targetKey: 'submission_status_id'
    });
  };

  return SubmissionStatus;
};