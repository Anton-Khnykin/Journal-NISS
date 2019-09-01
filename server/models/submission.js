'use strict';
module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define('submission', {
    submission_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    submission_date: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('NOW'),
      allowNull: false
    },
    title_ru: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    title_en: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    abstract_ru: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    abstract_en: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    language_id: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    submission_status_id: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    keywords_ru: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    keywords_en: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  Submission.associate = models => {
    Submission.hasMany(models.AuthorSubmission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
    Submission.belongsTo(models.IssueSubmission, {
      foreignKey: 'submission_id',
      targetKey: 'submission_id'
    });
    Submission.belongsTo(models.Message, {
      foreignKey: 'submission_id',
      targetKey: 'submission_id'
    });
    Submission.belongsTo(models.Review, {
      foreignKey: 'submission_id',
      targetKey: 'submission_id'
    });
    Submission.hasOne(models.SubmissionStatus, {
      as: 'status',
      foreignKey: 'submission_status_id',
      sourceKey: 'submission_status_id'
    });
    Submission.hasOne(models.Language, {
      foreignKey: 'language_id',
      sourceKey: 'submission_id'
    });
    Submission.hasMany(models.SubmissionFile, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
    Submission.belongsTo(models.SubmissionHistory, {
      foreignKey: 'submission_id',
      targetKey: 'submission_id'
    });
    Submission.hasMany(models.SubmissionKeyword, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
    Submission.hasMany(models.UserSubmission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
  };

  return Submission;
};