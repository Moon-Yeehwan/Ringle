class AddMembershipAndUserMembershipFields < ActiveRecord::Migration[7.2]
  def up
    # memberships: 기능 조합 + 기간(일)
    add_column :memberships, :features, :json, null: false, default: []
    add_column :memberships, :duration_days, :integer, null: false, default: 30

    # user_memberships: 만료일 (우선 NULL 허용으로 추가)
    add_column :user_memberships, :expires_at, :datetime, null: true, precision: 6
    add_index  :user_memberships, :expires_at

    # ---- 백필(backfill) ----
    say_with_time "Backfilling user_memberships.expires_at" do
      UserMembership.reset_column_information
      Membership.reset_column_information

      UserMembership.find_each do |um|
        days = um.membership&.duration_days || 30
        base = um.created_at || Time.current
        um.update_columns(expires_at: base + days.days)
      end
    end

    # 이제 NOT NULL로 전환
    change_column_null :user_memberships, :expires_at, false
  end

  def down
    remove_index  :user_memberships, :expires_at
    remove_column :user_memberships, :expires_at

    remove_column :memberships, :duration_days
    remove_column :memberships, :features
  end
end
