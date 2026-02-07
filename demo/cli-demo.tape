# RaffleBot CLI Demo
# VHS tape file — https://github.com/charmbracelet/vhs

Output demo/cli-demo.mp4

Set Shell bash
Set FontFamily "JetBrains Mono"
Set FontSize 20
Set Width 1920
Set Height 1080
Set Padding 40
Set Theme "Catppuccin Mocha"
Set TypingSpeed 45ms
Set CursorBlink false

# Custom prompt via env
Env PS1 "\033[1;35mrafflebot\033[0m \033[1;34m$\033[0m "

# --- Scene 1: List existing raffles ---
Sleep 1s
Type "# List active raffles"
Enter
Sleep 500ms
Type "./demo/fake-cli.sh list-before"
Enter
Sleep 4s

# --- Scene 2: Create a new raffle ---
Type "# Create a new raffle with Switchboard VRF"
Enter
Sleep 500ms
Type "./demo/fake-cli.sh create"
Enter
Sleep 7s

# --- Scene 3: List again — new raffle appears ---
Type "# List again — our new raffle is live"
Enter
Sleep 500ms
Type "./demo/fake-cli.sh list-after"
Enter
Sleep 4s

# --- Scene 4: Status overview ---
Type "# Check system status"
Enter
Sleep 500ms
Type "./demo/fake-cli.sh status"
Enter
Sleep 5s
