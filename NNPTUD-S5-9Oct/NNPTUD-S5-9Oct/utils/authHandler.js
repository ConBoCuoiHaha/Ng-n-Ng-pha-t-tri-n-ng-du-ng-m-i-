let { Response } = require('./responseHandler')
let jwt = require("jsonwebtoken")
let users = require('../schemas/users')

module.exports = {
    Authentication: async function (req, res, next) {
        try {
            let token = req.headers.authorization ? req.headers.authorization : req.cookies.token;
            
            if (!token) {
                return Response(res, 401, false, "Access token is required");
            }
            
            if (token.startsWith("Bearer ")) {
                token = token.split(" ")[1];
            }
            
            // Verify token
            const decoded = jwt.verify(token, "NNPTUD");
            
            // Check if token is expired
            if (decoded.exp < Date.now() / 1000) {
                return Response(res, 401, false, "Token has expired");
            }
            
            // Check if user exists and is not deleted
            let user = await users.findById(decoded._id);
            if (!user || user.isDeleted) {
                return Response(res, 401, false, "User not found or deleted");
            }
            
            req.userId = decoded._id;
            next();
        } catch (error) {
            Response(res, 401, false, "Invalid token");
        }
    },
    Authorization: function (...roleRequire) {
        return async function (req, res, next) {
            try {
                let userId = req.userId;
                let user = await users.findById(userId).populate({
                    path: 'role',
                    select: 'name'
                });
                
                if (!user || !user.role) {
                    return Response(res, 403, false, "User role not found");
                }
                
                let role = user.role.name;
                if (roleRequire.includes(role)) {
                    next();
                } else {
                    Response(res, 403, false, "Insufficient permissions. Required roles: " + roleRequire.join(", "));
                }
            } catch (error) {
                Response(res, 403, false, "Authorization error: " + error.message);
            }
        }
    }
}