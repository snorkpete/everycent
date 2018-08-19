# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
#

# Create a household using a random ID
# Seeding this way can then allow for easier migrations later
household_id = 1 + rand(1000)
Household.create id: household_id, name: "Household ##{household_id}"

# create default users
# These users will need further configuration
User.create(provider: 'email',
            uid: 'kion.stephen@gmail.com',
            first_name: 'Kion',
            last_name: 'Stephen',
            email: 'kion.stephen@gmail.com',
            household_id: household_id)
User.create(provider: 'email',
            uid: 'patrice.stephen@gmail.com',
            first_name: 'Patrice',
            last_name: 'Stephen',
            email: 'patrice.stephen@gmail.com',
            household_id: household_id)
