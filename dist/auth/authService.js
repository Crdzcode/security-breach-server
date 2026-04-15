"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUser = findUser;
exports.availableLogins = availableLogins;
exports.isAdmin = isAdmin;
const users_1 = require("./users");
function findUser(codename, password) {
    const user = users_1.USERS_MAP.get(codename.toLowerCase());
    if (!user)
        return { user: null, error: 'not_found' };
    if (user.password !== password)
        return { user: null, error: 'wrong_password' };
    return { user, error: null };
}
function availableLogins() {
    return users_1.USERS.filter((u) => u.role === 'player').map((u) => u.codename);
}
function isAdmin(user) {
    return user.role === 'admin';
}
