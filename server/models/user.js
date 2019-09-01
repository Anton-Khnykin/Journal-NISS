'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    user_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    google_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    facebook_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    salt: {
      type: DataTypes.STRING(29),
      allowNull: true
    },
    credentials_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('NOW')
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  User.associate = models => {
    User.belongsTo(models.IssueDecision, {
      foreignKey: 'user_id',
      targerKey: 'user_id'
    });
    User.belongsTo(models.Message, {
      foreignKey: 'user_id',
      targerKey: 'user_id'
    });
    User.hasOne(models.Credentials, {
      foreignKey: 'credentials_id',
      sourceKey: 'credentials_id'
    });
    User.hasMany(models.UserRole, {
      foreignKey: 'user_id',
      sourceKey: 'user_id'
    });
    User.hasMany(models.UserSubmission, {
      foreignKey: 'user_id',
      sourceKey: 'user_id'
    });
    User.hasMany(models.UserSubscription, {
      foreignKey: 'user_id',
      sourceKey: 'user_id'
    });
  };
  return User;
};