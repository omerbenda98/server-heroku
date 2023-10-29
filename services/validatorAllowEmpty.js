module.exports = (minLength, type = "string") => {
  return (value) => {
    if (value === null || value === "") return true;
    switch (type) {
      case "number":
        let convertedValue = +value;
        if (isNaN(convertedValue)) {
          return false;
        } else {
          return value >= minLength;
        }
      default:
      case "string":
        return value.length >= minLength;
    }
  };
};
