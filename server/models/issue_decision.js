'use strict';
module.exports = (sequelize, DataTypes) => {
  const IssueDecision = sequelize.define('issue_decision', {
    issue_decision_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    issue_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    commentary: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  IssueDecision.associate = models => {
    IssueDecision.hasOne(models.Issue, {
      foreignKey: 'issue_id',
      sourceKey: 'issue_id'
    });
    IssueDecision.hasOne(models.User, {
      foreignKey: 'user_id',
      sourceKey: 'user_id'
    });
  };

  return IssueDecision;
};