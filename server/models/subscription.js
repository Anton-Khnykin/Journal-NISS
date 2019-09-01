'use strict';
module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('subscription', {
    subscription_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  Subscription.associate = models => {
    Subscription.hasMany(models.UserSubscription, {
      foreignKey: 'subscription_id',
      sourceKey: 'subscription_id'
    });
  };
  return Subscription;
};