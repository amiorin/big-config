<h1 align=center><code>BigConfig</code></a></h1>

BigConfig is a workflow and a template engine that enables you to have a
zero-cost build step before running any CLI tool like GNU Make, Terraform, Kubectl, Helm, Kustomize, and Ansible.

# Install
From the <a href="https://www.big-config.it/start-here/getting-started/">Getting Started</a>

``` shell
# Add big-config as tool to Clojure
clojure -Ttools install-latest :lib io.github.amiorin/big-config :as big-config

# Print the help of all templates
clojure -A:deps -Tbig-config help/doc

# Invoke one of the templates with your options
clojure -Tbig-config terraform
```
