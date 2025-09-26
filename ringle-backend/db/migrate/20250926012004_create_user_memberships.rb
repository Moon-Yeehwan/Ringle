class CreateUserMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :user_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :membership, null: false, foreign_key: true
      t.date :starts_on
      t.date :ends_on

      t.timestamps
    end
  end
end
