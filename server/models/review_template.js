'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReviewTemplate = sequelize.define('review_template', {
    review_template_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fields: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  ReviewTemplate.associate = models => {
    ReviewTemplate.hasOne(models.File, {
      foreignKey: 'file_id',
      sourceKey: 'file_id'
    });
  };
  return ReviewTemplate;
};