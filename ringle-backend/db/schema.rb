# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_26_092623) do
  create_table "memberships", force: :cascade do |t|
    t.string "name"
    t.integer "days"
    t.boolean "can_learn"
    t.boolean "can_chat"
    t.boolean "can_analyze"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "features", default: [], null: false
    t.integer "duration_days", default: 30, null: false
    t.string "title", default: "", null: false
  end

  create_table "notes", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_memberships", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "membership_id", null: false
    t.date "starts_on"
    t.date "ends_on"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "expires_at", null: false
    t.index ["expires_at"], name: "index_user_memberships_on_expires_at"
    t.index ["membership_id"], name: "index_user_memberships_on_membership_id"
    t.index ["user_id"], name: "index_user_memberships_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "user_memberships", "memberships"
  add_foreign_key "user_memberships", "users"
end
