'use strict';
module.exports = (sequelize, DataTypes) => {
  const Recommendation = sequelize.define('recommendation', {
    recommendation_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    recommendation: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  Recommendation.associate = models => {
    Recommendation.belongsTo(models.Review, {
      foreignKey: 'recommendation_id',
      targetKey: 'recommendation_id'
    });
  };

  return Recommendation;
};