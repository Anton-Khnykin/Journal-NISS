import { afterIssueUpdate } from '../hooks';

module.exports = (sequelize, DataTypes) => {
  const Issue = sequelize.define('issue', {
    issue_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    volume_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    number_general: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('NOW')
    },
    publication_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    issue_status_id: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_published_on_site: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true
    },
    cover: {
      type: DataTypes.BLOB,
      allowNull: true
    },
  }, {
    freezeTableName: true,
    timestamps: false,
    hooks: {
      afterUpdate: afterIssueUpdate
    }
  });

  Issue.associate = models => {
    Issue.hasOne(models.Volume, {
      foreignKey: 'volume_id',
      sourceKey: 'volume_id'
    });
    Issue.hasOne(models.IssueStatus, {
      foreignKey: 'issue_status_id',
      sourceKey: 'issue_status_id'
    });
    Issue.hasOne(models.File, {
      foreignKey: 'file_id',
      sourceKey: 'file_id'
    });
    Issue.hasMany(models.IssueDecision, {
      foreignKey: 'issue_id',
      sourceKey: 'issue_id'
    });
    Issue.hasMany(models.IssueSubmission, {
      foreignKey: 'issue_id',
      sourceKey: 'issue_id'
    });
  };

  return Issue;
};
