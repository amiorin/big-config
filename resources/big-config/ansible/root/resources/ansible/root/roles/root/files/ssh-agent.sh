if [[ -n "$SSH_AUTH_SOCK" ]]; then
    ln -sf "$SSH_AUTH_SOCK" "/tmp/$(whoami)@$(hostname).agent"
fi
