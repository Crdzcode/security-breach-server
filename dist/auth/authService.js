"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUser = findUser;
exports.isAdmin = isAdmin;
const users_1 = require("./users");
function findUser(codename, password) {
    const user = users_1.USERS_MAP.get(codename.toLowerCase());
    if (!user)
        return null;
    if (user.password !== password)
        return null;
    return user;
}
function isAdmin(user) {
    return user.role === 'admin';
}
