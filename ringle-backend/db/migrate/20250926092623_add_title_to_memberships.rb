class AddTitleToMemberships < ActiveRecord::Migration[7.2]
  def change
    add_column :memberships, :title, :string, null: false, default: ''
  end
end
