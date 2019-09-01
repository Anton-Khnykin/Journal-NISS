'use strict';
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('review', {
    review_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    credentials_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recommendation_id: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    deadline_reviewer: {
      type: DataTypes.DATE,
      allowNull: false
    },
    review_file_signed: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    review_file: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    review_status_id: {
      type: DataTypes.SMALLINT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  Review.associate = models => {
    Review.hasOne(models.Recommendation, {
      foreignKey: 'recommendation_id',
      sourceKey: 'recommendation_id'
    });
    Review.hasOne(models.Submission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
    Review.hasOne(models.Credentials, {
      foreignKey: 'credentials_id',
      sourceKey: 'credentials_id'
    });
    Review.hasOne(models.ReviewStatus, {
      foreignKey: 'review_status_id',
      sourceKey: 'review_status_id'
    });
    Review.hasOne(models.File, {
      foreignKey: 'file_id',
      sourceKey: 'review_file'
    });
    Review.hasOne(models.File, {
      foreignKey: 'file_id',
      sourceKey: 'review_file_signed'
    });
    Review.belongsTo(models.SubmissionHistory, {
      foreignKey: 'review_id',
      targetKey: 'review_id'
    });
  };
  return Review;
};