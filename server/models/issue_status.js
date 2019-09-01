'use strict';
module.exports = (sequelize, DataTypes) => {
  const IssueStatus = sequelize.define('issue_status', {
    issue_status_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.SMALLINT
    },
    issue_status: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  IssueStatus.associate = models => {
    IssueStatus.belongsTo(models.Issue, {
      foreignKey: 'issue_status_id',
      targetKey: 'issue_status_id'
    });
  };

  return IssueStatus;
};