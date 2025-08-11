
// Allow only if user role is in allowedRoles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
//     console.log("User Role:", req.user.role);
// console.log("Allowed Roles:", allowedRoles);

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to access this route" });
    }
    next();
  };
};


export default authorizeRoles