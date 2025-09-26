basic = Membership.find_or_create_by!(title: 'Basic') do |m|
  m.features = %w[learn]
  m.duration_days = 30
end

premium = Membership.find_or_create_by!(title: 'Premium') do |m|
  m.features = %w[learn chat analyze]
  m.duration_days = 60
end

user = User.first || User.create!(email: 'demo@ringle.test')

UserMembership.find_or_create_by!(user: user, membership: premium) do |um|
  um.expires_at = Time.current + premium.duration_days.days
end
