module.exports = class MyUseClass {
  use({ properties }) {
    const r = Number(properties.radius);
    return {
      title: properties.title,
      get area() {
        return Math.round(4 * Math.PI * r * r);
      }
    };
  }
};
