// No accounts in this version: everyone is the local user and ideas stay on the device.
const LOCAL_USER = { name: '' }

const signup = () => Promise.resolve()
const login = () => Promise.resolve()
const getUser = () => LOCAL_USER
const logout = () => {}

export default {
    signup,
    getUser,
    logout,
    login,
}
