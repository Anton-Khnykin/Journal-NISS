'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserSubscription = sequelize.define('user_subscription', {
    user_subscription_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subscription_id: {
      type: DataTypes.SMALLINT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  UserSubscription.associate = models => {
    UserSubscription.hasOne(models.User, {
      foreignKey: 'user_id',
      sourceKey: 'user_id'
    });
    UserSubscription.hasOne(models.Subscription, {
      foreignKey: 'subscription_id',
      sourceKey: 'subscription_id'
    });
  };
  return UserSubscription;
};