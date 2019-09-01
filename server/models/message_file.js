'use strict';
module.exports = (sequelize, DataTypes) => {
  const MessageFile = sequelize.define('message_file', {
    message_file_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  MessageFile.associate = models => {
    MessageFile.hasOne(models.Message, {
      foreignKey: 'message_id',
      sourceKey: 'message_id'
    });
    MessageFile.hasOne(models.File, {
      foreignKey: 'file_id',
      sourceKey: 'file_id'
    });
  };
  return MessageFile;
};