'use strict';
module.exports = (sequelize, DataTypes) => {
  const SubmissionKeyword = sequelize.define('submission_keyword', {
    submission_keyword_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    keyword_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  SubmissionKeyword.associate = models => {
    SubmissionKeyword.hasOne(models.Submission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
    SubmissionKeyword.hasOne(models.Keyword, {
      foreignKey: 'keyword_id',
      sourceKey: 'keyword_id'
    });
  };
  return SubmissionKeyword;
};