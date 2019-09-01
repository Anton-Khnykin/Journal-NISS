'use strict';
module.exports = (sequelize, DataTypes) => {
  const AuthorSubmission = sequelize.define('author_submission', {
    author_submission_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    credentials_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    author_position_in_credits: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    is_primary_contact: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  AuthorSubmission.associate = models => {
    AuthorSubmission.hasOne(models.Credentials, {
      foreignKey: 'credentials_id',
      sourceKey: 'credentials_id'
    });
    AuthorSubmission.hasOne(models.Submission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
  };

  return AuthorSubmission;
};