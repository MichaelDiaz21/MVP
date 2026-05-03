function getUserInfo(user) {
  return {
    id: user.id || user._id,
    username: user.username,
    name: user.name,
    role: user.role,
    city: user.city,
    cityName: user.cityName,
  };
}

module.exports = getUserInfo;