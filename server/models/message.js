'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    message_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('NOW')
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  Message.associate = models => {
    Message.hasOne(models.User, {
      foreignKey: 'user_id',
      sourceKey: 'user_id'
    });
    Message.hasOne(models.Submission, {
      foreignKey: 'submission_id',
      sourceKey: 'submission_id'
    });
    Message.hasMany(models.MessageFile, {
      as: 'files',
      foreignKey: 'message_id',
      sourceKey: 'message_id'
    });
  };
  return Message;
};