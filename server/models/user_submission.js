'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserSubmission = sequelize.define('user_submission', {
    user_submission_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  UserSubmission.associate = models => {
    UserSubmission.hasOne(models.User, {
      foreignKey: 'user_id',
      sourceKey: 'user_id'
    });
    UserSubmission.hasOne(models.Submission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
  };
  return UserSubmission;
};