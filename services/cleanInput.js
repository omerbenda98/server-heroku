module.exports = (data) => {
  for (let [key, value] of Object.entries(data)) {
    if (!value) {
      delete data[key];
    }
  }
  return data;
};
