class CreateMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :memberships do |t|
      t.string :name
      t.integer :days
      t.boolean :can_learn
      t.boolean :can_chat
      t.boolean :can_analyze

      t.timestamps
    end
  end
end
