#!/bin/sh

# List of node commands (replace with your actual commands)
NODES=(
  "node server/kitchen.js plate"
  "node server/kitchen.js vegetable vegetable"
  "node server/kitchen.js meat meat"
  "node server/kitchen.js fish fish"
)


# Function to start nodes in new tmux panes
start_nodes() {
  # Create a new tmux session
  tmux new-session -d -s mynodes

  # Loop through the node commands and create a pane for each one
  local i=0
  for node_command in "${NODES[@]}"; do
    if [ $i -eq 0 ]; then
      tmux send-keys "$node_command" C-m  # First command runs in the first pane
    else
      tmux split-window -v  # Split vertically for new panes
      tmux send-keys "$node_command" C-m
    fi
    i=$((i + 1))
  done

  # Adjust layout and attach to session
  tmux select-layout tiled
  tmux attach-session -t mynodes
}

# Function to kill the tmux session
stop_nodes() {
  tmux kill-session -t mynodes
}

case "$1" in
  start)
    start_nodes
    ;;
  stop)
    stop_nodes
    ;;
  *)
    echo "Usage: $0 {start|stop}"
    ;;
esac
