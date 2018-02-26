// Mongoose schema 默认配置项

module.exports = {
  SCHEMA_OPTIONS: {
    versionKey: false,
    toJSON: {
      virtuals: true,
      getters: true,
      versionKey: false,
    },
    toObject: {
      virtuals: true,
      getters: true,
      versionKey: false,
    },
  },
}
