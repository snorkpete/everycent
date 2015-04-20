#!/usr/bin/env bash

#echo "updating apt-get..."
#apt-get update >/dev/null 2>&1
#apt-get install -y apache2 >/dev/null 2>&1
#rm -rf /var/www
#ln -fs /vagrant /var/www


echo "updating apt-get..."
apt-get update
apt-get install -y git-core curl zlib1g-dev build-essential libssl-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev python-software-properties libffi-dev

echo "installing git..."
apt-get install -y git
git config --global user.name "Kion Stephen (work)"
git config --global user.email "kion.stephen@myguardiangroup.com"

echo "installing rbenv..."
git clone https://github.com/sstephenson/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc

echo "installing ruby-build..."
git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build

echo "installing ruby 2.2.1..."
rbenv install 2.2.1

