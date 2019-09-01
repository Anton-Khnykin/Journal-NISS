'use strict';
module.exports = (sequelize, DataTypes) => {
  const Credentials = sequelize.define('credentials', {
    credentials_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    first_name_ru: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    first_name_en: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    middle_name_ru: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    middle_name_en: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_name_ru: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    last_name_en: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(254),
      allowNull: true
    },
    country_id: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    academic_degree_id: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    academic_title_id: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    scientific_interests_ru: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scientific_interests_en: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

  Credentials.associate = models => {
    Credentials.hasMany(models.AuthorSubmission, {
      foreignKey: 'credentials_id',
      sourceKey: 'credentials_id'
    });
    Credentials.hasOne(models.AcademicDegree, {
      foreignKey: 'academic_degree_id',
      sourceKey: 'academic_degree_id'
    });
    Credentials.hasOne(models.AcademicTitle, {
      foreignKey: 'academic_title_id',
      sourceKey: 'academic_title_id'
    });
    Credentials.hasOne(models.Country, {
      foreignKey: 'country_id',
      sourceKey: 'country_id'
    });
    Credentials.belongsTo(models.Review, {
      foreignKey: 'credentials_id',
      targetKey: 'credentials_id'
    });
    Credentials.belongsTo(models.User, {
      foreignKey: 'credentials_id',
      targetKey: 'credentials_id'
    });
    Credentials.hasMany(models.UserOrganization, {
      as: 'organizations',
      foreignKey: 'credentials_id',
      sourceKey: 'credentials_id'
    });
  };

  return Credentials;
};