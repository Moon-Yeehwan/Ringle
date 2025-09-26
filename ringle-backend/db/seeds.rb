Membership.create!([
  { name: "Basic 30",   days: 30, can_learn: true,  can_chat: false, can_analyze: false },
  { name: "Premium 60", days: 60, can_learn: true,  can_chat: true,  can_analyze: true }
])
User.find_or_create_by!(email: "demo@ringle.test")
