## Intro
Example of control plane based on BigConfig.

``` sh
# Add the control plane as tool to Clojure
clojure -Ttools install big-config/control-plane '{:git/sha "aff7c186999c19ad2b4f07752abd13ec5b3b6651" :git/url "https://github.com/amiorin/big-config.git"}' :as ctlp

# Print the help of the control plane cli
clojure -Tctlp help
```
