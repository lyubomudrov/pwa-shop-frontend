// utils/user.js
export function getUserId() {
  let userId = localStorage.getItem('userId')
  if (!userId) {
    userId = Date.now() // просто уникальное число
    localStorage.setItem('userId', userId)
  }
  return userId
}
