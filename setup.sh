#!/bin/bash

UUID="crypto@alipirpiran.github"
HOME_DIR="$HOME"

if [ ! -z $1 ]; then
  HOME_DIR="$1"
fi

echo $HOME_DIR

mkdir -p "$HOME_DIR/.local/share/gnome-shell/extensions/$UUID"
cp -r ./* "$HOME_DIR/.local/share/gnome-shell/extensions/$UUID/"

gnome-extensions enable "$UUID"
