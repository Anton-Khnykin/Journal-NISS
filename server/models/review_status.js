'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReviewStatus = sequelize.define('review_status', {
    review_status_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    review_status: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  ReviewStatus.associate = models => {
    ReviewStatus.belongsTo(models.Review, {
      foreignKey: 'review_status_id',
      targetKey: 'review_status_id'
    });
  };

  return ReviewStatus;
};