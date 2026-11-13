export const toUserDto = (user) => ({
  id: user._id.toString(),
  email: user.email,
});
